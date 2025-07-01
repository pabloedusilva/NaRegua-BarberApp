# 🗄️ Documentação do Banco de Dados - NaRégua BarberApp

## 📋 Visão Geral

O NaRégua BarberApp utiliza **PostgreSQL** como banco de dados principal, hospedado na plataforma **Neon**. O banco é projetado para ser eficiente, escalável e manter a integridade dos dados de agendamentos, clientes, serviços e configurações.

---

## 🏗️ Arquitetura do Banco

### Conexão
- **Plataforma**: Neon (PostgreSQL-as-a-Service)
- **Arquivo de Conexão**: `db/neon.js`
- **Driver**: `@neondatabase/serverless`
- **Pool de Conexões**: Gerenciado automaticamente

### Características
- **ACID Compliance**: Transações seguras e consistentes
- **Índices Otimizados**: Performance em consultas frequentes
- **Auto-Increment**: IDs sequenciais automáticos
- **Constraints**: Validação de dados no nível do banco
- **Timezone**: UTC com conversão para America/Sao_Paulo

---

## 📊 Estrutura das Tabelas

### 1. **usuarios** - Usuários Administrativos
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'user'
);
```

**Campos:**
- `id`: Chave primária auto-incremento
- `username`: Nome de usuário único
- `password`: Senha (recomenda-se hash em produção)
- `role`: Perfil do usuário (admin/user)

**Dados Iniciais:**
```sql
INSERT INTO usuarios (username, password, role) 
VALUES ('admin', '1234', 'admin');
```

---

### 2. **agendamentos** - Agendamentos de Clientes
```sql
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    servico VARCHAR(100) NOT NULL,
    profissional VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'Ativo',
    duracao_minutos INTEGER
);
```

**Campos:**
- `id`: Identificador único do agendamento
- `nome`: Nome do cliente
- `telefone`: Telefone do cliente (usado como referência)
- `servico`: Nome do serviço agendado
- `profissional`: Nome do profissional selecionado
- `data`: Data do agendamento (YYYY-MM-DD)
- `hora`: Horário do agendamento (HH:MM)
- `preco`: Valor do serviço (formato decimal)
- `criado_em`: Timestamp de criação
- `status`: Status do agendamento (Ativo/Cancelado/Concluído)
- `duracao_minutos`: Duração estimada em minutos

**Índices Sugeridos:**
```sql
CREATE INDEX idx_agendamentos_data ON agendamentos(data);
CREATE INDEX idx_agendamentos_telefone ON agendamentos(telefone);
CREATE INDEX idx_agendamentos_profissional_data ON agendamentos(profissional, data);
```

---

### 3. **servicos** - Serviços Oferecidos
```sql
CREATE TABLE servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tempo VARCHAR(30) NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    imagem VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE
);
```

**Campos:**
- `id`: Identificador único do serviço
- `nome`: Nome do serviço
- `tempo`: Duração (ex: "30min", "1h30min")
- `preco`: Preço do serviço
- `imagem`: Caminho/URL da imagem do serviço
- `ativo`: Se o serviço está disponível para agendamento

**Dados Iniciais:**
```sql
INSERT INTO servicos (nome, tempo, preco, imagem, ativo) VALUES
('Barba', '15min', 20.00, 'img/servicos/barba.jpg', TRUE),
('Corte de Cabelo', '30min', 35.00, 'img/servicos/corte-masculino.jpg', TRUE),
('Corte + Barba', '45min', 50.00, 'img/servicos/corte-barba.jpg', TRUE),
('Bigodinho', '5min', 7.00, 'img/servicos/bigodinho.jpg', TRUE),
('Colorimetria + corte', '1h:30min', 65.00, 'img/servicos/colorimetria.jpg', TRUE),
('Corte infantil', '30min', 25.00, 'img/servicos/infantil.jpg', TRUE),
('Barba raspada na máquina', '05min', 10.00, 'img/servicos/maquina.jpg', TRUE);
```

---

### 4. **profissionais** - Barbeiros/Profissionais
```sql
CREATE TABLE profissionais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    especialidade VARCHAR(200),
    telefone VARCHAR(20),
    email VARCHAR(100),
    avatar VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único do profissional
- `nome`: Nome completo do profissional
- `especialidade`: Especialidades/serviços que oferece
- `telefone`: Telefone de contato
- `email`: Email de contato
- `avatar`: Foto/avatar do profissional
- `ativo`: Se está disponível para agendamentos
- `criado_em`: Data de cadastro

**Dados Iniciais:**
```sql
INSERT INTO profissionais (nome, especialidade, ativo) VALUES
('Pablo', 'Especialista em cortes modernos e barbas', TRUE),
('João', 'Cortes clássicos e infantis', TRUE);
```

---

### 5. **clientes** - Dados dos Clientes
```sql
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_agendamento TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único do cliente
- `nome`: Nome completo do cliente
- `telefone`: Telefone único (chave de identificação)
- `email`: Email para notificações
- `criado_em`: Data de primeiro cadastro
- `ultimo_agendamento`: Data do último agendamento

---

### 6. **barbearia** - Informações da Empresa
```sql
CREATE TABLE barbearia (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(200),
    cidade_estado VARCHAR(100),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    instagram VARCHAR(100),
    foto VARCHAR(255),
    email_notificacao VARCHAR(100),
    wallpaper_id INTEGER,
    tema VARCHAR(20) DEFAULT 'claro',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único
- `nome`: Nome da barbearia
- `endereco`: Endereço completo
- `cidade_estado`: Cidade e estado
- `telefone`: Telefone principal
- `whatsapp`: Número do WhatsApp
- `instagram`: Handle do Instagram
- `foto`: Logo/foto da barbearia
- `email_notificacao`: Email para receber notificações
- `wallpaper_id`: ID do wallpaper selecionado
- `tema`: Tema padrão (claro/escuro)

---

### 7. **horarios_turnos** - Horários de Funcionamento
```sql
CREATE TABLE horarios_turnos (
    id SERIAL PRIMARY KEY,
    dia_semana VARCHAR(20) NOT NULL,
    turno_inicio TIME NOT NULL,
    turno_fim TIME NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);
```

**Campos:**
- `id`: Identificador único
- `dia_semana`: Dia da semana (segunda, terca, etc.)
- `turno_inicio`: Horário de início do turno
- `turno_fim`: Horário de fim do turno
- `ativo`: Se o turno está ativo

**Exemplo de Dados:**
```sql
INSERT INTO horarios_turnos (dia_semana, turno_inicio, turno_fim) VALUES
('segunda', '08:00', '12:00'),
('segunda', '14:00', '18:00'),
('terca', '08:00', '12:00'),
('terca', '14:00', '18:00');
```

---

### 8. **folgas_especiais** - Feriados e Folgas
```sql
CREATE TABLE folgas_especiais (
    id SERIAL PRIMARY KEY,
    data DATE NOT NULL UNIQUE,
    motivo VARCHAR(200),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único
- `data`: Data da folga (única)
- `motivo`: Motivo da folga (feriado, evento, etc.)
- `criado_em`: Data de criação do registro

---

### 9. **wallpapers** - Planos de Fundo
```sql
CREATE TABLE wallpapers (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único
- `nome`: Nome descritivo do wallpaper
- `url`: Caminho local, URL externa ou base64
- `ativo`: Se está disponível para seleção
- `criado_em`: Data de upload

**Dados Iniciais:**
```sql
INSERT INTO wallpapers (nome, url, ativo) VALUES
('Barbearia Clássica', 'img/wallpapers/background1.jpg', TRUE),
('Estilo Moderno', 'img/wallpapers/background2.png', TRUE),
('Vintage', 'img/wallpapers/background3.png', TRUE);
```

---

### 10. **subscriptions** - Assinaturas Push
```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    agendamento_id INTEGER,
    endpoint VARCHAR(500) NOT NULL UNIQUE,
    p256dh VARCHAR(200) NOT NULL,
    auth VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único
- `agendamento_id`: ID do agendamento relacionado
- `endpoint`: Endpoint do navegador para push
- `p256dh`: Chave pública do cliente
- `auth`: Token de autenticação
- `criado_em`: Data da assinatura

---

### 11. **notificacoes** - Histórico de Notificações
```sql
CREATE TABLE notificacoes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE,
    tipo VARCHAR(50) DEFAULT 'geral'
);
```

**Campos:**
- `id`: Identificador único
- `titulo`: Título da notificação
- `mensagem`: Conteúdo da mensagem
- `data`: Data/hora da notificação
- `lida`: Se foi marcada como lida
- `tipo`: Tipo da notificação (geral, agendamento, promocao)

---

### 12. **alertas_promos** - Alertas e Promoções
```sql
CREATE TABLE alertas_promos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    texto TEXT NOT NULL,
    imagem VARCHAR(255),
    link VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único
- `titulo`: Título do alerta/promoção
- `texto`: Descrição detalhada
- `imagem`: Imagem da promoção
- `link`: Link externo (opcional)
- `ativo`: Se está sendo exibido
- `criado_em`: Data de criação

---

### 13. **imagens** - Controle de Uploads
```sql
CREATE TABLE imagens (
    id SERIAL PRIMARY KEY,
    nome_original VARCHAR(255) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho VARCHAR(500) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    tamanho INTEGER,
    mime_type VARCHAR(100),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único
- `nome_original`: Nome original do arquivo
- `nome_arquivo`: Nome final do arquivo
- `caminho`: Caminho completo do arquivo
- `tipo`: Categoria (servicos, wallpapers, logos, etc.)
- `tamanho`: Tamanho em bytes
- `mime_type`: Tipo MIME da imagem
- `criado_em`: Data do upload

---

## 🔧 Relacionamentos

### Principais Relações:
1. **agendamentos** ↔ **clientes**: Via telefone
2. **agendamentos** ↔ **subscriptions**: Via agendamento_id
3. **barbearia** ↔ **wallpapers**: Via wallpaper_id
4. **imagens** → **servicos**: Via campo imagem
5. **imagens** → **wallpapers**: Via campo url

---

## 🔍 Queries Mais Utilizadas

### Agendamentos do Dia
```sql
SELECT a.*, c.email 
FROM agendamentos a
LEFT JOIN clientes c ON a.telefone = c.telefone
WHERE a.data = CURRENT_DATE
ORDER BY a.hora;
```

### Serviços Ativos com Imagens
```sql
SELECT s.*, i.caminho as imagem_path
FROM servicos s
LEFT JOIN imagens i ON s.imagem = i.caminho
WHERE s.ativo = TRUE
ORDER BY s.nome;
```

### Horários Ocupados por Profissional
```sql
SELECT hora, servico
FROM agendamentos
WHERE profissional = $1 
  AND data = $2 
  AND status != 'Cancelado';
```

### Estatísticas do Mês
```sql
SELECT 
    COUNT(*) as total_agendamentos,
    SUM(preco) as faturamento_total,
    COUNT(DISTINCT telefone) as clientes_unicos
FROM agendamentos
WHERE EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE);
```

---

## 🚀 Otimizações Recomendadas

### Índices para Performance
```sql
-- Agendamentos por data (consulta mais frequente)
CREATE INDEX idx_agendamentos_data ON agendamentos(data);

-- Agendamentos por profissional e data
CREATE INDEX idx_agendamentos_prof_data ON agendamentos(profissional, data);

-- Clientes por telefone
CREATE INDEX idx_clientes_telefone ON clientes(telefone);

-- Notificações por data
CREATE INDEX idx_notificacoes_data ON notificacoes(data DESC);

-- Subscriptions por endpoint (evitar duplicatas)
CREATE UNIQUE INDEX idx_subscriptions_endpoint ON subscriptions(endpoint);
```

### Views Úteis
```sql
-- View de agendamentos com informações de cliente
CREATE VIEW agendamentos_detalhados AS
SELECT 
    a.*,
    c.email,
    c.criado_em as cliente_desde,
    s.tempo as duracao_servico
FROM agendamentos a
LEFT JOIN clientes c ON a.telefone = c.telefone
LEFT JOIN servicos s ON a.servico = s.nome;

-- View de estatísticas mensais
CREATE VIEW estatisticas_mensais AS
SELECT 
    EXTRACT(YEAR FROM data) as ano,
    EXTRACT(MONTH FROM data) as mes,
    COUNT(*) as total_agendamentos,
    SUM(preco) as faturamento,
    COUNT(DISTINCT telefone) as clientes_unicos
FROM agendamentos
GROUP BY EXTRACT(YEAR FROM data), EXTRACT(MONTH FROM data)
ORDER BY ano DESC, mes DESC;
```

---

## 🔄 Backup e Manutenção

### Script de Backup
```bash
#!/bin/bash
# backup_db.sh

DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="naregua_db"
BACKUP_DIR="/backups"

# Backup completo
pg_dump "postgresql://user:pass@host/db" > "${BACKUP_DIR}/backup_${DATE}.sql"

# Backup apenas dados (sem estrutura)
pg_dump --data-only "postgresql://user:pass@host/db" > "${BACKUP_DIR}/data_${DATE}.sql"

# Compactar backup
gzip "${BACKUP_DIR}/backup_${DATE}.sql"

echo "Backup realizado: backup_${DATE}.sql.gz"
```

### Limpeza Automática
```sql
-- Remover notificações antigas (mais de 30 dias)
DELETE FROM notificacoes 
WHERE data < NOW() - INTERVAL '30 days' 
  AND lida = TRUE;

-- Remover subscriptions órfãs
DELETE FROM subscriptions 
WHERE agendamento_id NOT IN (SELECT id FROM agendamentos);

-- Atualizar estatísticas das tabelas
ANALYZE agendamentos;
ANALYZE clientes;
ANALYZE servicos;
```

---

## 🔒 Segurança

### Permissões de Usuário
```sql
-- Criar usuário para aplicação
CREATE USER naregua_app WITH PASSWORD 'senha_forte_aqui';

-- Conceder permissões necessárias
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO naregua_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO naregua_app;

-- Remover permissões desnecessárias
REVOKE ALL ON usuarios FROM naregua_app;
GRANT SELECT ON usuarios TO naregua_app;
```

### Validações e Constraints
```sql
-- Validar formato de telefone
ALTER TABLE clientes ADD CONSTRAINT check_telefone 
CHECK (telefone ~ '^[0-9]{10,11}$');

-- Validar status de agendamento
ALTER TABLE agendamentos ADD CONSTRAINT check_status 
CHECK (status IN ('Ativo', 'Cancelado', 'Concluído'));

-- Validar preços positivos
ALTER TABLE servicos ADD CONSTRAINT check_preco_positivo 
CHECK (preco > 0);
```

---

## 📈 Monitoramento

### Queries de Diagnóstico
```sql
-- Tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Queries mais lentas
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Conectividade e locks
SELECT 
    datname,
    numbackends,
    xact_commit,
    xact_rollback
FROM pg_stat_database 
WHERE datname = current_database();
```

---

## 🔄 Migração de Dados

### Script de Migração (Exemplo)
```sql
-- migration_001_add_email_notifications.sql
BEGIN;

-- Adicionar campo de email em clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS email VARCHAR(100);

-- Adicionar configuração de notificações em barbearia
ALTER TABLE barbearia ADD COLUMN IF NOT EXISTS email_notificacao VARCHAR(100);

-- Criar índice para emails
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);

COMMIT;
```

### Dados de Desenvolvimento/Teste
```sql
-- seed_test_data.sql
INSERT INTO clientes (nome, telefone, email) VALUES
('João Silva', '11999999999', 'joao@email.com'),
('Maria Santos', '11888888888', 'maria@email.com'),
('Pedro Oliveira', '11777777777', 'pedro@email.com');

INSERT INTO agendamentos (nome, telefone, servico, profissional, data, hora, preco) VALUES
('João Silva', '11999999999', 'Corte + Barba', 'Pablo', CURRENT_DATE, '10:00', 50.00),
('Maria Santos', '11888888888', 'Corte de Cabelo', 'João', CURRENT_DATE, '11:00', 35.00);
```

---

## 📋 Checklist de Manutenção

### Diária
- [ ] Verificar logs de erro
- [ ] Monitorar performance das queries
- [ ] Verificar espaço em disco

### Semanal
- [ ] Backup completo do banco
- [ ] Analisar estatísticas de uso
- [ ] Limpar dados temporários

### Mensal
- [ ] Atualizar estatísticas das tabelas
- [ ] Revisar índices e performance
- [ ] Backup para armazenamento externo
- [ ] Limpar logs antigos

---

<p align="center">
  <em>Documentação do Banco de Dados - NaRégua BarberApp v1.0</em><br>
  <em>Última atualização: Junho 2025</em>
</p>
