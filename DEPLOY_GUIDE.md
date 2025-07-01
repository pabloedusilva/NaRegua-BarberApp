# 🚀 Guia de Deploy em Produção - NaRégua BarberApp

## 📋 Checklist Pré-Deploy

### ✅ Preparação
- [ ] Código testado em ambiente de desenvolvimento
- [ ] Banco de dados configurado e populado
- [ ] Variáveis de ambiente definidas
- [ ] Dependências atualizadas
- [ ] Chaves de segurança geradas
- [ ] HTTPS configurado
- [ ] Domínio apontado

---

## 🌐 Opções de Deploy

### 1. **Render** (Recomendado)
- ✅ **Fácil configuração**
- ✅ **PostgreSQL incluído**
- ✅ **HTTPS automático**
- ✅ **Deploy automático via Git**

### 2. **Railway**
- ✅ **Deploy simples**
- ✅ **Banco incluído**
- ✅ **Escalabilidade automática**

### 3. **Heroku**
- ✅ **Plataforma madura**
- ⚠️ **Plano pago obrigatório**
- ✅ **Add-ons disponíveis**

### 4. **DigitalOcean/AWS**
- ✅ **Controle total**
- ⚠️ **Configuração manual**
- ✅ **Melhor performance**

---

## 🔧 Deploy no Render

### Passo 1: Preparar o Repositório
```bash
# 1. Certifique-se que o código está no GitHub
git add .
git commit -m "Preparar para deploy em produção"
git push origin main
```

### Passo 2: Configurar o Banco
1. Acesse [Neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Anote a string de conexão
4. Execute o script `scriptDB_postgres.sql`

### Passo 3: Configurar no Render
1. Acesse [Render.com](https://render.com)
2. Conecte seu GitHub
3. Clique em "New Web Service"
4. Selecione o repositório
5. Configure:
   ```
   Name: naregua-barberapp
   Branch: main
   Root Directory: (deixe vazio)
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

### Passo 4: Variáveis de Ambiente
No Render, adicione as variáveis:
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
VAPID_PUBLIC_KEY=sua_chave_publica
VAPID_PRIVATE_KEY=sua_chave_privada
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app_gmail
```

### Passo 5: Gerar Chaves VAPID
```bash
npx web-push generate-vapid-keys
```

---

## 🔧 Deploy no Railway

### Configuração Rápida
1. Acesse [Railway.app](https://railway.app)
2. Clique em "Deploy from GitHub"
3. Selecione o repositório
4. Adicione PostgreSQL como serviço
5. Configure as variáveis de ambiente

### Variables no Railway
```env
NODE_ENV=production
PGDATABASE=railway
PGHOST=containers-us-west-xxx.railway.app
PGPASSWORD=sua_senha_gerada
PGPORT=5432
PGUSER=postgres
VAPID_PUBLIC_KEY=sua_chave_publica
VAPID_PRIVATE_KEY=sua_chave_privada
```

---

## 🛠️ Configurações de Produção

### 1. Atualizar package.json
```json
{
  "name": "naregua-barberapp",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

### 2. Configurar server.js para Produção
```javascript
// server.js - Adicionar no topo
require('dotenv').config();

const port = process.env.PORT || 3000;

// Configuração de sessão para produção
app.use(session({
    secret: process.env.SESSION_SECRET || 'um-segredo-bem-forte-aqui',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', // HTTPS em produção
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));
```

### 3. Variáveis de Ambiente (.env)
```env
# Ambiente
NODE_ENV=production
PORT=3000

# Banco de Dados
DATABASE_URL=postgresql://user:pass@host:port/database

# Notificações Push
VAPID_PUBLIC_KEY=BJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app_gmail

# Segurança
SESSION_SECRET=um_secret_muito_forte_para_sessoes
```

---

## 🔒 Configurações de Segurança

### 1. Helmet.js (Proteção HTTP)
```bash
npm install helmet
```

```javascript
// server.js
const helmet = require('helmet');

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        },
    },
}));
```

### 2. Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
// server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: 'Muitas tentativas, tente novamente em 15 minutos.'
});

app.use('/api/', limiter);
app.use('/dashboard/', limiter);
```

### 3. CORS Configurado
```bash
npm install cors
```

```javascript
// server.js
const cors = require('cors');

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://seudominio.com', 'https://www.seudominio.com']
        : ['http://localhost:3000'],
    credentials: true
}));
```

---

## 📧 Configurar Email (Gmail)

### 1. Habilitar Autenticação de 2 Fatores
- Vá em [Google Account](https://myaccount.google.com)
- Segurança > Verificação em duas etapas

### 2. Gerar Senha de App
- Segurança > Senhas de app
- Selecione "App personalizado"
- Digite "NaRegua BarberApp"
- Use a senha gerada na variável EMAIL_PASS

### 3. Testar Configuração
```javascript
// Teste simples
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log('Erro na configuração de email:', error);
    } else {
        console.log('Email configurado com sucesso!');
    }
});
```

---

## 🔔 Configurar Push Notifications

### 1. Gerar Chaves VAPID
```bash
npx web-push generate-vapid-keys

# Saída:
# Public Key: BJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# Private Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Atualizar Chaves no Código
```javascript
// utils/cron.js e routes/dashboard.js
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
    'mailto:seu_email@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);
```

### 3. Atualizar Service Worker
```javascript
// public/sw.js - Verificar se está correto
const urlB64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
};

// Usar a chave pública gerada
const vapidPublicKey = 'BJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

---

## 🗄️ Configurar Banco em Produção

### 1. Neon (Recomendado)
```javascript
// db/neon.js
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

module.exports = sql;
```

### 2. Executar Migrations
```sql
-- Execute no console do Neon ou via pgAdmin
-- scriptDB_postgres.sql (arquivo completo)

-- Verificar se tabelas foram criadas
\dt

-- Verificar dados iniciais
SELECT * FROM usuarios;
SELECT * FROM servicos;
```

---

## 📊 Monitoramento em Produção

### 1. Logs Estruturados
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
    ]
});

module.exports = logger;
```

### 2. Health Check
```javascript
// routes/health.js
const express = require('express');
const router = express.Router();
const db = require('../db/neon');

router.get('/health', async (req, res) => {
    try {
        // Testar conexão com banco
        await db`SELECT 1`;
        
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: error.message
        });
    }
});

module.exports = router;
```

---

## 🔄 CI/CD com GitHub Actions

### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to Render
      run: |
        curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK }}"
```

---

## 🛡️ Backup em Produção

### 1. Script de Backup Automático
```bash
#!/bin/bash
# backup_prod.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/user/backups"
DB_URL="postgresql://user:pass@host/db"

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump "$DB_URL" > "${BACKUP_DIR}/backup_${DATE}.sql"

# Compactar
gzip "${BACKUP_DIR}/backup_${DATE}.sql"

# Enviar para S3 (opcional)
# aws s3 cp "${BACKUP_DIR}/backup_${DATE}.sql.gz" s3://meu-bucket/backups/

# Limpar backups antigos (manter últimos 7)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup realizado: backup_${DATE}.sql.gz"
```

### 2. Cron Job para Backup
```bash
# Editar crontab
crontab -e

# Backup diário às 2:00 AM
0 2 * * * /home/user/scripts/backup_prod.sh

# Backup dos uploads semanalmente
0 3 * * 0 tar -czf /home/user/backups/uploads_$(date +%Y%m%d).tar.gz /app/uploads/
```

---

## 📈 Performance em Produção

### 1. Compressão Gzip
```javascript
// server.js
const compression = require('compression');

app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024,
}));
```

### 2. Cache de Assets
```javascript
// server.js
app.use(express.static('public', {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true,
    lastModified: true
}));
```

### 3. Otimização de Imagens
```javascript
// middleware/upload.js - já implementado
const sharp = require('sharp');

const compressImage = async (inputPath, outputPath) => {
    await sharp(inputPath)
        .resize(1200, 800, { 
            fit: 'inside', 
            withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);
};
```

---

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Banco
```bash
# Testar conexão
psql "postgresql://user:pass@host:port/db"

# Verificar variáveis
echo $DATABASE_URL
```

#### 2. Push Notifications não funcionam
- Verificar se HTTPS está habilitado
- Confirmar chaves VAPID
- Testar no console do navegador

#### 3. Upload de imagens falha
- Verificar permissões da pasta
- Confirmar limite de tamanho
- Verificar espaço em disco

#### 4. Emails não são enviados
- Testar credenciais do Gmail
- Verificar se 2FA está habilitado
- Confirmar senha de app

### Logs de Debug
```javascript
// Habilitar debug detalhado
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`, req.body);
        next();
    });
}
```

---

## ✅ Checklist Pós-Deploy

### Funcionalidades a Testar
- [ ] Login na dashboard
- [ ] Criar novo agendamento
- [ ] Receber notificação push
- [ ] Upload de imagem
- [ ] Envio de email
- [ ] Trocar wallpaper
- [ ] Gerar relatório PDF
- [ ] Links do WhatsApp/Instagram
- [ ] Responsividade mobile
- [ ] Tema claro/escuro

### Monitoramento
- [ ] Verificar logs de erro
- [ ] Monitorar uso de CPU/RAM
- [ ] Testar backup automático
- [ ] Configurar alertas
- [ ] Documentar URLs de produção

---

## 📞 Suporte Pós-Deploy

### Contatos Importantes
- **Hosting**: Suporte da plataforma escolhida
- **Banco**: Suporte do Neon.tech
- **Email**: Suporte do Gmail for Business
- **Domínio**: Registrar onde comprou o domínio

### Manutenção Regular
- **Diária**: Verificar logs de erro
- **Semanal**: Backup manual de segurança
- **Mensal**: Atualizar dependências
- **Trimestral**: Revisar performance

---

<p align="center">
  <strong>🎉 Parabéns! Seu NaRégua BarberApp está no ar! 🎉</strong><br>
  <em>Lembre-se de monitorar regularmente e manter backups atualizados</em>
</p>

---

<p align="center">
  <em>Guia de Deploy - NaRégua BarberApp v1.0</em><br>
  <em>Última atualização: Junho 2025</em>
</p>
