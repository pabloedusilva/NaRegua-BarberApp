const express = require('express');
const session = require('express-session');
const path = require('path');
const dashboardRoutes = require('./routes/dashboard');
const agendamentoRoutes = require('./routes/agendamento');
const pushRoutes = require('./routes/push'); // ADICIONE ESTA LINHA

const app = express();
const port = 3000;

// Sessão
app.use(session({
    secret: 'um-segredo-bem-forte-aqui',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota para index sem extensão
app.get(['/', '/index'], (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rotas da dashboard (login e dashboard sem extensão)
app.use('/dashboard', dashboardRoutes);

// Rotas de agendamento
app.use('/agendamento', agendamentoRoutes);

// Rotas de push
app.use('/push', pushRoutes); // ADICIONE ESTA LINHA

// Servir arquivos estáticos (exceto dashboard)
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Página inicial:        http://localhost:${port}/index`);
    console.log(`Dashboard:             http://localhost:${port}/dashboard/dashboard`);
});