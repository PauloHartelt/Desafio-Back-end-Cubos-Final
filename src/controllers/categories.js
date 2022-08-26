const { knex } = require('../conection');
const { displayError } = require('../supplements');

const listCategories = async (req, res) => {
  try {
    const categories = await knex('categorias');

    return res.json(categories);
  } catch (error) {
    displayError(error, res);
  }
};
module.exports = { listCategories };
