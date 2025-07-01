-- scriptDB_postgres.sql
-- Banco de dados para Neon/PostgreSQL

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'user'
);

INSERT INTO usuarios (username, password, role) VALUES ('admin', '1234', 'admin') ON CONFLICT (username) DO NOTHING;

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    servico VARCHAR(100) NOT NULL,
    profissional VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    hora VARCHAR(10) NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'Ativo',
    duracao_minutos INTEGER
);

ALTER TABLE agendamentos
    ALTER COLUMN hora TYPE TIME
    USING hora::time;

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tempo VARCHAR(30) NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    imagem VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE
);

INSERT INTO servicos (nome, tempo, preco, imagem, ativo) VALUES
('Barba', '15min', 20.00, 'img/servicos/barba.jpg', TRUE),
('Corte de Cabelo', '30min', 35.00, 'img/servicos/corte-masculino.jpg', TRUE),
('Corte + Barba', '45min', 50.00, 'img/servicos/corte-barba.jpg', TRUE),
('Bigodinho', '5min', 7.00, 'img/servicos/bigodinho.jpg', TRUE),
('Colorimetria + corte', '1h:30min', 65.00, 'img/servicos/colorimetria.jpg', TRUE),
('Corte infantil', '30min', 25.00, 'img/servicos/infantil.jpg', TRUE),
('Barba raspada na máquina', '05min', 10.00, 'img/servicos/maquina.jpg', TRUE)
ON CONFLICT DO NOTHING;

-- Tabela horarios_turnos
CREATE TABLE IF NOT EXISTS horarios_turnos (
    id SERIAL PRIMARY KEY,
    dia_semana VARCHAR(20) NOT NULL,
    turno_inicio TIME NOT NULL,
    turno_fim TIME NOT NULL
);

-- Inserção de turnos para todos os dias da semana
INSERT INTO horarios_turnos (dia_semana, turno_inicio, turno_fim) VALUES
('segunda', '09:00', '18:00'),
('terca',   '09:00', '18:00'),
('quarta',  '09:00', '18:00'),
('quinta',  '09:00', '18:00'),
('sexta',   '09:00', '18:00'),
('sabado',  '09:00', '17:00'),
('domingo', '10:00', '14:00')
ON CONFLICT DO NOTHING;

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE
);

ALTER TABLE notificacoes ADD COLUMN IF NOT EXISTS data_agendamento DATE;
ALTER TABLE notificacoes ADD COLUMN IF NOT EXISTS hora_agendamento TIME;

-- Tabela de barbearias
CREATE TABLE IF NOT EXISTS barbearia (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(200) NOT NULL,
    cidade_estado VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(30) NOT NULL,
    instagram VARCHAR(100) NOT NULL,
    foto VARCHAR(255) DEFAULT NULL,
    wallpaper_id INTEGER DEFAULT NULL,
    email_notificacao VARCHAR(150) DEFAULT NULL
);

INSERT INTO barbearia (id, nome, endereco, cidade_estado, whatsapp, instagram, foto)
VALUES (1, 'Barbearia Pablo do corte', 'Av. Principal, 123 - Centro', 'São Paulo - SP', '5511999998888', 'p4blozz__', 'https://img.freepik.com/vetores-premium/polo-barber-vintage-ornament-ilustracao-vector_151511-32.jpg')
ON CONFLICT (id) DO NOTHING;

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    telefone VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(150),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de wallpapers
CREATE TABLE IF NOT EXISTS wallpapers (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    url TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);

INSERT INTO wallpapers (nome, url, ativo) VALUES
('Fundo 1', '/uploads/img/wallpappers/background1.jpg', TRUE),
('Fundo 2', '/uploads/img/wallpappers/background2.png', TRUE),
('Fundo 3', '/uploads/img/wallpappers/background3.png', TRUE),
('Fundo 4', '/uploads/img/wallpappers/background4.png', TRUE),
('Fundo 5', '/uploads/img/wallpappers/background5.jpg', TRUE),
('Fundo 6', '/uploads/img/wallpappers/background6.png', TRUE),
('Fundo 7', '/uploads/img/wallpappers/background7.png', TRUE),
('Fundo 8', '/uploads/img/wallpappers/background8.jpg', TRUE),
('Fundo 9', '/uploads/img/wallpappers/background9.png', TRUE),
('Fundo 10', '/uploads/img/wallpappers/background10.png', TRUE),
('Fundo 11', '/uploads/img/wallpappers/background11.png', TRUE),
('Fundo 12', '/uploads/img/wallpappers/background12.png', TRUE),
('Fundo 13', '/uploads/img/wallpappers/background13.png', TRUE),
('Fundo 14', '/uploads/img/wallpappers/background14.png', TRUE),
('Fundo 15', '/uploads/img/wallpappers/background15.png', TRUE),
('Fundo 16', '/uploads/img/wallpappers/background16.png', TRUE)

ON CONFLICT DO NOTHING;

-- Tabela para guardar o wallpaper selecionado pela barbearia (já incluído em barbearia)
-- ALTER TABLE barbearia ADD COLUMN wallpaper_id INTEGER DEFAULT NULL;

-- Tabela de imagens dos serviços
CREATE TABLE IF NOT EXISTS servico_imagens (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    url TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);

INSERT INTO servico_imagens (nome, url, ativo) VALUES
('no-imagem', '/uploads/img/servicos/no-imagem.png', TRUE),
('americano1', '/uploads/img/servicos/americano1.png', TRUE),
('americano2', '/uploads/img/servicos/americano2.png', TRUE),
('barba-cabelo', '/uploads/img/servicos/barba-cabelo.png', TRUE),
('barba_maquina', '/uploads/img/servicos/barba_maquina.png', TRUE),
('bigodinho', '/uploads/img/servicos/bigodinho.png', TRUE),
('colorido1', '/uploads/img/servicos/colorido1.png', TRUE),
('colorido2', '/uploads/img/servicos/colorido2.png', TRUE),
('corte-de-cabelo', '/uploads/img/servicos/corte-de-cabelo.png', TRUE),
('corte-do-jaca', '/uploads/img/servicos/corte-do-jaca.png', TRUE),
('corte-infantil', '/uploads/img/servicos/corte-infantil.png', TRUE),
('low-fade', '/uploads/img/servicos/low-fade.png', TRUE),
('moicano1', '/uploads/img/servicos/moicano1.png', TRUE),
('nevou', '/uploads/img/servicos/nevou.png', TRUE),
('pigmentacao', '/uploads/img/servicos/pigmentacao.png', TRUE),
('reflexo', '/uploads/img/servicos/reflexo.png', TRUE)
ON CONFLICT DO NOTHING;

-- Tabela de profissionais
CREATE TABLE IF NOT EXISTS profissionais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    avatar VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE
);

-- Exemplo de profissional
INSERT INTO profissionais (nome, avatar, ativo) VALUES
('Pablo barber', '/uploads/img/logo/sua-logo.png', TRUE)
ON CONFLICT DO NOTHING;


-- Criação da tabela de controle de lembretes enviados
CREATE TABLE IF NOT EXISTS lembretes_enviados (
    id SERIAL PRIMARY KEY,
    agendamento_id INTEGER NOT NULL,
    enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Adicione um índice para evitar duplicidade
CREATE UNIQUE INDEX IF NOT EXISTS idx_lembrete_agendamento ON lembretes_enviados(agendamento_id);

-- Tabela de folgas especiais
CREATE TABLE IF NOT EXISTS folgas_especiais (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL UNIQUE,
    motivo VARCHAR(150)
);

-- Tabela de alertas e promoções
CREATE TABLE IF NOT EXISTS alertas_promos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(80) NOT NULL,
    texto VARCHAR(300) NOT NULL,
    imagem TEXT,
    link TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de informações da barbearia
CREATE TABLE IF NOT EXISTS barbearia (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL DEFAULT 'NaRégua Barbearia',
    whatsapp VARCHAR(30),
    instagram VARCHAR(100),
    endereco VARCHAR(255),
    cidade_estado VARCHAR(100),
    foto VARCHAR(255),
    email_notificacao VARCHAR(150),
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Inserir dados padrão da barbearia
INSERT INTO barbearia (nome, whatsapp, instagram, endereco, cidade_estado, email_notificacao) 
VALUES ('NaRégua Barbearia', '', '', '', '', '')
ON CONFLICT DO NOTHING;
