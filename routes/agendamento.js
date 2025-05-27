const express = require('express');
const router = express.Router();
const db = require('../db/mysql');

// Criar novo agendamento
router.post('/novo', async(req, res) => {
    let { nome, telefone, servico, profissional, data, hora, preco, subscription } = req.body;
    try {
        // Se nome não veio, busca o nome já cadastrado para esse telefone
        if (!nome) {
            const [rows] = await db.query('SELECT nome FROM agendamentos WHERE telefone = ? AND nome IS NOT NULL AND nome != "" ORDER BY id DESC LIMIT 1', [telefone]);
            if (rows.length > 0) nome = rows[0].nome;
        }
        // Salva o agendamento
        const [result] = await db.query(
            'INSERT INTO agendamentos (nome, telefone, servico, profissional, data, hora, preco) VALUES (?, ?, ?, ?, ?, ?, ?)', [nome, telefone, servico, profissional, data, hora, preco]
        );

        // Cria notificação para dashboard
        await db.query(
            'INSERT INTO notificacoes (titulo, mensagem, data) VALUES (?, ?, NOW())', [
                'Novo agendamento',
                `Novo agendamento para ${servico} com ${profissional} em ${new Date(data).toLocaleDateString('pt-BR')} às ${hora}.`
            ]
        );

        const agendamentoId = result.insertId;

        // Salva a subscription (evita duplicidade)
        if (subscription && subscription.endpoint) {
            // Remove subscriptions antigas para o mesmo endpoint
            await db.query('DELETE FROM subscriptions WHERE endpoint = ?', [subscription.endpoint]);
            await db.query(
                'INSERT INTO subscriptions (agendamento_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)', [
                    agendamentoId,
                    subscription.endpoint,
                    subscription.keys.p256dh,
                    subscription.keys.auth
                ]
            );
        }
        // Salva ou atualiza o cliente
        if (telefone) {
            await db.query(
                'INSERT INTO clientes (nome, telefone) VALUES (?, ?) ON DUPLICATE KEY UPDATE nome = IF(VALUES(nome) != "", VALUES(nome), nome)', [nome, telefone]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao salvar agendamento.' });
    }
});

// Buscar cliente por telefone (para saber se já existe cadastro) E LISTAR AGENDAMENTOS
router.get('/meus', async(req, res) => {
    const { telefone } = req.query;
    try {
        // Busca cliente
        const [clientes] = await db.query(
            'SELECT * FROM clientes WHERE telefone = ? LIMIT 1', [telefone]
        );
        // Busca agendamentos
        const [agendamentos] = await db.query(
            'SELECT * FROM agendamentos WHERE telefone = ? ORDER BY data DESC, hora DESC', [telefone]
        );
        res.json({
            success: true,
            cliente: clientes.length > 0 ? clientes[0] : null,
            agendamentos: agendamentos || []
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar cliente/agendamentos.' });
    }
});

// Excluir agendamento por ID
router.delete('/excluir/:id', async(req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM agendamentos WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao excluir agendamento.' });
    }
});

module.exports = router;