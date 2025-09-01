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
npm start     # node backend/server.js
```

## Variáveis de Ambiente

Criar `.env` com:
```
DATABASE_URL=...
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

## Licença

Ver arquivo LICENSE.

