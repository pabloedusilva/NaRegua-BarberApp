-- Remove o banco de dados anterior, se existir
DROP DATABASE IF EXISTS naregua;

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS naregua DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE naregua;

-- Criação da tabela de usuários com campo de função (admin/user)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);

-- Inserção de um usuário administrador padrão
INSERT INTO usuarios (username, password, role) VALUES ('admin', '1234', 'admin');

-- Criação da tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    servico VARCHAR(100) NOT NULL,
    profissional VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    hora VARCHAR(10) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de serviços
CREATE TABLE IF NOT EXISTS servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tempo VARCHAR(30) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    imagem VARCHAR(255),
    ativo TINYINT(1) DEFAULT 1
);

-- Exemplo de inserção inicial
INSERT INTO servicos (nome, tempo, preco, imagem, ativo) VALUES
('Barba', '15min', 20.00, 'img/servicos/barba.jpg', 1),
('Corte de Cabelo', '30min', 35.00, 'img/servicos/corte-masculino.jpg', 1),
('Corte + Barba', '45min', 50.00, 'img/servicos/corte-barba.jpg', 1),
('Bigodinho', '5min', 7.00, 'img/servicos/bigodinho.jpg', 1),
('Colorimetria + corte', '1h:30min', 65.00, 'img/servicos/colorimetria.jpg', 1),
('Corte infantil', '30min', 25.00, 'img/servicos/infantil.jpg', 1),
('Barba raspada na máquina', '05min', 10.00, 'img/servicos/maquina.jpg', 1);

-- Tabela para subscriptions de notificações push
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agendamento_id INT,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE
);

-- Crie a tabela horarios_turnos
CREATE TABLE horarios_turnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana VARCHAR(20) NOT NULL,
    turno_inicio TIME NOT NULL,
    turno_fim TIME NOT NULL
);

-- Criação da tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    lida TINYINT(1) DEFAULT 0
);

-- Criação da tabela de barbearias
CREATE TABLE IF NOT EXISTS barbearia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(200) NOT NULL,
    cidade_estado VARCHAR(100) NOT NULL,
    whatsapp VARCHAR(30) NOT NULL,
    instagram VARCHAR(100) NOT NULL,
    foto VARCHAR(255) DEFAULT NULL
);

-- Exemplo de inserção inicial na tabela de barbearias
INSERT INTO barbearia (id, nome, endereco, cidade_estado, whatsapp, instagram, foto)
VALUES (1, 'Barbearia Pablo do corte', 'Av. Principal, 123 - Centro', 'São Paulo - SP', '5511999998888', 'p4blozz__', 'https://img.freepik.com/vetores-premium/polo-barber-vintage-ornament-ilustracao-vector_151511-32.jpg');

-- Criação da tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    telefone VARCHAR(30) NOT NULL UNIQUE,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de wallpapers
CREATE TABLE IF NOT EXISTS wallpapers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    url TEXT NOT NULL, -- pode ser URL pública ou base64
    ativo TINYINT(1) DEFAULT 1
);

-- Exemplo de inserção inicial (ajuste os caminhos para URLs públicas ou base64 depois)
INSERT INTO wallpapers (nome, url, ativo) VALUES
('Fundo 1', '/img/background1.jpg', 1),
('Fundo 2', '/img/background2.png', 1),
('Fundo 3', '/img/background3.png', 1),
('Fundo 4', '/img/background4.png', 1),
('Fundo 5', '/img/background5.jpg', 1),
('Fundo 6', '/img/background6.png', 1),
('Fundo 7', '/img/background7.png', 1),
('Fundo 8', '/img/background8.png', 1);

-- Tabela para guardar o wallpaper selecionado pela barbearia
ALTER TABLE barbearia ADD COLUMN wallpaper_id INT DEFAULT NULL;