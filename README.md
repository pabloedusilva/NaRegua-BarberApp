# 💈 NaRégua BarberApp

<p align="center">
  <img src="https://github.com/user-attachments/assets/eda4e558-eddd-48f2-bdb6-89be7c141b70" alt="Logo NaRégua BarberApp" width="300" height="300">
</p>

<p align="center">
  <strong>Sistema completo de agendamento online para barbearias</strong><br>
  Dashboard administrativa • Notificações push • Personalização visual • Interface moderna
</p>

<p align="center">
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-instalação">Instalação</a> •
  <a href="#-documentação">Documentação</a> •
  <a href="#-demo">Demo</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-16+-green" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-4.18+-blue" alt="Express">
  <img src="https://img.shields.io/badge/PostgreSQL-14+-orange" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/PWA-Compatible-purple" alt="PWA">
  <img src="https://img.shields.io/badge/License-ISC-yellow" alt="License">
</p>

---

## 🌟 Visão Geral

O **NaRégua BarberApp** é uma solução web completa e moderna para gestão de barbearias, desenvolvida com foco na experiência do usuário e facilidade de uso. O sistema combina um frontend intuitivo para clientes agendarem serviços com uma dashboard administrativa robusta para gerenciamento completo do negócio.

### 🎯 Principais Diferenciais

- **✨ Interface Moderna**: Design responsivo e intuitivo com suporte a temas claro/escuro
- **🔔 Notificações Inteligentes**: Push notifications automáticas e manuais com Service Worker
- **🎨 Personalização Visual**: Sistema de wallpapers dinâmicos e customização completa
- **📱 PWA Ready**: Aplicação instalável com experiência nativa
- **🔒 Segurança Avançada**: Autenticação robusta e proteção de dados
- **📊 Dashboard Analítica**: Estatísticas em tempo real e relatórios detalhados
- **🔄 Tempo Real**: Sincronização automática e atualizações instantâneas
- **📧 Notificações por Email**: Confirmações automáticas para clientes e barbeiros
- **🖼️ Sistema de Upload**: Gerenciamento de imagens categorizado e otimizado

---

## 🚀 Funcionalidades

### 👥 Para Clientes
- **Agendamento Online**: Interface intuitiva para seleção de serviços, profissionais e horários
- **Notificações Push**: Lembretes automáticos 1 hora antes do agendamento
- **Histórico de Agendamentos**: Visualização de agendamentos passados e futuros
- **Confirmação por Email**: Recebimento automático de confirmação de agendamento
- **Interface Responsiva**: Experiência otimizada em mobile, tablet e desktop
- **Tema Personalizável**: Escolha entre tema claro e escuro

### 🔧 Para Administradores
- **Dashboard Completa**: Painel administrativo com estatísticas e controles
- **CRUD Completo**: Gerenciamento de serviços, profissionais, horários e folgas
- **Gestão de Agendamentos**: Visualização, edição e controle de status
- **Sistema de Notificações**: Envio manual e automático de push notifications
- **Personalização Visual**: Upload e seleção de wallpapers para o frontend
- **Relatórios em PDF**: Geração de relatórios mensais de agendamentos
- **Controle de Usuários**: Gestão de contas administrativas
- **Upload de Imagens**: Sistema categorizado para diferentes tipos de mídia

### 🏪 Gestão da Barbearia
- **Informações da Empresa**: Edição de nome, endereço, contatos e redes sociais
- **Horários Flexíveis**: Configuração de múltiplos turnos por dia
- **Folgas Especiais**: Cadastro de feriados e dias de folga
- **Integração Social**: Links diretos para WhatsApp e Instagram
- **Galeria de Imagens**: Organização de fotos de serviços e trabalhos

---

## 🏗️ Arquitetura e Tecnologias

### 🔧 Backend
- **Node.js** com **Express.js** - Servidor robusto e escalável
- **PostgreSQL** via **Neon** - Banco de dados confiável e performático
- **Express Session** - Gerenciamento seguro de sessões
- **Web Push** - Notificações push nativas
- **Node Cron** - Tarefas agendadas automáticas
- **Multer + Sharp** - Upload e otimização de imagens
- **PDFKit** - Geração de relatórios em PDF
- **Nodemailer** - Envio de emails automáticos

### 🎨 Frontend
- **HTML5 + CSS3** - Estrutura semântica e estilos modernos
- **Vanilla JavaScript** - Performance otimizada sem frameworks pesados
- **Service Worker** - Funcionalidades PWA e notificações
- **FontAwesome** - Iconografia profissional
- **Animate.css** - Animações suaves e elegantes

### 📁 Estrutura do Projeto
```
NaRegua-BarberApp/
├── 📁 dashboard/                    # Interface administrativa
│   ├── 📄 dashboard.html           # Dashboard principal
│   ├── 📄 login-dashboard.html     # Tela de login admin
│   ├── 📁 css/                     # Estilos da dashboard
│   └── 📁 js/                      # Scripts da dashboard
├── 📁 db/                          # Configuração do banco
│   └── 📄 neon.js                  # Conexão PostgreSQL/Neon
├── 📁 middleware/                  # Middlewares do Express
│   ├── 📄 auth.js                  # Autenticação e autorização
│   └── 📄 upload.js                # Upload e processamento de imagens
├── 📁 public/                      # Frontend público
│   ├── 📄 index.html               # Página de agendamento
│   ├── 📄 sw.js                    # Service Worker
│   ├── 📁 css/                     # Estilos do frontend
│   ├── 📁 js/                      # Scripts do frontend
│   └── 📁 img/                     # Imagens estáticas
├── 📁 routes/                      # Rotas da API
│   ├── 📄 agendamento.js           # API de agendamentos
│   ├── 📄 dashboard.js             # API da dashboard
│   ├── 📄 imagens.js               # API de upload/imagens
│   └── 📄 alertasPromos.js         # API de alertas/promoções
├── 📁 uploads/                     # Arquivos enviados
├── 📁 utils/                       # Utilitários
│   ├── 📄 cron.js                  # Tarefas agendadas
│   └── 📄 mailer.js                # Envio de emails
├── 📄 server.js                    # Servidor principal
├── 📄 package.json                 # Dependências e scripts
├── 📄 scriptDB_postgres.sql        # Schema do banco
└── 📄 README.md                    # Esta documentação
```

---

## ⚙️ Instalação

### 📋 Pré-requisitos

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ou conta no [Neon](https://neon.tech/)
- **Git** ([Download](https://git-scm.com/))

### 🔧 Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/pabloedusilva/NaRegua-BarberApp.git
   cd NaRegua-BarberApp
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o banco de dados:**
   - Crie uma conta no [Neon](https://neon.tech/) ou configure PostgreSQL local
   - Execute o script `scriptDB_postgres.sql`
   - Configure a string de conexão no arquivo `db/neon.js`

4. **Configure variáveis de ambiente:**
   ```bash
   # Crie um arquivo .env (opcional)
   DATABASE_URL=postgresql://user:password@host:port/database
   VAPID_PUBLIC_KEY=sua_chave_publica_vapid
   VAPID_PRIVATE_KEY=sua_chave_privada_vapid
   EMAIL_USER=seu_email@gmail.com
   EMAIL_PASS=sua_senha_app
   ```

5. **Gere chaves VAPID para notificações:**
   ```bash
   npx web-push generate-vapid-keys
   ```

6. **Inicie o servidor:**
   ```bash
   npm start
   ```

7. **Acesse a aplicação:**
   - **Frontend:** http://localhost:3000
   - **Dashboard:** http://localhost:3000/dashboard/login
   - **Credenciais padrão:** admin / 1234

---

## 📖 Documentação da API

### 🔐 Autenticação

Todas as rotas administrativas requerem autenticação via sessão. O login é realizado através da rota `/dashboard/login`.

#### **POST /dashboard/login**
Login do administrador.

**Body:**
```json
{
  "username": "admin",
  "password": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso"
}
```

### 📅 Agendamentos

#### **POST /agendamento/novo**
Cria um novo agendamento.

**Body:**
```json
{
  "nome": "João Silva",
  "telefone": "11999999999",
  "email": "joao@email.com",
  "servico": "Corte + Barba",
  "profissional": "Pablo",
  "data": "2024-12-25",
  "hora": "14:00",
  "preco": 50.00,
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

#### **GET /agendamento/meus?telefone=11999999999**
Busca agendamentos por telefone.

#### **PATCH /agendamento/cancelar/:id**
Cancela um agendamento específico.

#### **GET /agendamento/ocupados?profissional=Pablo&data=2024-12-25**
Retorna horários ocupados de um profissional em uma data.

### 🛠️ Dashboard

#### **GET /dashboard/agendamentos-hoje**
Lista agendamentos do dia atual (requer autenticação).

#### **GET /dashboard/total-agendamentos**
Retorna total de agendamentos.

#### **GET /dashboard/servicos**
Lista serviços ativos (público).

#### **GET /dashboard/servicos-admin**
Lista todos os serviços (requer autenticação).

#### **POST /dashboard/servicos**
Adiciona novo serviço (requer autenticação).

**Body:**
```json
{
  "nome": "Corte Infantil",
  "tempo": "30min",
  "preco": 25.00,
  "imagem": "img/servicos/infantil.jpg"
}
```

### 📤 Upload de Imagens

#### **POST /api/upload/service**
Upload de imagem de serviço.

#### **POST /api/upload/wallpaper**
Upload de wallpaper.

#### **POST /api/upload/logo**
Upload de logo/foto da barbearia.

#### **GET /api/imagens-{categoria}**
Lista imagens por categoria (servicos, wallpapers, logos, etc.).

### 🔔 Notificações

#### **POST /dashboard/enviar-push**
Envia notificação push para todos os usuários (requer autenticação).

**Body:**
```json
{
  "titulo": "Promoção Especial",
  "mensagem": "50% de desconto em todos os serviços hoje!",
  "link": "https://meusite.com"
}
```

#### **POST /dashboard/enviar-push-agendamento**
Envia notificação para um agendamento específico.

---

## 📱 Funcionalidades PWA

### Service Worker
O sistema inclui um Service Worker (`public/sw.js`) que fornece:

- **Notificações Push**: Recebimento e exibição de notificações
- **Cache Inteligente**: Armazenamento local para melhor performance
- **Instalação como App**: Possibilidade de instalar no dispositivo
- **Funcionamento Offline**: Funcionalidades básicas sem internet

### Web App Manifest
Configuração em `public/manifest.json` para:
- Ícones personalizados
- Cores de tema
- Modo de exibição
- Orientação preferida

---

## 🔒 Segurança

### Autenticação e Autorização
- **Sessões Seguras**: Cookies HTTP-only com express-session
- **Middleware de Autenticação**: Proteção de rotas administrativas
- **Controle de Acesso**: Verificação de roles (admin/user)

### Proteção de Dados
- **Validação de Entrada**: Sanitização de dados do usuário
- **Limit Rate**: Limite de upload de arquivos (10MB)
- **CORS Configurado**: Controle de origem de requisições

### Upload Seguro
- **Validação de Tipos**: Apenas imagens permitidas
- **Compressão Automática**: Otimização com Sharp
- **Nomes Únicos**: Prevenção de conflitos de arquivos

---

## 📊 Monitoramento e Logs

### Logs do Sistema
- **Notificações**: Log de envio de push notifications
- **Agendamentos**: Registro de criação/modificação
- **Uploads**: Histórico de upload de imagens
- **Erros**: Captura e log de erros do sistema

### Estatísticas
- **Dashboard Analytics**: Contadores em tempo real
- **Relatórios PDF**: Geração automática de relatórios mensais
- **Métricas de Uso**: Acompanhamento de performance

---

## 🎨 Personalização Visual

### Sistema de Wallpapers
- **Upload Dinâmico**: Adicionar novos wallpapers via dashboard
- **Preview em Tempo Real**: Visualização instantânea antes de aplicar
- **Categorização**: Organização por tipos (backgrounds, logos, etc.)
- **Ativação Simples**: Um clique para alterar o visual do frontend

### Temas
- **Modo Claro/Escuro**: Alternância automática ou manual
- **Persistência**: Preferência salva no localStorage
- **Responsividade**: Adaptação perfeita a todos os dispositivos

### Upload de Imagens
- **Múltiplas Categorias**: Serviços, wallpapers, logos, avatares, promoções
- **Compressão Inteligente**: Otimização automática de tamanho e qualidade
- **Galeria Integrada**: Visualização e seleção de imagens existentes

---

## 📧 Sistema de Email

### Configuração
```javascript
// utils/mailer.js
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Emails Automáticos
- **Confirmação de Agendamento**: Enviado ao cliente após agendar
- **Notificação ao Barbeiro**: Alerta sobre novos agendamentos
- **Lembretes**: Enviados 1 hora antes do horário marcado

---

## ⚡ Performance e Otimização

### Frontend
- **CSS Minificado**: Estilos otimizados para produção
- **JavaScript Modular**: Scripts organizados e carregamento assíncrono
- **Imagens Otimizadas**: Compressão automática com Sharp
- **Cache Inteligente**: Service Worker para cache de recursos

### Backend
- **Pool de Conexões**: Gerenciamento eficiente do banco
- **Compressão Gzip**: Redução do tamanho das respostas
- **Rate Limiting**: Proteção contra spam e DDoS
- **Queries Otimizadas**: Índices e consultas eficientes

---

## 🔄 Backup e Restauração

### Backup do Banco
```bash
# PostgreSQL
pg_dump -h hostname -U username -d database_name > backup.sql

# Neon (via pgdump)
pg_dump "postgresql://user:pass@host/db" > backup_neon.sql
```

### Backup de Uploads
```bash
# Criar backup dos arquivos
tar -czf uploads_backup.tar.gz uploads/
```

### Restauração
```bash
# Restaurar banco
psql -h hostname -U username -d database_name < backup.sql

# Restaurar uploads
tar -xzf uploads_backup.tar.gz
```

---

## 🌐 Deploy em Produção

### Variáveis de Ambiente
```bash
# .env para produção
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
EMAIL_USER=...
EMAIL_PASS=...
```

### Configurações de Produção
1. **HTTPS Obrigatório**: Para Service Worker e notificações push
2. **Gerar Novas Chaves VAPID**: Para ambiente de produção
3. **Configurar CORS**: Permitir apenas domínios autorizados
4. **Habilitar Compressão**: Gzip para todas as respostas
5. **Configurar Rate Limiting**: Proteção contra abuso

### Plataformas Recomendadas
- **Render**: Deploy automático com PostgreSQL
- **Railway**: Deploy simples com banco incluído
- **Heroku**: Plataforma tradicional e confiável
- **Vercel**: Para frontends estáticos
- **DigitalOcean**: VPS com controle total

---

## 🔧 Personalização e Extensão

### Adicionar Novos Serviços
```javascript
// Via API
POST /dashboard/servicos
{
  "nome": "Novo Serviço",
  "tempo": "45min",
  "preco": 40.00,
  "imagem": "img/servicos/novo-servico.jpg"
}
```

### Customizar Notificações
```javascript
// utils/cron.js - Modificar horário de lembrete
cron.schedule('0 * * * *', async () => {
  // Enviar notificações 2 horas antes (modificar lógica)
});
```

### Adicionar Novos Profissionais
```javascript
// Via dashboard ou API
POST /dashboard/profissionais
{
  "nome": "Novo Barbeiro",
  "especialidade": "Cortes modernos",
  "avatar": "img/avatars/barbeiro.jpg"
}
```

---

## 🐛 Solução de Problemas

### Problemas Comuns

#### Notificações não funcionam
- Verificar se HTTPS está habilitado
- Conferir chaves VAPID
- Validar registro do Service Worker

#### Upload de imagens falha
- Verificar limite de tamanho (10MB padrão)
- Conferir permissões da pasta uploads/
- Validar formato da imagem (JPG, PNG, WebP)

#### Erro de conexão com banco
- Verificar string de conexão
- Confirmar se banco está online
- Validar credenciais

#### Dashboard não carrega
- Verificar se está logado
- Conferir role do usuário (deve ser 'admin')
- Limpar cache do navegador

### Logs de Debug
```javascript
// Habilitar logs detalhados
process.env.DEBUG = true;

// Verificar logs do servidor
console.log('Servidor rodando na porta:', port);
```

---

## 🚀 Roadmap

### Próximas Funcionalidades
- [ ] **App Mobile Nativo** - React Native ou Flutter
- [ ] **Sistema de Pagamentos** - PIX, cartão, boleto
- [ ] **Múltiplas Barbearias** - Gestão de franquias
- [ ] **API Pública** - Integração com sistemas externos
- [ ] **Analytics Avançado** - Dashboard com métricas detalhadas
- [ ] **Chat em Tempo Real** - Comunicação cliente-barbeiro
- [ ] **Sistema de Fidelidade** - Pontos e recompensas
- [ ] **Agendamento Recorrente** - Horários fixos semanais/mensais

### Melhorias Técnicas
- [ ] **Testes Automatizados** - Jest, Cypress
- [ ] **CI/CD Pipeline** - GitHub Actions
- [ ] **Docker** - Containerização
- [ ] **Monitoramento** - Prometheus, Grafana
- [ ] **Cache Redis** - Performance melhorada
- [ ] **CDN** - Distribuição de assets
- [ ] **Microserviços** - Arquitetura escalável

---

## 👥 Contribuição

### Como Contribuir
1. **Fork** o repositório
2. **Clone** sua fork: `git clone https://github.com/seususuario/NaRegua-BarberApp.git`
3. **Crie uma branch**: `git checkout -b minha-feature`
4. **Faça suas alterações**
5. **Commit**: `git commit -m "Adiciona nova feature"`
6. **Push**: `git push origin minha-feature`
7. **Abra um Pull Request**

### Padrões de Código
- **ESLint**: Seguir configuração do projeto
- **Commits Semânticos**: feat:, fix:, docs:, style:, refactor:
- **Documentação**: Atualizar README quando necessário
- **Testes**: Adicionar testes para novas funcionalidades

### Issues e Bugs
- Use o template de issue do GitHub
- Inclua logs relevantes
- Descreva passos para reproduzir
- Informe versão do Node.js e OS

---

## 📄 Licença

Este projeto está licenciado sob a **Licença ISC** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Suporte e Contato

### 🔗 Links Úteis
- **Demo Live**: [https://naregua-barberapp.onrender.com](https://naregua-barberapp.onrender.com)
- **Dashboard Demo**: [https://naregua-barberapp.onrender.com/dashboard/login](https://naregua-barberapp.onrender.com/dashboard/login)
- **Repositório**: [https://github.com/pabloedusilva/NaRegua-BarberApp](https://github.com/pabloedusilva/NaRegua-BarberApp)
- **Issues**: [https://github.com/pabloedusilva/NaRegua-BarberApp/issues](https://github.com/pabloedusilva/NaRegua-BarberApp/issues)

### 👨‍💻 Desenvolvedor
**Pablo Eduardo Silva**
- GitHub: [@pabloedusilva](https://github.com/pabloedusilva)
- Email: [contato@pabloedusilva.dev](mailto:contato@pabloedusilva.dev)

---

<p align="center">
  <strong>⭐ Se este projeto foi útil, deixe uma estrela no GitHub! ⭐</strong>
</p>

<p align="center">
  Feito com ❤️ por <a href="https://github.com/pabloedusilva">Pablo Eduardo Silva</a>
</p>

