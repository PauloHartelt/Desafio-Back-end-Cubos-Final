CREATE DATABASE
  pdv;

DROP TABLE
  IF EXISTS usuarios;

CREATE TABLE IF NOT EXISTS
  usuarios (
    id SERIAL PRIMARY KEY NOT NULL,
    nome TEXT,
    email TEXT UNIQUE,
    senha TEXT
  );

DROP TABLE
  IF EXISTS categorias;

CREATE TABLE IF NOT EXISTS
  categorias (id SERIAL PRIMARY KEY NOT NULL, descricao TEXT);

INSERT INTO
  categorias (descricao)
VALUES
  ('Informática'),
  ('Celulares'),
  ('Beleza e Perfumaria'),
  ('Mercado'),
  ('Livros e Papelaria'),
  ('Brinquedos'),
  ('Moda'),
  ('Bebê'),
  ('Games');

DROP TABLE
  IF EXISTS produtos;

CREATE TABLE IF NOT EXISTS 
  produtos (
    id SERIAL PRIMARY KEY NOT NULL,
    descricao TEXT NOT NULL,
    quantidade_estoque INTEGER NOT NULL,
    valor INTEGER,
    categoria_id INTEGER REFERENCES categorias(id),
    produto_imagem TEXT
);

DROP TABLE
  IF EXISTS clientes;

CREATE TABLE IF NOT EXISTS
  clientes (
    id  SERIAL PRIMARY KEY NOT NULL,
    nome TEXT NOT NULL,
    email  TEXT NOT NULL UNIQUE,
    cpf  VARCHAR(11) NOT NULL UNIQUE,
    cep VARCHAR(8),
    rua TEXT,
    numero TEXT,
    bairro TEXT,
    cidade TEXT,
    estado VARCHAR(2) CHECK (
      estado IN (
          'AC',
          'AL',
          'AP',
          'AM',
          'BA',
          'CE',
          'DF',
          'ES',
          'GO',
          'MA',
          'MT',
          'MS',
          'MG',
          'PA',
          'PB',
          'PR',
          'PE',
          'PI',
          'RJ',
          'RN',
          'RS',
          'RO',
          'RR',
          'SC',
          'SP',
          'SE',
          'TO'
      )
    )
);

DROP TABLE
  IF EXISTS pedidos;

CREATE TABLE IF NOT EXISTS 
  pedidos (
    id SERIAL PRIMARY KEY NOT NULL,
    cliente_id INTEGER REFERENCES clientes(id),
    observacao TEXT,
    valor_total INTEGER
);

DROP TABLE
  IF EXISTS pedido_produtos;

CREATE TABLE IF NOT EXISTS 
  pedido_produtos (
    id SERIAL PRIMARY KEY NOT NULL,
    pedido_id INTEGER REFERENCES pedidos(id),
    produto_id INTEGER REFERENCES produtos(id),
    quantidade_produto INTEGER,
    valor_produto INTEGER
);