const express = require('express');
const router = express.Router();
const db = require('../db/neon');

// Criar novo agendamento
router.post('/novo', async(req, res) => {
    let { nome, telefone, servico, profissional, data, hora, preco, subscription } = req.body;
    try {
        // Verifica se o telefone já está cadastrado como cliente
        let cliente = null;
        if (telefone) {
            const clientes = await db `SELECT * FROM clientes WHERE telefone = ${telefone} LIMIT 1`;
            if (clientes.length > 0) {
                cliente = clientes[0];
                if (!nome) nome = cliente.nome;
            }
        }
        // Se não existe cliente e não veio nome, retorna erro para pedir nome
        if (!cliente && (!nome || nome.trim() === '')) {
            return res.status(400).json({ success: false, message: 'Nome obrigatório para novo cliente.' });
        }
        // Se não existe cliente, cadastra
        if (!cliente && telefone) {
            await db `
                INSERT INTO clientes (nome, telefone)
                VALUES (${nome}, ${telefone})
                ON CONFLICT (telefone) DO NOTHING
            `;
        }
        // Salva o agendamento
        await db `
            INSERT INTO agendamentos (nome, telefone, servico, profissional, data, hora, preco)
            VALUES (${nome}, ${telefone}, ${servico}, ${profissional}, ${data}, ${hora}, ${preco})
        `;
        // Cria notificação para dashboard (data UTC, mensagem curta)
        const titulo = 'Novo agendamento';
        const msg = `Novo agendamento para ${servico?.toString().slice(0,40)} com ${profissional?.toString().slice(0,40)} em ${new Date(data).toLocaleDateString('pt-BR')} às ${hora}.`;
        await db `
            INSERT INTO notificacoes (titulo, mensagem, data)
            VALUES (${titulo}, ${msg}, ${new Date().toISOString()})
        `;
        // Salva a subscription (evita duplicidade)
        if (subscription && subscription.endpoint) {
            await db `DELETE FROM subscriptions WHERE endpoint = ${subscription.endpoint}`;
            await db `
                INSERT INTO subscriptions (agendamento_id, endpoint, p256dh, auth)
                VALUES (currval('agendamentos_id_seq'), ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth})
            `;
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
        const clientes = await db `SELECT * FROM clientes WHERE telefone = ${telefone} LIMIT 1`;
        // Busca agendamentos
        const agendamentos = await db `SELECT * FROM agendamentos WHERE telefone = ${telefone} ORDER BY data DESC, hora DESC`;
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
        await db `DELETE FROM agendamentos WHERE id = ${id}`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao excluir agendamento.' });
    }
});

module.exports = router;