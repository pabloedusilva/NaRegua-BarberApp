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