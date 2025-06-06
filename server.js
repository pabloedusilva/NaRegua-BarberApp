const express = require('express');
const session = require('express-session');
const path = require('path');
const dashboardRoutes = require('./routes/dashboard');
const agendamentoRoutes = require('./routes/agendamento');
const db = require('./db/neon');
const dayjs = require('dayjs');

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


// Servir arquivos estáticos (exceto dashboard)
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Página inicial:        http://localhost:${port}/index`);
    console.log(`Dashboard:             http://localhost:${port}/dashboard/dashboard`);
});