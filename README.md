## Testes

- **Dashboard:** https://naregua-barberapp-2.onrender.com/dashboard/dashboard
- **Index:** https://naregua-barberapp-2.onrender.com/

## Logo
<p align="center">
  <img src="https://github.com/user-attachments/assets/eda4e558-eddd-48f2-bdb6-89be7c141b70" alt="logo" width="400" height="400">
</p>

# NaRégua BarberApp

Sistema completo de agendamento online para barbearias, com dashboard administrativa, notificações push, controle de serviços, profissionais, horários, folgas, autenticação, integração com WhatsApp e Instagram, **personalização visual com wallpapers dinâmicos**, preview de imagens, interface moderna e responsiva, e recursos avançados de personalização, segurança e automação.

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
- [Limitações e Considerações](#limitações-e-considerações)
- [Dicas de Produção e Segurança](#dicas-de-produção-e-segurança)
- [Exemplos de Uso e Fluxos](#exemplos-de-uso-e-fluxos)
- [Dúvidas Frequentes](#dúvidas-frequentes)
- [Roadmap e Contribuição](#roadmap-e-contribuição)
- [Licença](#licença)

---

## Descrição Geral
O **NaRégua BarberApp** é um sistema web completo para barbearias, permitindo que clientes agendem horários online e que administradores gerenciem serviços, profissionais, horários, folgas, notificações e informações da barbearia. Possui dashboard protegida por login, notificações automáticas e manuais, integração com WhatsApp e Instagram, interface responsiva, personalização visual avançada (wallpapers dinâmicos, temas), preview de imagens, estatísticas, e recursos de segurança e automação.

### Principais Diferenciais
- CRUD completo de todos os recursos (serviços, profissionais, horários, folgas, wallpapers, notificações, barbearia)
- Notificações push automáticas (lembrete 1h antes do agendamento) e manuais (admin)
- Personalização visual total: wallpapers dinâmicos, tema claro/escuro, preview de imagens
- Integração com WhatsApp e Instagram (links diretos, edição pela dashboard)
- Service Worker para notificações e experiência PWA
- Estatísticas em tempo real (agendamentos por dia, semana, mês, total de clientes)
- Interface moderna, responsiva e acessível
- Segurança: autenticação, middleware, cookies HTTP Only, proteção de rotas
- Suporte a imagens locais, externas e base64
- Upload de imagens com preview instantâneo
- Compartilhamento fácil do link de agendamento
- Persistência de preferências (tema, wallpaper) via localStorage e banco

## Funcionalidades
- Agendamento online de serviços (com seleção de serviço, profissional, data/hora, confirmação e push)
- Dashboard administrativa (restrita a admin, com login seguro)
- Gerenciamento completo de serviços, profissionais, horários, folgas e wallpapers
- Notificações push automáticas (cron) e manuais (dashboard)
- Autenticação de usuários admin, alteração de senha, sessão segura
- Visualização e edição de informações da barbearia (nome, endereço, redes sociais, foto)
- Integração com WhatsApp e Instagram (links e edição)
- Controle de tema (claro/escuro), persistente
- Service Worker para notificações push e experiência PWA
- Estatísticas de agendamentos (dia, semana, mês, total)
- Compartilhamento de link de agendamento (botão na dashboard)
- Personalização visual com wallpapers dinâmicos (CRUD, seleção, preview)
- Preview de imagens em modais e cards (serviços, wallpapers, barbearia)
- Seleção dinâmica de plano de fundo do agendamento (refletido em tempo real)
- CRUD completo de wallpapers (adicionar, editar, ativar/desativar, remover)
- Interface responsiva, moderna e acessível
- Filtros e busca de agendamentos por período
- Upload de imagens com limite configurável
- Proteção de rotas admin via middleware
- Sessão via cookies HTTP Only
- Redirecionamento automático para login se não autenticado
- Logs de notificações e agendamentos
- Suporte a múltiplos turnos por dia e folgas especiais
- Painel de estatísticas e gráficos (dashboard)
- Suporte a imagens em base64 para maior flexibilidade
- Atualização automática de dados (sem reload manual)

## Arquitetura e Estrutura de Pastas
```
├── dashboard/                # Frontend da dashboard administrativa
│   ├── dashboard.html        # Dashboard principal
│   ├── login-dashboard.html  # Tela de login/cadastro admin
│   ├── css/                  # Estilos da dashboard
│   └── js/                   # Scripts da dashboard
├── db/
│   └── mysql.js              # Conexão com banco MySQL
├── icons/                    # Ícones SVG (Instagram, WhatsApp)
├── middleware/
│   └── auth.js               # Middleware de autenticação
├── public/                   # Frontend público (cliente)
│   ├── index.html            # Página de agendamento
│   ├── sw.js                 # Service Worker para push
│   ├── css/                  # Estilos do frontend
│   ├── js/                   # Scripts do frontend
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

### Detalhes das Pastas/Arquivos
- `dashboard/`: HTML, CSS e JS da dashboard admin, com modais, gráficos, CRUD, filtros, preview de imagens, seleção de wallpapers, etc.
- `public/`: Frontend do cliente, com agendamento, seleção de serviço/profissional, confirmação, integração com push, preview de imagens, seleção de tema, etc.
- `routes/`: Rotas Express para todos os recursos (RESTful), protegidas por middleware quando necessário.
- `middleware/auth.js`: Middleware de autenticação, protege rotas admin.
- `notificacoes.js`: Lógica de notificações automáticas (cron + web-push).
- `server.js`: Inicialização do servidor Express, configuração de middlewares, rotas, static, etc.
- `db/mysql.js`: Conexão e pool com banco MySQL.
- `scriptDB.sql`: Script completo para criação e seed do banco de dados.
- `icons/`: SVGs para redes sociais e ícones customizados.

## Requisitos
- Node.js >= 14.x
- MySQL >= 5.7
- Navegador moderno (para notificações push, PWA, temas)
- Recomenda-se HTTPS em produção (para push notifications)

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
   - Gere com: `npx web-push generate-vapid-keys`
   - Substitua as chaves em `notificacoes.js` e `routes/dashboard.js`.
5. **Inicie o servidor:**
   ```powershell
   npm start
   ```
6. **Acesse:**
   - Página pública: [http://localhost:3000/index](http://localhost:3000/index)
   - Dashboard admin: [http://localhost:3000/dashboard/dashboard](http://localhost:3000/dashboard/dashboard)

### Variáveis de Ambiente
- Configure variáveis de ambiente para produção (porta, credenciais, chaves, etc) usando `.env` ou diretamente no ambiente.
- Recomenda-se configurar:
  - `PORT` (porta do servidor)
  - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` (banco)
  - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (push)

## Scripts Disponíveis
- `npm start` — Inicia o servidor Express
- Outros scripts podem ser adicionados para build, seed, backup, restore, etc.

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
- Tabelas auxiliares: logs, estatísticas, etc (pode ser expandido)

### Wallpapers (Planos de Fundo)
- Tabela `wallpapers` armazena nome, url/base64 e status de cada plano de fundo.
- O campo `url` pode ser um caminho local (`/img/background1.jpg`), uma URL externa ou base64.
- O campo `ativo` permite ativar/desativar wallpapers.
- A tabela `barbearia` possui o campo `wallpaper_id` para o plano de fundo selecionado.

### Exemplos de Queries
- Buscar agendamentos do dia:
  ```sql
  SELECT * FROM agendamentos WHERE data = CURDATE();
  ```
- Buscar serviços ativos:
  ```sql
  SELECT * FROM servicos WHERE ativo = 1;
  ```
- Buscar wallpapers ativos:
  ```sql
  SELECT * FROM wallpapers WHERE ativo = 1;
  ```

### Backup e Restore
- Faça backup regular do banco (mysqldump) e da pasta `public/img/`.
- Para restaurar, basta importar o dump e copiar as imagens.

## Detalhes Técnicos
- **Backend:** Node.js, Express, MySQL, RESTful
- **Frontend:** HTML, CSS, JS puro, FontAwesome, Animate.css
- **Sessão:** express-session, cookies HTTP Only
- **Notificações:** web-push, node-cron, Service Worker
- **Service Worker:** `public/sw.js` para push notifications e PWA
- **Middleware:** `middleware/auth.js` protege rotas admin
- **Rotas RESTful** para CRUD de todos os recursos
- **Push automático:** Notifica clientes 1h antes do agendamento (cron)
- **Push manual:** Admin pode enviar notificações pela dashboard
- **Autenticação:** Usuários admin, login seguro, alteração de senha
- **Dashboard:** Estatísticas, filtros, CRUD, modais, preview, responsivo
- **Agendamento:** Cliente escolhe serviço, profissional, data/hora, recebe confirmação e push
- **Wallpapers:** CRUD, seleção dinâmica, preview, integração total com dashboard e frontend
- **Preview de imagens:** Em modais de edição, cards de serviços e wallpapers
- **Personalização visual:** Escolha de plano de fundo, tema claro/escuro, responsividade
- **Compartilhamento:** Link direto para agendamento
- **Temas:** Claro/Escuro, persistente via localStorage
- **Logs:** Logs de notificações, agendamentos, erros (pode ser expandido)
- **Performance:** Carregamento assíncrono, atualização automática, otimização de imagens
- **Acessibilidade:** Interface com contraste, navegação por teclado, ARIA nos ícones
- **Internacionalização:** Estrutura pronta para tradução (strings centralizadas)
- **SEO e PWA:** Manifest, favicon, meta tags, Service Worker

## Rotas Backend
- `/dashboard/login` — Login admin (POST)
- `/dashboard/dashboard` — Dashboard protegida (GET)
- `/dashboard/servicos` — CRUD de serviços (GET, POST, PUT, DELETE)
- `/dashboard/profissionais` — CRUD de profissionais
- `/dashboard/horarios-turnos` — CRUD de horários
- `/dashboard/folgas` — CRUD de folgas
- `/dashboard/barbearia` — CRUD de dados da barbearia
- `/dashboard/notificacoes` — Listar/criar/excluir notificações
- `/dashboard/enviar-push` — Envio manual de push
- `/dashboard/enviar-push-agendamento` — Push para cliente específico
- `/dashboard/alterar-senha` — Alteração de senha admin
- `/dashboard/wallpapers` — Listar/adicionar/editar/remover wallpapers
- `/dashboard/wallpaper-selecionado` — Get/Set wallpaper selecionado
- `/dashboard/servertime` — Data/hora do servidor (GET)
- `/dashboard/total-agendamentos` — Total de agendamentos (GET)
- `/dashboard/total-clientes` — Total de clientes (GET)
- `/agendamento/novo` — Novo agendamento (cliente, POST)
- `/agendamento/meus` — Listar agendamentos do cliente
- `/agendamento/excluir/:id` — Excluir agendamento
- `/push/manual` — Envio manual de push (backend)

### Exemplos de Payloads
- **Novo agendamento:**
  ```json
  {
    "nome": "João",
    "telefone": "11999999999",
    "servico": "Corte",
    "profissional": "Pablo",
    "data": "2025-05-24",
    "hora": "14:00",
    "preco": 30.00,
    "subscription": { ... }
  }
  ```
- **Adicionar serviço:**
  ```json
  {
    "nome": "Barba",
    "tempo": "30min",
    "preco": 20.00,
    "imagem": "img/servicos/barba.jpg"
  }
  ```

## Notificações Push
- **Automáticas:** Enviadas 1h antes do agendamento (cron + web-push)
- **Manuais:** Enviadas pelo admin via dashboard
- **Service Worker:** Recebe e exibe notificações no navegador
- **Assinatura:** Cliente autoriza push ao agendar
- **Exemplo de fluxo:**
  1. Cliente agenda e aceita notificações
  2. Subscription é salva no banco
  3. Notificação automática é enviada 1h antes
  4. Admin pode enviar push manual para todos ou para um cliente específico

## Service Worker
- Arquivo: `public/sw.js`
- Escuta eventos `push` e `notificationclick`
- Exibe notificações com título, corpo, ícone e link
- Permite experiência PWA (instalável, offline básico)
- Atualização automática do Service Worker

## Autenticação e Middleware
- Middleware `requireLogin` protege rotas admin
- Sessão via cookies HTTP Only
- Login e alteração de senha admin
- Redirecionamento automático para login se não autenticado
- Proteção contra acesso não autorizado
- Senhas armazenadas com hash (recomenda-se bcrypt em produção)

## Wallpapers e Personalização Visual
- **Escolha dinâmica de plano de fundo do agendamento** pela dashboard
- **Cards de wallpapers** com preview de imagem e nome, carregados do banco de dados
- **CRUD de wallpapers**: adicionar, editar, ativar/desativar e remover planos de fundo
- **Preview de imagem** ao editar/adicionar wallpapers e serviços
- **Plano de fundo do agendamento** é refletido automaticamente na tela pública após seleção
- Suporte a imagens locais, externas e base64
- Responsivo e com destaque visual para o wallpaper selecionado
- Persistência do wallpaper selecionado no banco e no frontend

## Ícones e Recursos Visuais
- Ícones SVG: `icons/instagram.svg`, `icons/whatsapp.svg`
- FontAwesome para ícones gerais
- Imagens de serviços, barbearia e wallpapers
- Interface responsiva e moderna
- Preview de imagens em todos os CRUDs

## Personalização e Temas
- Suporte a tema claro/escuro
- Persistência do tema via localStorage
- Customização de cores via CSS
- **Plano de fundo do agendamento** personalizável por admin
- Interface responsiva e acessível
- Preferências do usuário salvas localmente

## Limitações e Considerações
- Push notifications exigem HTTPS em produção
- Limite de upload de imagens: 5MB (ajustável em `server.js`)
- Não há painel de cadastro de admin (inserir manualmente na tabela `usuarios`)
- Não há integração nativa com gateways de pagamento (pode ser expandido)
- Não há sistema de permissões por perfil (apenas admin)
- Não há logs avançados (pode ser expandido)
- Não há integração contínua/testes automatizados (pode ser adicionado)

## Dicas de Produção e Segurança
- Gere novas chaves VAPID para produção
- Use HTTPS obrigatoriamente
- Configure variáveis de ambiente para credenciais e chaves
- Faça backup regular do banco e das imagens
- Limite o upload de imagens e valide extensões
- Use senhas fortes para admin
- Considere usar bcrypt para hash de senhas
- Monitore logs de erro e acesso
- Atualize dependências regularmente

## Exemplos de Uso e Fluxos
### Fluxo de Agendamento (Cliente)
1. Cliente acessa `/index`, escolhe serviço, profissional, data/hora
2. Confirma dados, insere telefone, aceita notificações
3. Recebe confirmação visual e push (se aceitou)
4. Pode visualizar agendamentos futuros

### Fluxo de Gerenciamento (Admin)
1. Admin faz login em `/dashboard/login`
2. Acessa dashboard com estatísticas, CRUD, filtros
3. Gerencia serviços, profissionais, horários, folgas, wallpapers
4. Envia notificações push manuais
5. Edita informações da barbearia, redes sociais, foto
6. Visualiza logs e estatísticas

### Fluxo de Personalização
1. Admin adiciona/edita wallpapers na dashboard
2. Seleciona wallpaper ativo (refletido no frontend)
3. Altera tema claro/escuro (persistente)
4. Preview de imagens em todos os CRUDs

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
- **Como restaurar o banco ou imagens?**
  Importe o dump SQL e copie a pasta `public/img/`.
- **Como fazer backup?**
  Use `mysqldump` para o banco e backup manual das imagens.
- **Como customizar temas?**
  Edite os arquivos CSS em `public/css/` e `dashboard/css/`.
- **Como adicionar novos serviços/profissionais?**
  Use o CRUD na dashboard.

## Roadmap e Contribuição
- [ ] Integração com gateways de pagamento
- [ ] Permissões por perfil (admin, atendente, etc)
- [ ] Logs avançados e painel de auditoria
- [ ] Testes automatizados e integração contínua
- [ ] Internacionalização completa (i18n)
- [ ] API pública para integrações externas
- [ ] Melhorias de acessibilidade e SEO
- [ ] App mobile (PWA ou nativo)

Contribuições são bem-vindas! Ara uma issue ou pull request.

## Galeria do Projeto

![image](https://github.com/user-attachments/assets/a6f03961-5218-40a4-b091-bc02bf82219e)

---

![image](https://github.com/user-attachments/assets/ade82ddf-d45d-44f6-84df-59e9d4913775)

---

![image](https://github.com/user-attachments/assets/28fb3984-c8d4-4346-994a-e50cb14608d6)

---

![image](https://github.com/user-attachments/assets/61b312d9-8efd-4237-9449-478510b23a37)

---

![image](https://github.com/user-attachments/assets/64e872cf-7223-4e9d-9b23-e5322fa228ff)

---

![image](https://github.com/user-attachments/assets/eca935fd-6ed6-4bc8-95d9-ff417624a307)

---

![image](https://github.com/user-attachments/assets/5ddb4cf1-5f28-4e98-9e23-4046ffc0f029)

---

![image](https://github.com/user-attachments/assets/b1709ea6-17f3-4838-9d33-f64731a3f1b7)

---

![image](https://github.com/user-attachments/assets/cdeef3d9-26e5-43ed-83e8-f31178b2d44d)

---

![image](https://github.com/user-attachments/assets/d8effebc-531c-4658-a35f-6413bd54dc4f)

---

![image](https://github.com/user-attachments/assets/a47f4aff-b3f2-423f-a241-9389bb9c7c72)

---

![image](https://github.com/user-attachments/assets/6a932047-4dbf-449a-bea1-da11eb1a6f15)

---

![image](https://github.com/user-attachments/assets/b01ad839-c726-417d-86a2-f94a1286b86c)

---

![image](https://github.com/user-attachments/assets/c421780b-7075-49b1-bf39-e9e86377fc57)

---

![image](https://github.com/user-attachments/assets/f38c0866-597e-4f81-b387-885c2bccaef9)
















## Licença
MIT. Veja o arquivo LICENSE.

---

> Desenvolvido por Pablo Eduardo Silva — 2025
> 
> Para dúvidas, abra uma issue no [GitHub](https://github.com/pabloedusilva/NaRegua-BarberApp/issues)
