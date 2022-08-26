const { knex } = require('../conection');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const transporter = require('../nodemailer');

const { displayError, runResponse, toFind } = require('../supplements');

const {
  userValidation,
  loginValidation,
  passwordValidation
} = require('../validations/yupSchema');

const registerUser = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    await userValidation.validate(req.body);
  } catch (error) {
    displayError(error, res);
  }
  try {
    const user = await knex('usuarios').where({ email }).first();

    if (user) {
      return runResponse(404, 'Esse email já foi cadastrado', res);
    }
    const encryptedPassword = await bcrypt.hash(senha, 10);

    const registration = await knex('usuarios')
      .insert({
        nome,
        email,
        senha: encryptedPassword
      })
      .returning(['nome', 'email']);

    if (!registration) {
      return runResponse(500, 'Não foi possível cadastrar esse usuário', res);
    }

    return runResponse(201, 'Usuário cadastrado com sucesso.', res);
  } catch (error) {
    displayError(error, res);
  }
};
const userLogin = async (req, res) => {
  const { email, senha } = req.body;

  try {
    await loginValidation.validate(req.body);
  } catch (error) {
    displayError(error, res);
  }
  try {
    const userFound = await toFind('usuarios', 'email', email);
    if (userFound.length === 0) {
      return runResponse(404, 'Nenhum usuário encontrado.', res);
    }
    let user = userFound[0];

    const verifiedPassword = await bcrypt.compare(senha, userFound[0].senha);

    if (userFound[0].email !== email || !verifiedPassword) {
      return runResponse(404, 'Usuário e/ou senha inválido(s).', res);
    }
    let { senha: password, ...userWithoutPassword } = user;
    const token = jwt.sign(
      {
        id: user.id,
        nome: userFound[0].nome,
        email: userFound[0].email
      },
      process.env.API_SECRET,
      {
        expiresIn: '1h'
      }
    );
    return res.status(200).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    displayError(error, res);
  }
};

const updatePassword = async (req, res) => {
  const { nome, email, senha_antiga, senha_nova } = req.body;

  try {
    await passwordValidation.validate(req.body);
  } catch (error) {
    displayError(error, res);
  }
  try {
    if (senha_nova === senha_antiga) {
      return runResponse(400, 'A nova senha não pode ser igual à antiga', res);
    }
    const userFound = await toFind('usuarios', 'email', email);
    if (userFound.length === 0) {
      return runResponse(404, 'Nenhum usuário encontrado.', res);
    }
    const verifiedPassword = await bcrypt.compare(
      senha_antiga,
      userFound[0].senha
    );
    if (userFound[0].email !== email || !verifiedPassword) {
      return runResponse(404, 'Usuário e/ou senha inválido(s).', res);
    }
    const encryptedPassword = await bcrypt.hash(senha_nova, 10);

    const updatePassword = await knex('usuarios')
      .where({ email })
      .update({ senha: encryptedPassword });

    const sendingEmail = {
      from: 'FORever Innovations <noreply@foreverinnovations.com.br>',
      to: email,
      subject: 'Sua senha alterada foi alterada com sucesso',
      template: 'updatePassword',
      context: {
        nome,
        email
      }
    };
    transporter.sendMail(sendingEmail);
    if (updatePassword === 0) {
      return runResponse(
        400,
        'Senha não pôde ser alterada. Tente novamente.',
        res
      );
    }
    return runResponse(201, 'Senha alterada com sucesso.', res);
  } catch (error) {
    displayError(error, res);
  }
};
const detailUser = async (req, res) => {
  const { usuario } = req;
  if (!usuario) {
    return runResponse(
      401,
      'Para acessar este recurso um token de autenticação válido deve ser enviado.',
      res
    );
  }
  try {
    return res.status(200).json(usuario);
  } catch (error) {
    displayError(error, res);
  }
};

const updateUser = async (req, res) => {
  const { usuario } = req;
  const { nome, email, senha } = req.body;
  if (!usuario) {
    return runResponse(
      401,
      'Para acessar este recurso um token de autenticação válido deve ser enviado.',
      res
    );
  }
  try {
    await userValidation.validate(req.body);
  } catch (error) {
    displayError(error, res);
  }
  try {
    const userFound = await toFind('usuarios', 'email', email);

    if (userFound.length > 0) {
      return runResponse(404, 'Já existe um usuário com este email', res);
    }
    const encryptedPassword = await bcrypt.hash(senha, 10);

    const updateUser = await knex('usuarios').where({ id: usuario.id }).update({
      nome,
      email,
      senha: encryptedPassword
    });
    if (!updateUser) {
      return runResponse(500, 'Não foi possível atualizar o usuário', res);
    }
    return runResponse(200, 'Usuário atualizado com sucesso.', res);
  } catch (error) {
    displayError(error, res);
  }
};

module.exports = {
  registerUser,
  userLogin,
  updatePassword,
  runResponse,
  displayError,
  detailUser,
  updateUser
};
