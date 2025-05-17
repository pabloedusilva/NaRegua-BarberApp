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