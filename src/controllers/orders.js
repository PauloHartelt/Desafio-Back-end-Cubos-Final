const { knex } = require('../conection');
const { displayError, runResponse, toFind } = require('../supplements');
const { orderValidation } = require('../validations/yupSchema');

const registerOrder = async (req, res) => {
  const { cliente_id, observacao, pedido_produtos } = req.body;
  try {
    await orderValidation.validate(req.body);
    const clientFoundById = await toFind('clientes', 'id', cliente_id);

    if (!clientFoundById[0]) {
      return runResponse(400, 'Cliente não encontrado', res);
    }
    let subtraction = 0;
    let valor_total = 0;

    for (const item of pedido_produtos) {
      const productFoundById = await toFind('produtos', 'id', item.produto_id);

      if (productFoundById.length === 0) {
        return runResponse(
          400,
          `Não existe produto com  o id ${item.produto_id}.`,
          res
        );
      }
      if (productFoundById[0].quantidade_estoque < item.quantidade_produto) {
        return runResponse(
          400,
          ` Não há estoque suficiente - produto com quantidade inferior a ${item.quantidade_produto} unidades.`,
          res
        );
      }

      subtraction =
        productFoundById[0].quantidade_estoque - item.quantidade_produto;
      const updateStorage = await knex('produtos')
        .where({ id: item.produto_id })
        .update({ quantidade_estoque: subtraction });

      if (!updateStorage) {
        return runResponse(500, 'Não foi possível atualizar o estoque', res);
      }

      valor_total += productFoundById[0].valor;
    }
    const registerTablePedidos = await knex('pedidos').insert({
      cliente_id,
      observacao,
      valor_total
    });
    if (!registerTablePedidos) {
      return runResponse(500, 'Não foi possível atualizar os pedidos', res);
    }

    const orderFoundById = await toFind('pedidos', 'cliente_id', cliente_id);

    for (const item of pedido_produtos) {
      const productFoundById = await toFind('produtos', 'id', item.produto_id);
      let pedido_id = orderFoundById[orderFoundById.length - 1].id;

      const newOrder = await knex('pedido_produtos').insert({
        pedido_id,
        produto_id: item.produto_id,
        quantidade_produto: item.quantidade_produto,
        valor_produto: productFoundById[0].valor
      });
      if (!newOrder) {
        return runResponse(
          500,
          'Não foi possível atualizar os produtos dos pedidos',
          res
        );
      }
    }
  } catch (error) {
    return displayError(error, res);
  }
  return runResponse(201, 'Pedido cadastrado com sucesso', res);
};

const listOrders = async (req, res) => {
  const { cliente_id } = req.query;
  try {
    if (cliente_id) {
      const clientFoundById = await toFind('clientes', 'id', cliente_id);
      if (!clientFoundById) {
        return runResponse(404, 'Cliente não encontrado', res);
      } else {
        const orderFoundByCategory = await toFind(
          'pedidos',
          'cliente_id',
          cliente_id
        );
        let orderList = [];

        for (const order of orderFoundByCategory) {
          const productOrderFound = await toFind(
            'pedido_produtos',
            'pedido_id',
            order.id
          );
          let orderForm = {
            pedido: {
              id: order.id,
              valor_total: order.valor_total,
              observacao: order.observacao,
              cliente_id
            },
            pedido_produtos: [...productOrderFound]
          };
          orderList.push(orderForm);
        }
        return res.status(200).json(orderList);
      }
    } else {
      const foundOrder = await knex('pedidos');
      if (!foundOrder) {
        return runResponse(404, 'Pedidos não encontrados', res);
      }
      let orderList = [];
      for (const order of foundOrder) {
        const productOrderFound = await toFind(
          'pedido_produtos',
          'pedido_id',
          order.id
        );
        let orderForm = {
          pedido: {
            id: order.id,
            valor_total: order.valor_total,
            observacao: order.observacao
          },
          pedido_produtos: [...productOrderFound]
        };
        orderList.push(orderForm);
      }
      return res.status(200).json(orderList);
    }
  } catch (error) {
    displayError(error, res);
  }
};
module.exports = {
  registerOrder,
  listOrders
};
