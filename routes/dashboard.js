const express = require('express');
const router = express.Router();
const db = require('../db/mysql');
const { requireLogin } = require('../middleware/auth');
const path = require('path');

// Login (POST)
router.post('/login', async(req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE username = ? AND password = ? LIMIT 1', [username, password]
        );
        if (rows.length > 0) {
            if (rows[0].role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Acesso restrito a administradores.' });
            }
            req.session.user = { id: rows[0].id, username: rows[0].username, role: rows[0].role };
            return res.json({ success: true });
        } else {
            return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/dashboard/login');
    });
});

// Dashboard protegido (apenas admin)
router.get('/dashboard', requireLogin, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Acesso restrito a administradores.');
    }
    res.sendFile(path.join(__dirname, '..', 'dashboard', 'dashboard.html'));
});

// Login page (não protegido)
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dashboard', 'login-dashboard.html'));
});

// Rota para buscar total de agendamentos
router.get('/total-agendamentos', requireLogin, async(req, res) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) AS total FROM agendamentos');
        res.json({ total: rows[0].total });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar total de agendamentos.' });
    }
});

// Rota para buscar agendamentos do dia atual
router.get('/agendamentos-hoje', requireLogin, async(req, res) => {
    try {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        const dataHoje = `${ano}-${mes}-${dia}`;
        const [rows] = await db.query(
            'SELECT * FROM agendamentos WHERE data = ? ORDER BY hora ASC', [dataHoje]
        );
        res.json({ agendamentos: rows });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar agendamentos de hoje.' });
    }
});

// Rota pública para buscar serviços (para o frontend)
router.get('/servicos', async(req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM servicos WHERE ativo = 1 ORDER BY id ASC');
        res.json({ success: true, servicos: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar serviços.' });
    }
});

module.exports = router;