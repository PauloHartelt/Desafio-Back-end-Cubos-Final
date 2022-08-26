const { knex } = require('../conection');
const { displayError, runResponse, toFind } = require('../supplements');
const { clientValidation } = require('../validations/yupSchema');

const registerClient = async (req, res) => {
  const { email, cpf, cep } = req.body;

  if (cep) {
    if (cep.includes('-')) {
      return runResponse(400, 'Insira o cep sem o separador', res);
    }
  }
  try {
    await clientValidation.validate(req.body);
    if (cpf.includes('-') || cpf.includes('.')) {
      return runResponse(400, 'Insira somente números no cpf', res);
    }
  } catch (error) {
    displayError(error, res);
  }
  try {
    const clientFoundByEmail = await toFind('clientes', 'email', email);

    if (clientFoundByEmail.length > 0) {
      return runResponse(404, 'Já existe um usuário com este email', res);
    }
    const clientFoundByCpf = await toFind('clientes', 'cpf', cpf);

    if (clientFoundByCpf.length > 0) {
      return runResponse(404, 'Já existe um usuário com este cpf', res);
    }
    const newClient = await knex('clientes').insert({
      ...req.body
    });
    if (!newClient) {
      return runResponse(400, 'Não foi possível cadastrar o produto', res);
    }
    return runResponse(201, 'Cliente cadastrado com sucesso.', res);
  } catch (error) {
    displayError(error, res);
  }
};
const updateClient = async (req, res) => {
  const { id } = req.params;
  const { email, cpf, cep } = req.body;

  if (!Number(id)) {
    return runResponse(
      400,
      'O id precisa ser um número e diferente de zero',
      res
    );
  }
  if (cpf.includes('-') || cpf.includes('.')) {
    return runResponse(400, 'Insira somente números no cpf', res);
  }
  if (cep) {
    if (cep.includes('-')) {
      return runResponse(400, 'Insira o cep sem o separador', res);
    } else if (cep.length !== 8) {
      return runResponse(400, 'O campo cep precisa ter 8 caracteres', res);
    }
  }

  try {
    await clientValidation.validate(req.body);
  } catch (error) {
    displayError(error, res);
  }
  try {
    const clientFoundById = await toFind('clientes', 'id', id);

    if (!clientFoundById.length) {
      return runResponse(404, 'Não existe um cliente com este id', res);
    }
    const clientFoundByEmail = await toFind('clientes', 'email', email);

    if (
      clientFoundByEmail.length > 0 &&
      clientFoundByEmail[0].id !== Number(id)
    ) {
      return runResponse(404, 'Já existe um cliente com este email', res);
    }
    const clientFoundByCpf = await toFind('clientes', 'cpf', cpf);

    if (clientFoundByCpf.length > 0 && clientFoundByCpf[0].id !== Number(id)) {
      return runResponse(404, 'Já existe um cliente com este cpf', res);
    }
    const updateClient = await knex('clientes')
      .where({ id })
      .update({
        ...req.body
      });
    if (!updateClient) {
      return runResponse(500, 'Não foi possível atualizar o cliente', res);
    }
    return runResponse(201, 'Cliente atualizado com sucesso.', res);
  } catch (error) {
    displayError(error, res);
  }
};
const listClients = async (req, res) => {
  try {
    const searchClients = await knex('clientes');

    return res.status(200).json(searchClients);
  } catch (error) {
    displayError(error, res);
  }
};
const detailClient = async (req, res) => {
  const { id } = req.params;

  if (!Number(id)) {
    return runResponse(
      400,
      'O id precisa ser um número e diferente de zero',
      res
    );
  }
  try {
    const clientFoundById = await toFind('clientes', 'id', id);

    if (!clientFoundById.length) {
      return runResponse(404, 'Não existe um cliente com este id', res);
    }
    return res.status(200).json(clientFoundById[0]);
  } catch (error) {
    displayError(error, res);
  }
};
module.exports = { registerClient, updateClient, listClients, detailClient };
