const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

// Criar novo agendamento
router.post('/novo', async(req, res) => {
    const { nome, telefone, servico, profissional, data, hora, preco } = req.body;
    try {
        await db.query(
            'INSERT INTO agendamentos (nome, telefone, servico, profissional, data, hora, preco) VALUES (?, ?, ?, ?, ?, ?, ?)', [nome, telefone, servico, profissional, data, hora, preco]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao salvar agendamento.' });
    }
});

// Buscar agendamentos por telefone
router.get('/meus', async(req, res) => {
    const { telefone } = req.query;
    try {
        const [rows] = await db.query(
            'SELECT * FROM agendamentos WHERE telefone = ? ORDER BY data DESC, hora DESC', [telefone]
        );
        res.json({ success: true, agendamentos: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar agendamentos.' });
    }
});

module.exports = router;