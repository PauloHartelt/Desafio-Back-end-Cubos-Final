const { knex } = require('../conection');
const jwt = require('jsonwebtoken');
const { runResponse, displayError } = require('../supplements');

const authenticator = async (req, res, next) => {
  const { authorization } = req.headers;
  try {
    if (!authorization) {
      return runResponse(
        400,
        'Para acessar este recurso um token de autenticação válido deve ser enviado.',
        res
      );
    }
    const token = authorization.replace('Bearer', '').trim();

    const { id } = jwt.verify(token, process.env.API_SECRET);

    const authenticate = await knex('usuarios').where({ id }).first();

    if (authenticate.length === 0) {
      return runResponse(404, 'O usuário não foi encontrado', res);
    }
    const { senha, ...usuario } = authenticate;

    req.usuario = usuario;
    next();
  } catch (error) {
    if (
      error.message.includes('invalid') ||
      error.message.includes('jwt') ||
      error.message.includes('Unexpected token') ||
      error.message.includes('expired')
    ) {
      return runResponse(
        401,
        'Para acessar este recurso um token de autenticação válido deve ser enviado.',
        res
      );
    }
    displayError(error, res);
  }
};

module.exports = { authenticator };
