/* Cria tabela alertas_promos */
/* eslint-disable */
exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql(`CREATE TABLE IF NOT EXISTS alertas_promos (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    texto TEXT NOT NULL,
    imagem TEXT,
    link TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
  );`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_alertas_promos_ativo ON alertas_promos(ativo);`);
};

exports.down = pgm => {
  pgm.sql('DROP TABLE IF EXISTS alertas_promos;');
};
