const { knex } = require('../conection');
const { displayError, runResponse, toFind } = require('../supplements');
const { productValidation } = require('../validations/yupSchema');
const supabase = require('../supabase.js');

const registerProduct = async (req, res) => {
  const { descricao, quantidade_estoque, valor, categoria_id, produto_imagem } =
    req.body;

  try {
    await productValidation.validate(req.body);
    let publicURL = null;

    if (produto_imagem) {
      const imageURL = supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .getPublicUrl(`${produto_imagem}.jpeg`);

      publicURL = imageURL.publicURL;
    }
    const categoryFoundById = await toFind('categorias', 'id', categoria_id);

    if (categoryFoundById.length === 0) {
      return runResponse(404, 'Categoria não encontrada', res);
    }
    const newProduct = await knex('produtos').insert({
      descricao,
      quantidade_estoque,
      valor,
      categoria_id,
      produto_imagem: publicURL
    });
    if (!newProduct) {
      return runResponse(400, 'Não foi possível cadastrar o produto', res);
    }
    return runResponse(201, 'Produto cadastrado com sucesso', res);
  } catch (error) {
    displayError(error, res);
  }
};
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { descricao, quantidade_estoque, valor, categoria_id, produto_imagem } =
    req.body;

  try {
    await productValidation.validate(req.body);

    if (!Number(id)) {
      return runResponse(
        400,
        'O id precisa ser um número e diferente de zero',
        res
      );
    }
  } catch (error) {
    displayError(error, res);
  }
  try {
    const productFoundById = await toFind('produtos', 'id', id);

    if (!productFoundById.length) {
      return runResponse(404, 'Produto não encontrado', res);
    }
    const categoryFoundById = await toFind('categorias', 'id', categoria_id);

    if (!categoryFoundById.length) {
      return runResponse(404, 'Categoria não encontrada', res);
    }
    if (produto_imagem !== null) {
      const imageName = productFoundById[0].produto_imagem;

      let alteratedProduto_imagem = imageName.split('/');

      let URL = alteratedProduto_imagem[alteratedProduto_imagem.length - 1];

      await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([URL]);

      const updateProduct = await knex('produtos')
        .where({ id })
        .update({
          ...req.body
        });
      if (!updateProduct) {
        return runResponse(500, 'Não foi possível atualizar o produto', res);
      }
      return runResponse(200, 'Produto atualizado com sucesso', res);
    }

    if (
      produto_imagem === null &&
      productFoundById[0].produto_imagem !== null
    ) {
      const imageName = productFoundById[0].produto_imagem;

      let alteratedProduto_imagem = imageName.split('/');

      let URL = alteratedProduto_imagem[alteratedProduto_imagem.length - 1];

      await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([URL]);

      const updateProduct = await knex('produtos')
        .where({ id })
        .update({
          ...req.body
        });
      if (!updateProduct) {
        return runResponse(500, 'Não foi possível atualizar o produto', res);
      }
      return runResponse(200, 'Produto atualizado com sucesso', res);
    }
    if (
      produto_imagem === null &&
      productFoundById[0].produto_imagem === null
    ) {
      const updateProduct = await knex('produtos')
        .where({ id })
        .update({
          ...req.body
        });
      if (!updateProduct) {
        return runResponse(500, 'Não foi possível atualizar o produto', res);
      }
      return runResponse(200, 'Produto atualizado com sucesso', res);
    }
  } catch (error) {
    displayError(error, res);
  }
};

const detailProduct = async (req, res) => {
  const { id } = req.params;

  if (!Number(id)) {
    return runResponse(
      400,
      'O id precisa ser um número e diferente de zero',
      res
    );
  }
  try {
    const productFoundById = await toFind('produtos', 'id', id);
    if (!productFoundById.length) {
      return runResponse(404, 'Produto não encontrado', res);
    }
    if (!productFoundById) {
      return runResponse(404, 'Não existe um produto com este id', res);
    }
    return res.status(200).json(productFoundById[0]);
  } catch (error) {
    displayError(error, res);
  }
};
const listProducts = async (req, res) => {
  const { categoria_id } = req.query;
  try {
    if (categoria_id) {
      const categoryFoundById = await toFind('categorias', 'id', categoria_id);
      if (!categoryFoundById) {
        return runResponse(404, 'Categoria não encontrada', res);
      } else {
        const productFoundByCategory = await toFind(
          'produtos',
          'categoria_id',
          categoria_id
        );
        return res.status(200).json(productFoundByCategory);
      }
    } else {
      const foundProduct = await knex('produtos');
      if (!foundProduct) {
        return runResponse(404, 'Produtos não encontrados', res);
      }
      return res.status(200).json(foundProduct);
    }
  } catch (error) {
    displayError(error, res);
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!Number(id)) {
    return runResponse(
      400,
      'O id precisa ser um número e diferente de zero',
      res
    );
  }

  try {
    const productFoundById = await toFind('produtos', 'id', id);

    if (!productFoundById.length) {
      return runResponse(404, 'Não existe um produto com este id', res);
    }
    let imageName = productFoundById[0].produto_imagem;

    let alteratedProduto_imagem = imageName.split('/');

    let URL = `${alteratedProduto_imagem[alteratedProduto_imagem.length - 1]}`;

    await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([URL]);

    const orderFoundById = await toFind('pedido_produtos', 'produto_id', id);

    if (orderFoundById.length) {
      return runResponse(
        404,
        'Não é possível excluir esse produto, pois já está vinculado a um pedido',
        res
      );
    }
    const deleteProduct = await knex('produtos').del().where({ id });

    if (!deleteProduct) {
      return runResponse(400, 'Não foi possível remover o produto', res);
    }
    return runResponse(200, 'Produto removido com sucesso', res);
  } catch (error) {
    displayError(error, res);
  }
};

module.exports = {
  registerProduct,
  detailProduct,
  listProducts,
  updateProduct,
  deleteProduct
};
