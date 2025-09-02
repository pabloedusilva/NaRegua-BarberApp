const express = require('express');
const session = require('express-session');
const path = require('path');
const dashboardRoutes = require('./routes/dashboard');
const agendamentoRoutes = require('./routes/agendamento');
const imagensRoutes = require('./routes/imagens');
const alertasPromosRoutes = require('./routes/alertasPromos');
const { upload, compressAndSaveImage, compressAndSaveAvatar } = require('./middleware/upload');
const db = require('./db/database');
require('./utils/cron');
const { nowBrazilParts, setVirtual, advanceMinutes, mode } = require('./utils/clock');

// Diretórios frontend
const FRONTEND_ROOT = path.join(__dirname, '..', 'frontend');
const PUBLIC_DIR = path.join(FRONTEND_ROOT, 'public');
const DASHBOARD_DIR = path.join(FRONTEND_ROOT, 'dashboard');
const FAVICON_DIR = path.join(FRONTEND_ROOT, 'favicon');

// (hora do Brasil centralizada em utils/clock.js)

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

// Middleware de disponibilidade do banco (evita 500 ruidosos)
app.use((req, res, next) => {
    if (!db.ready && !req.path.startsWith('/servertime')) {
        return res.status(503).json({ success: false, message: 'Serviço temporariamente indisponível. Banco desconectado.' });
    }
    next();
});

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

// Rota centralizada para data/hora do servidor (adiciona modo: live ou fixed)
// clock mode via novo módulo clock
app.get('/servertime', (req, res) => {
    const p = nowBrazilParts();
    res.json({ br: p.datetime, mode: p.mode, epoch: p.epoch });
});

// Servir o arquivo server-time.js centralizado da pasta /servertime
app.get('/js/server-time.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'servertime', 'server-time.js'));
});
app.get('/dashboard/js/server-time.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'servertime', 'server-time.js'));
});

// Endpoint administrativo para alterar o clock virtual (requer sessão admin)
app.post('/admin/set-time', async (req, res) => {
    try {
        if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Acesso negado' });
        }
        const { datetime } = req.body; // esperado: YYYY-MM-DD HH:mm:ss
        if(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(datetime||'')) {
            return res.status(400).json({ success:false, message:'Formato inválido. Use YYYY-MM-DD HH:mm:ss' });
        }
        const before = nowBrazilParts();
        const after = setVirtual(datetime);
        console.log(`[CLOCK] Alteração manual por admin ${req.session.user.username}: ${before.datetime} -> ${after.datetime} (${after.mode})`);
        res.json({ success: true, newTime: after.datetime, mode: after.mode, epoch: after.epoch });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Opcional: avançar minutos
app.post('/admin/advance-minutes', (req, res) => {
    try {
        if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Acesso negado' });
        }
        const { minutes = 0 } = req.body;
        const before = nowBrazilParts();
        const after = advanceMinutes(minutes);
        console.log(`[CLOCK] Avanço manual (+${minutes}m) por admin ${req.session.user.username}: ${before.datetime} -> ${after.datetime}`);
        res.json({ success: true, newTime: after.datetime, mode: after.mode, epoch: after.epoch });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// Endpoint para consultar estado atual do clock
app.get('/admin/get-time', (req, res) => {
    if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    const p = nowBrazilParts();
    res.json({ success:true, time: p.datetime, epoch: p.epoch, mode: p.mode });
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
