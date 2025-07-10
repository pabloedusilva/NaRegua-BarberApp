# 🔄 Sistema de Backup Automático NaRégua

Sistema inteligente de backup e alternância automática entre dois bancos de dados Neon para o NaRégua BarberApp.

## 🎯 Objetivo

Gerenciar automaticamente dois bancos Neon gratuitos (191h/mês cada), alternando entre eles quando um estiver próximo do limite e mantendo sincronização de dados.

## 🏗️ Arquitetura

### Componentes Principais

- **`config.js`** - Configurações do sistema
- **`database-manager.js`** - Gerenciador inteligente de bancos
- **`scheduler.js`** - Agendador de tarefas automáticas
- **`smart-db.js`** - Wrapper transparente para substituir o neon
- **`api-routes.js`** - API REST para controle manual
- **`standalone.js`** - Executável independente

### Funcionalidades

✅ **Monitoramento de Uso**: Rastreia tempo de conexão por banco  
✅ **Backup Automático**: Sincroniza dados entre bancos (85% do limite)  
✅ **Alternância Automática**: Troca de banco ativo (90% do limite)  
✅ **Fallback Inteligente**: Usa banco secundário se primário falhar  
✅ **Agendamento**: Tarefas automáticas via cron  
✅ **API de Controle**: Endpoints para controle manual  
✅ **Logs Detalhados**: Rastreamento completo de atividades  

## 🚀 Instalação

### 1. Configurar Variáveis de Ambiente

Adicione no seu `.env`:

```env
# Banco primário (já existente)
DATABASE_URL='postgresql://seu_usuario_1:senha_1@host_1/db_1'

# Banco secundário (novo)
DATABASE_URL_BACKUP='postgresql://seu_usuario_2:senha_2@host_2/db_2'

# Webhook para notificações (opcional)
BACKUP_WEBHOOK_URL='https://discord.com/api/webhooks/...'
```

### 2. Integrar no Sistema Principal

No seu `db/neon.js`, substitua:

```javascript
// ANTES
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
module.exports = sql;

// DEPOIS
const smartDb = require('../backup-system/smart-db');
module.exports = smartDb;
```

### 3. Adicionar Rotas de Controle (Opcional)

No seu `server.js`:

```javascript
// Adicionar rotas de backup (opcional - apenas para admin)
const backupRoutes = require('./backup-system/api-routes');
app.use('/api/backup', backupRoutes);
```

## 🎮 Modo de Uso

### Execução Automática (Recomendado)

O sistema inicia automaticamente junto com sua aplicação. Nenhuma configuração adicional necessária.

### Execução Standalone

Para executar apenas o sistema de backup:

```bash
cd backup-system
node standalone.js
```

Comandos interativos:
- `status` - Ver status dos bancos
- `backup` - Forçar backup manual  
- `switch` - Forçar troca de banco
- `help` - Ver comandos
- `exit` - Parar sistema

### API de Controle

Se adicionou as rotas no server.js:

```bash
# Status do sistema
GET /api/backup/status

# Forçar backup
POST /api/backup/force-backup

# Forçar troca de banco  
POST /api/backup/force-switch

# Ver logs
GET /api/backup/logs

# Ver configurações
GET /api/backup/config
```

## 📊 Monitoramento

### Thresholds Configurados

- **Backup**: 85% do limite mensal
- **Alternância**: 90% do limite mensal
- **Verificação**: A cada 6 horas
- **Backup Preventivo**: Diário às 3h

### Logs

Localização: `./backup-system/backup-system.log`

Exemplo de log:
```
[2025-01-08T10:30:00.000Z] ✅ PRIMARY: 65.5% de uso - Normal
[2025-01-08T16:30:00.000Z] ⚠️ ALERTA: PRIMARY com 87% de uso - Iniciando backup
[2025-01-08T22:30:00.000Z] 🚨 CRÍTICO: PRIMARY com 91% de uso - Alternando banco!
[2025-01-08T22:31:15.000Z] ✅ Banco alternado para SECONDARY
```

## ⚙️ Configurações

### Limites Personalizáveis

```javascript
// backup-system/config.js
monitoring: {
    checkInterval: 6 * 60 * 60 * 1000,  // 6 horas
    backupThreshold: 0.85,               // 85%
    switchThreshold: 0.90                // 90%
}
```

### Tabelas Incluídas no Backup

```javascript
backup: {
    tables: [
        'usuarios', 'agendamentos', 'clientes',
        'servicos', 'profissionais', 'barbearia',
        'horarios_turnos', 'notificacoes',
        'wallpapers', 'servico_imagens',
        'alertas_promos'
    ]
}
```

## 🔧 Solução de Problemas

### Erro de Conexão

1. Verifique as URLs dos bancos no `.env`
2. Confirme que ambos os bancos estão acessíveis
3. Execute `node backup-system/standalone.js` para diagnóstico

### Backup Não Funciona

1. Verifique se as tabelas existem em ambos os bancos
2. Confirme permissões de escrita
3. Veja logs em `backup-system.log`

### Performance

O sistema adiciona overhead mínimo:
- ~1-2ms por query (rastreamento)
- Backup apenas quando necessário
- Queries são transparentes à aplicação

## 📈 Benefícios

✅ **Zero Downtime**: Alternância automática sem interrupção  
✅ **Transparente**: Funciona com código existente sem mudanças  
✅ **Inteligente**: Apenas faz backup quando necessário  
✅ **Resiliente**: Fallback automático em caso de falha  
✅ **Monitorado**: Logs detalhados de todas as operações  
✅ **Controlável**: API para controle manual quando necessário  

---

**⚠️ Importante**: Mantenha os dois bancos Neon com a mesma estrutura de tabelas para garantir compatibilidade do backup.
