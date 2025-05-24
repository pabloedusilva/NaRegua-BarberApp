# NaRégua BarberApp

Sistema completo de agendamento online para barbearias, com dashboard administrativa, notificações push, controle de serviços, profissionais, horários, folgas, autenticação, integração com WhatsApp e Instagram, **personalização visual com wallpapers dinâmicos**, preview de imagens, e interface moderna e responsiva.

---

## Índice
- [Descrição Geral](#descrição-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura e Estrutura de Pastas](#arquitetura-e-estrutura-de-pastas)
- [Requisitos](#requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Banco de Dados](#banco-de-dados)
- [Detalhes Técnicos](#detalhes-técnicos)
- [Rotas Backend](#rotas-backend)
- [Notificações Push](#notificações-push)
- [Service Worker](#service-worker)
- [Autenticação e Middleware](#autenticação-e-middleware)
- [Wallpapers e Personalização Visual](#wallpapers-e-personalização-visual)
- [Ícones e Recursos Visuais](#ícones-e-recursos-visuais)
- [Personalização e Temas](#personalização-e-temas)
- [Dúvidas Frequentes](#dúvidas-frequentes)

---

## Descrição Geral
O **NaRégua BarberApp** é um sistema web para barbearias, permitindo que clientes agendem horários online e que administradores gerenciem serviços, profissionais, horários, folgas, notificações e informações da barbearia. Possui dashboard protegida por login, notificações automáticas e manuais, integração com WhatsApp e Instagram, interface responsiva, **personalização de plano de fundo** e preview de imagens.

## Funcionalidades
- Agendamento online de serviços
- Dashboard administrativa (restrita a admin)
- Gerenciamento de serviços, profissionais, horários e folgas
- Notificações push automáticas e manuais
- Autenticação de usuários (admin)
- Visualização e edição de informações da barbearia
- Integração com WhatsApp e Instagram
- Controle de tema (claro/escuro)
- Service Worker para notificações
- Estatísticas de agendamentos (dia, semana, mês)
- Compartilhamento de link de agendamento
- **Personalização visual com wallpapers dinâmicos**
- **Preview de imagens em modais e cards**
- **Seleção dinâmica de plano de fundo do agendamento**
- **CRUD completo de wallpapers**
- Interface responsiva e moderna

## Arquitetura e Estrutura de Pastas
```
├── dashboard/                # Frontend da dashboard administrativa
│   ├── dashboard.html        # Dashboard principal
│   └── login-dashboard.html  # Tela de login/cadastro admin
├── db/
│   └── mysql.js              # Conexão com banco MySQL
├── icons/                    # Ícones SVG (Instagram, WhatsApp)
├── middleware/
│   └── auth.js               # Middleware de autenticação
├── public/                   # Frontend público (cliente)
│   ├── index.html            # Página de agendamento
│   ├── sw.js                 # Service Worker para push
│   └── img/                  # Imagens de wallpapers, serviços, etc.
├── routes/                   # Rotas backend (Express)
│   ├── agendamento.js        # Rotas de agendamento
│   ├── dashboard.js          # Rotas da dashboard/admin
│   └── push.js               # Rotas de notificações push
├── notificacoes.js           # Notificações automáticas (cron)
├── server.js                 # Servidor Express principal
├── scriptDB.sql              # Script de criação do banco de dados
├── package.json              # Dependências e scripts
└── README.md                 # Este arquivo
```

## Requisitos
- Node.js >= 14.x
- MySQL >= 5.7
- Navegador moderno (para notificações push)

## Instalação e Configuração
1. **Clone o repositório:**
   ```powershell
   git clone https://github.com/pabloedusilva/NaRegua-BarberApp.git
   cd NaRegua-BarberApp
   ```
2. **Instale as dependências:**
   ```powershell
   npm install
   ```
3. **Configure o banco de dados:**
   - Crie um banco MySQL e execute o `scriptDB.sql` para criar as tabelas e dados iniciais.
   - Ajuste as credenciais de conexão em `db/mysql.js`.
4. **Configure as chaves VAPID para push:**
   - As chaves já estão no código, mas recomenda-se gerar novas para produção.
5. **Inicie o servidor:**
   ```powershell
   npm start
   ```
6. **Acesse:**
   - Página pública: [http://localhost:3000/index](http://localhost:3000/index)
   - Dashboard admin: [http://localhost:3000/dashboard/dashboard](http://localhost:3000/dashboard/dashboard)

## Scripts Disponíveis
- `npm start` — Inicia o servidor Express

## Banco de Dados
- Script de criação: `scriptDB.sql`
- Principais tabelas:
  - `usuarios` (admin)
  - `agendamentos`
  - `servicos`
  - `profissionais`
  - `horarios_turnos`
  - `folgas`
  - `barbearia`
  - `notificacoes`
  - `subscriptions` (push)
  - `wallpapers` (**planos de fundo dinâmicos**)

### Wallpapers (Planos de Fundo)
- Tabela `wallpapers` armazena nome, url/base64 e status de cada plano de fundo.
- O campo `url` pode ser um caminho local (`/img/background1.jpg`) ou uma URL externa/base64.
- O campo `ativo` permite ativar/desativar wallpapers.
- A tabela `barbearia` possui o campo `wallpaper_id` para o plano de fundo selecionado.

## Detalhes Técnicos
- **Backend:** Node.js, Express, MySQL
- **Frontend:** HTML, CSS, JS puro, FontAwesome, Animate.css
- **Sessão:** express-session
- **Notificações:** web-push, node-cron
- **Service Worker:** `public/sw.js` para push notifications
- **Middleware:** `middleware/auth.js` protege rotas admin
- **Rotas RESTful** para CRUD de agendamentos, serviços, profissionais, horários, folgas, notificações, wallpapers
- **Push automático:** Notifica clientes 1h antes do agendamento (cron)
- **Push manual:** Admin pode enviar notificações pela dashboard
- **Autenticação:** Usuários admin, login e alteração de senha
- **Dashboard:** Estatísticas, filtros, CRUD, modais, responsivo
- **Agendamento:** Cliente escolhe serviço, profissional, data/hora, recebe confirmação e push
- **Wallpapers:** CRUD, seleção dinâmica, preview, integração total com dashboard e frontend
- **Preview de imagens:** Em modais de edição, cards de serviços e wallpapers
- **Personalização visual:** Escolha de plano de fundo, tema claro/escuro, responsividade
- **Compartilhamento:** Link direto para agendamento
- **Temas:** Claro/Escuro, persistente via localStorage

## Rotas Backend
- `/dashboard/login` — Login admin
- `/dashboard/dashboard` — Dashboard protegida
- `/dashboard/servicos` — CRUD de serviços
- `/dashboard/profissionais` — CRUD de profissionais
- `/dashboard/horarios-turnos` — CRUD de horários
- `/dashboard/folgas` — CRUD de folgas
- `/dashboard/barbearia` — CRUD de dados da barbearia
- `/dashboard/notificacoes` — Listar/criar/excluir notificações
- `/dashboard/enviar-push` — Envio manual de push
- `/dashboard/enviar-push-agendamento` — Push para cliente específico
- `/dashboard/alterar-senha` — Alteração de senha admin
- `/dashboard/wallpapers` — Listar wallpapers disponíveis
- `/dashboard/wallpaper-selecionado` — Get/Set wallpaper selecionado
- `/agendamento/novo` — Novo agendamento (cliente)
- `/agendamento/meus` — Listar agendamentos do cliente
- `/agendamento/excluir/:id` — Excluir agendamento
- `/push/manual` — Envio manual de push (backend)

## Notificações Push
- **Automáticas:** Enviadas 1h antes do agendamento (cron + web-push)
- **Manuais:** Enviadas pelo admin via dashboard
- **Service Worker:** Recebe e exibe notificações no navegador
- **Assinatura:** Cliente autoriza push ao agendar

## Service Worker
- Arquivo: `public/sw.js`
- Escuta eventos `push` e `notificationclick`
- Exibe notificações com título, corpo, ícone e link

## Autenticação e Middleware
- Middleware `requireLogin` protege rotas admin
- Sessão via cookies HTTP Only
- Login e alteração de senha admin
- Redirecionamento automático para login se não autenticado

## Wallpapers e Personalização Visual
- **Escolha dinâmica de plano de fundo do agendamento** pela dashboard
- **Cards de wallpapers** com preview de imagem e nome, carregados do banco de dados
- **CRUD de wallpapers**: adicionar, editar, ativar/desativar e remover planos de fundo
- **Preview de imagem** ao editar/adicionar wallpapers e serviços
- **Plano de fundo do agendamento** é refletido automaticamente na tela pública após seleção
- Suporte a imagens locais, externas e base64
- Responsivo e com destaque visual para o wallpaper selecionado

## Ícones e Recursos Visuais
- Ícones SVG: `icons/instagram.svg`, `icons/whatsapp.svg`
- FontAwesome para ícones gerais
- Imagens de serviços, barbearia e wallpapers
- Interface responsiva e moderna

## Personalização e Temas
- Suporte a tema claro/escuro
- Persistência do tema via localStorage
- Customização de cores via CSS
- **Plano de fundo do agendamento** personalizável por admin

## Dúvidas Frequentes
- **Como alterar as chaves VAPID?**
  Gere novas chaves com `npx web-push generate-vapid-keys` e substitua em `notificacoes.js` e `routes/dashboard.js`.
- **Como cadastrar um admin?**
  Insira manualmente na tabela `usuarios`.
- **Como trocar o WhatsApp/Instagram?**
  Edite pela dashboard em "Barbearia".
- **Como adicionar ou trocar wallpapers?**
  Use a dashboard para adicionar, editar ou selecionar wallpapers. Imagens podem ser locais, externas ou base64.
- **Como rodar em produção?**
  Configure variáveis de ambiente, use HTTPS e gere novas chaves VAPID.
- **Limite de upload de imagens?**
  O Express está configurado para aceitar imagens até 5MB por padrão. Ajuste em `server.js` se necessário.

---

> Desenvolvido por Pablo Eduardo Silva — 2025
> 
> Para dúvidas, abra uma issue no [GitHub](https://github.com/pabloedusilva/NaRegua-BarberApp/issues)
