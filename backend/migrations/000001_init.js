/* Migration inicial: cria tabelas principais se não existem */
/* eslint-disable */
exports.shorthands = undefined;

exports.up = pgm => {
  // usuários
  pgm.sql(`CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin'
  );`);

  // clientes
  pgm.sql(`CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    telefone TEXT UNIQUE NOT NULL,
    email TEXT
  );`);

  // profissionais
  pgm.sql(`CREATE TABLE IF NOT EXISTS profissionais (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    avatar TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
  );`);

  // servicos
  pgm.sql(`CREATE TABLE IF NOT EXISTS servicos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    tempo TEXT NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    imagem TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
  );`);

  // agendamentos
  pgm.sql(`CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    nome TEXT,
    telefone TEXT,
    servico TEXT,
    profissional TEXT,
    data DATE,
    hora TEXT,
    preco NUMERIC(10,2),
    status TEXT DEFAULT 'confirmado'
  );`);

  // notificacoes
  pgm.sql(`CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    data TIMESTAMP NOT NULL
  );`);

  // barbearia
  pgm.sql(`CREATE TABLE IF NOT EXISTS barbearia (
    id SERIAL PRIMARY KEY,
    nome TEXT,
    endereco TEXT,
    cidade_estado TEXT,
    whatsapp TEXT,
    instagram TEXT,
    foto TEXT,
    email_notificacao TEXT,
    wallpaper_id INTEGER
  );`);

  // wallpapers
  pgm.sql(`CREATE TABLE IF NOT EXISTS wallpapers (
    id SERIAL PRIMARY KEY,
    url TEXT,
    ativo BOOLEAN DEFAULT TRUE
  );`);

  // folgas especiais
  pgm.sql(`CREATE TABLE IF NOT EXISTS folgas_especiais (
    id SERIAL PRIMARY KEY,
    data DATE UNIQUE NOT NULL,
    motivo TEXT
  );`);

  // horarios_turnos
  pgm.sql(`CREATE TABLE IF NOT EXISTS horarios_turnos (
    id SERIAL PRIMARY KEY,
    dia_semana TEXT NOT NULL,
    turno_inicio TEXT NOT NULL,
    turno_fim TEXT NOT NULL
  );`);

  // lembretes_enviados
  pgm.sql(`CREATE TABLE IF NOT EXISTS lembretes_enviados (
    id SERIAL PRIMARY KEY,
    agendamento_id INTEGER NOT NULL,
    enviado_em TIMESTAMP NOT NULL
  );`);

  // servico_imagens
  pgm.sql(`CREATE TABLE IF NOT EXISTS servico_imagens (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
  );`);

  // seed mínimo admin
  pgm.sql(`INSERT INTO usuarios (username, password, role)
           SELECT 'admin', 'admin', 'admin'
           WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username='admin');`);
};

exports.down = pgm => {
  // Opcional: não derruba dados em produção; deixar vazio ou remover tabelas na ordem inversa.
};
