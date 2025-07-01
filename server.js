const express = require('express');
const session = require('express-session');
const path = require('path');
const dashboardRoutes = require('./routes/dashboard');
const agendamentoRoutes = require('./routes/agendamento');
const imagensRoutes = require('./routes/imagens');
const alertasPromosRoutes = require('./routes/alertasPromos');
const { upload, compressAndSaveImage, compressAndSaveAvatar } = require('./middleware/upload');
const db = require('./db/neon');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
const BRAZIL_TZ = 'America/Sao_Paulo';
require('./utils/cron');

const app = express();
const port = 3000;

app.use('/dashboard', express.static(__dirname + '/dashboard'));
app.use(express.static('public'));

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
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rotas da dashboard (login e dashboard sem extensão)
app.use('/dashboard', dashboardRoutes);

// Rotas de agendamento
app.use('/agendamento', agendamentoRoutes);

// Rotas de imagens
app.use('/api', imagensRoutes);

// Rotas de alertas e promoções
app.use('/api/alertas-promos', alertasPromosRoutes);

// Servir arquivos estáticos (exceto dashboard)
app.use(express.static(path.join(__dirname, 'public')));

// Servir arquivos estáticos do diretório favicon
app.use('/favicon', express.static(path.join(__dirname, 'favicon')));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Rotas de upload de imagens com categorização
app.post('/api/upload/service', upload.single('image'), compressAndSaveImage('services'), (req, res) => {
    if (!req.processedFile) {
        return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }
    
    res.json({
        success: true,
        filename: req.processedFile.filename,
        path: req.processedFile.path,
        originalname: req.processedFile.originalname,
        size: req.processedFile.size,
        type: req.processedFile.type
    });
});

app.post('/api/upload/avatar', upload.single('avatar'), compressAndSaveAvatar, (req, res) => {
    if (!req.processedFile) {
        return res.status(400).json({ error: 'Nenhum avatar foi enviado' });
    }
    
    res.json({
        success: true,
        filename: req.processedFile.filename,
        path: req.processedFile.path,
        originalname: req.processedFile.originalname,
        size: req.processedFile.size,
        type: req.processedFile.type
    });
});

app.post('/api/upload/wallpaper', upload.single('image'), compressAndSaveImage('wallpapers'), (req, res) => {
    if (!req.processedFile) {
        return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }
    
    res.json({
        success: true,
        filename: req.processedFile.filename,
        path: req.processedFile.path,
        originalname: req.processedFile.originalname,
        size: req.processedFile.size,
        type: req.processedFile.type
    });
});

app.post('/api/upload/logo', upload.single('image'), compressAndSaveImage('logos'), (req, res) => {
    if (!req.processedFile) {
        return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }
    
    res.json({
        success: true,
        filename: req.processedFile.filename,
        path: req.processedFile.path,
        originalname: req.processedFile.originalname,
        size: req.processedFile.size,
        type: req.processedFile.type
    });
});

app.post('/api/upload/promo', upload.single('image'), compressAndSaveImage('promos'), (req, res) => {
    if (!req.processedFile) {
        return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }
    
    res.json({
        success: true,
        filename: req.processedFile.filename,
        path: req.processedFile.path,
        originalname: req.processedFile.originalname,
        size: req.processedFile.size,
        type: req.processedFile.type
    });
});

// Rota genérica para compatibilidade (usa services por padrão)
app.post('/api/upload/image', upload.single('image'), compressAndSaveImage('services'), (req, res) => {
    if (!req.processedFile) {
        return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }
    
    res.json({
        success: true,
        filename: req.processedFile.filename,
        path: req.processedFile.path,
        originalname: req.processedFile.originalname,
        size: req.processedFile.size,
        type: req.processedFile.type
    });
});

// Exemplo de endpoint para testar o horário do servidor no fuso do Brasil
app.get('/api/server-time', (req, res) => {
    const now = dayjs().tz(BRAZIL_TZ);
    res.json({
        iso: now.toISOString(),
        br: now.format('YYYY-MM-DD HH:mm:ss'),
        tz: BRAZIL_TZ
    });
});

// Adicione ANTES do app.listen:
app.get('/dashboard/servertime', (req, res) => {
    const now = dayjs().tz(BRAZIL_TZ);
    res.json({
        iso: now.toISOString(),
        br: now.format('YYYY-MM-DD HH:mm:ss'),
        tz: BRAZIL_TZ
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Página inicial:        http://localhost:${port}/index`);
    console.log(`Dashboard:             http://localhost:${port}/dashboard/dashboard`);
});