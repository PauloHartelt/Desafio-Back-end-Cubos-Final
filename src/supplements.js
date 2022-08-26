const { knex } = require('./conection');

function displayError(error, res) {
  return res.status(500).json({
    mensagem: error.message
  });
}
function runResponse(statusCode, message, res) {
  return res.status(statusCode).json({
    mensagem: message
  });
}
const toFind = async (tabela, campo, valor) => {
  return await knex(tabela).where(campo, valor);
};

module.exports = { displayError, runResponse, toFind };
