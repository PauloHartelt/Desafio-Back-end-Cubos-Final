const yup = require('./yup');

const userValidation = yup.object().shape({
  nome: yup.string().required(),
  email: yup.string().email().required(),
  senha: yup
    .string()
    .required()
    .min(6)
    .trim('O campo senha precisa ter caracteres válidos')
});

const loginValidation = yup.object().shape({
  email: yup.string().email().required(),
  senha: yup.string().required().min(6)
});

const passwordValidation = yup.object().shape({
  nome: yup.string().required(),
  email: yup.string().email().required(),
  senha_antiga: yup.string().required(),
  senha_nova: yup.string().required().min(6)
});

const clientValidation = yup.object().shape({
  nome: yup.string().required(),
  email: yup.string().email().required(),
  cpf: yup.string().required().max(11),
  cep: yup.string().max(8),
  rua: yup.string(),
  numero: yup.string(),
  bairro: yup.string(),
  cidade: yup.string(),
  estado: yup
    .string()
    .uppercase('O campo estado precisa ter duas letras maiúsculas')
    .max(2)
});

const productValidation = yup.object().shape({
  descricao: yup.string().required(),
  quantidade_estoque: yup.number().required().positive(),
  valor: yup.number().required().positive(),
  categoria_id: yup.number().required(),
  produto_imagem: yup.string().nullable()
});

const orderValidation = yup.object().shape({
  cliente_id: yup.string().required(),
  observacao: yup.string(),
  pedido_produtos: yup
    .array(
      yup.object().shape({
        produto_id: yup.number().strict().required().positive(),
        quantidade_produto: yup.number().strict().required().positive()
      })
    )
    .required()
    .min(1)
});

module.exports = {
  userValidation,
  loginValidation,
  passwordValidation,
  clientValidation,
  productValidation,
  orderValidation
};
