const express = require('express');
const session = require('express-session');
const path = require('path');
const dashboardRoutes = require('./routes/dashboard');
const agendamentoRoutes = require('./routes/agendamento');
const imagensRoutes = require('./routes/imagens');
const alertasPromosRoutes = require('./routes/alertasPromos');
const { upload, compressAndSaveImage, compressAndSaveAvatar } = require('./middleware/upload');
const db = require('./db/neon');
require('./utils/cron');
const { getBrazilNow } = require('./utils/time');

// Diretórios frontend
const FRONTEND_ROOT = path.join(__dirname, '..', 'frontend');
const PUBLIC_DIR = path.join(FRONTEND_ROOT, 'public');
const DASHBOARD_DIR = path.join(FRONTEND_ROOT, 'dashboard');
const FAVICON_DIR = path.join(FRONTEND_ROOT, 'favicon');

// (hora do Brasil centralizada em utils/time.js)

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Arquivos estáticos
app.use('/dashboard', express.static(DASHBOARD_DIR));
app.use(express.static(PUBLIC_DIR));

// Sessão
app.use(session({
    secret: 'um-segredo-bem-forte-aqui',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota para index sem extensão
app.get(['/', '/index'], (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Rotas da dashboard (login e dashboard sem extensão)
app.use('/dashboard', dashboardRoutes);

// Rotas de agendamento
app.use('/agendamento', agendamentoRoutes);

// Rotas de imagens
app.use('/api', imagensRoutes);

// Rotas de alertas e promoções
app.use('/api/alertas-promos', alertasPromosRoutes);

// Servir arquivos estáticos adicionais
app.use('/favicon', express.static(FAVICON_DIR));
app.use('/uploads', express.static(path.join(PUBLIC_DIR, 'uploads')));

// Rotas de upload de imagens com categorização
app.post('/api/upload/service', upload.single('image'), compressAndSaveImage('services'), (req, res) => {
    if (!req.processedFile) return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    res.json({ success: true, ...req.processedFile });
});

app.post('/api/upload/avatar', upload.single('avatar'), compressAndSaveAvatar, (req, res) => {
    if (!req.processedFile) return res.status(400).json({ error: 'Nenhum avatar foi enviado' });
    res.json({ success: true, ...req.processedFile });
});

app.post('/api/upload/wallpaper', upload.single('image'), compressAndSaveImage('wallpapers'), (req, res) => {
    if (!req.processedFile) return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    res.json({ success: true, ...req.processedFile });
});

app.post('/api/upload/logo', upload.single('image'), compressAndSaveImage('logos'), (req, res) => {
    if (!req.processedFile) return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    res.json({ success: true, ...req.processedFile });
});

app.post('/api/upload/promo', upload.single('image'), compressAndSaveImage('promos'), (req, res) => {
    if (!req.processedFile) return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    res.json({ success: true, ...req.processedFile });
});

// Rota genérica para compatibilidade
app.post('/api/upload/image', upload.single('image'), compressAndSaveImage('services'), (req, res) => {
    if (!req.processedFile) return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    res.json({ success: true, ...req.processedFile });
});

// Rota centralizada para data/hora do servidor (somente formato brasileiro)
app.get('/servertime', (req, res) => {
    const brazilTime = getBrazilNow();
    const year = brazilTime.getFullYear();
    const month = String(brazilTime.getMonth() + 1).padStart(2, '0');
    const day = String(brazilTime.getDate()).padStart(2, '0');
    const hours = String(brazilTime.getHours()).padStart(2, '0');
    const minutes = String(brazilTime.getMinutes()).padStart(2, '0');
    const seconds = String(brazilTime.getSeconds()).padStart(2, '0');
    res.json({ br: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}` });
});

// Servir o arquivo server-time.js centralizado da pasta /servertime
app.get('/js/server-time.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'servertime', 'server-time.js'));
});
app.get('/dashboard/js/server-time.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'servertime', 'server-time.js'));
});

// Iniciar servidor
const server = app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Página inicial: http://localhost:${port}/index`);
    console.log(`Dashboard:      http://localhost:${port}/dashboard/dashboard`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Porta ${port} já está em uso. Defina outra porta em PORT no ambiente (.env) ou finalize o processo que está usando a porta.`);
    } else {
        console.error('Erro ao iniciar servidor:', err);
    }
});
