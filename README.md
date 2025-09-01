# NaRégua Barber App

Aplicação de agendamento de barbearia.

## Nova Estrutura (Separação Frontend / Backend)

```
backend/
	server.js
	routes/
	middleware/
	db/
	utils/
	servertime/
frontend/
	public/            (mover aqui a pasta public original)
	dashboard/         (mover aqui a pasta dashboard original)
	favicon/           (mover favicon/)
	icons/             (mover icons/)
```

IMPORTANTE: Mover manualmente as pastas `public`, `dashboard`, `favicon`, `icons` para dentro de `frontend/` no seu ambiente local (as imagens /uploads e demais assets) porque apenas os arquivos de código foram reorganizados automaticamente. Após mover, confira:

1. `frontend/public/index.html` acessível em http://localhost:3000/index
2. `frontend/dashboard/dashboard.html` acessível em http://localhost:3000/dashboard/dashboard
3. Diretório de uploads: `frontend/public/uploads` (mantém subpastas services, avatars, wallpapers, logos, promos, img/legacy)

O backend já aponta para `../frontend/...` para servir os arquivos. As rotas estão totalmente isoladas em `backend/routes` (pasta raiz antiga `routes/` removida).

## Scripts

```
npm install
npm run dev   # nodemon backend/server.js
npm run dev:watch # alternativa usando node --watch (sem nodemon)
npm start     # node backend/server.js
```

Execute sempre os comandos a partir da RAIZ do projeto (onde está package.json). Não execute `node backend/server.js` estando dentro da pasta `backend/` ou causará erro do tipo "Cannot find module '.../backend\\backend/server.js'".

## Variáveis de Ambiente

Criar `.env` com:
```
DATABASE_URL=postgresql://postgres:<senha>@<host>:<porta>/<db>
SMTP_HOST=...
SMTP_PORT=465
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=NaRégua Barbearia <contato@exemplo.com>
```

## Uploads

Uploads são salvos em `frontend/public/uploads/<categoria>` e servidos via `/uploads/...`.

## Desenvolvimento

1. Mover pastas de frontend para dentro de `frontend/` (se ainda não moveu).
2. Rodar `npm run dev`.
3. Acessar http://localhost:3000/index e http://localhost:3000/dashboard/login.

## Migrations (node-pg-migrate)

Scripts:
```
npm run migrate:create -- nome_da_migration
npm run migrate:up      # aplica
npm run migrate:down    # reverte último lote
```
Ao instalar (postinstall) o projeto tenta rodar migrate up automaticamente.

Banco Railway: Ajuste `DATABASE_URL` com a URL fornecida (Postgres). Em produção, garanta que a variável esteja definida antes do start.

### Deploy Railway (Postgres)

1. Crie o projeto no Railway e adicione um Postgres.
2. Copie a variável `DATABASE_URL` gerada (geralmente já vem com parâmetros). Caso não inclua `sslmode`, a aplicação detecta Railway e ativa automaticamente SSL em modo `no-verify` para evitar o erro de certificado autoassinado.
3. (Opcional) Para controlar manualmente:
	- `DB_SSL=false` desliga SSL.
	- `DB_SSL=true` força SSL com verificação (`rejectUnauthorized=true`).
	- `DB_SSLMODE=no-verify|require|disable|allow|prefer` sobrescreve a lógica automática.
4. Adicione as variáveis SMTP se for usar envio de e‑mail.
5. Configure o comando de start no Railway: `npm start` (ele fará build + start). Para rodar migrations no painel: `npm run migrate:up` (uma vez). Você também pode criar um serviço (Deploy Hook) que execute migrations antes do start.
6. Se aparecer erro `SELF_SIGNED_CERT_IN_CHAIN`, verifique se não forçou `DB_SSLMODE=require` erroneamente. Remova ou mude para `no-verify`.

Exemplo de variáveis no Railway:
```
DATABASE_URL=postgresql://usuario:senha@host:5432/db
DB_SSLMODE=no-verify  # (opcional)
PORT=8080             # Railway normalmente injeta PORT automaticamente
```

## Licença

Ver arquivo LICENSE.

