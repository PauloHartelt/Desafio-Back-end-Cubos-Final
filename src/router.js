const express = require('express');

const {
  registerUser,
  userLogin,
  updatePassword,
  detailUser,
  updateUser
} = require('./controllers/users');

const { listCategories } = require('./controllers/categories');

const {
  registerProduct,
  detailProduct,
  listProducts,
  updateProduct,
  deleteProduct
} = require('./controllers/products');

const {
  registerClient,
  updateClient,
  listClients,
  detailClient
} = require('./controllers/customers');

const { uploadImage } = require('./controllers/uploads');

const { registerOrder, listOrders } = require('./controllers/orders');

const { authenticator } = require('./middleware/authenticator');

const router = express();

router.post('/usuario', registerUser);

router.get('/categoria', listCategories);

router.post('/login', userLogin);

router.patch('/usuario/redefinir', updatePassword);

router.use(authenticator);

router.get('/usuario', detailUser);

router.put('/usuario', updateUser);

router.post('/upload', uploadImage);

router.post('/produto', registerProduct);

router.put('/produto/:id', updateProduct);

router.get('/produto', listProducts);

router.get('/produto/:id', detailProduct);

router.delete('/produto/:id', deleteProduct);

router.post('/cliente', registerClient);

router.put('/cliente/:id', updateClient);

router.get('/cliente', listClients);

router.get('/cliente/:id', detailClient);

router.post('/pedido', registerOrder);

router.get('/pedido', listOrders);

module.exports = router;
