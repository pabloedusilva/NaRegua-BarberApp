const express = require('express');
const router = express.Router();
const db = require('../db/neon');
const { sendConfirmationEmail, sendBarberNotification } = require('../utils/mailer');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
dayjs.extend(timezone);
const BRAZIL_TZ = 'America/Sao_Paulo';

// Criar novo agendamento
router.post('/novo', async(req, res) => {
    let { nome, telefone, servico, profissional, data, hora, preco, subscription, email } = req.body;
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
                INSERT INTO clientes (nome, telefone, email)
                VALUES (${nome}, ${telefone}, ${email || null})
                ON CONFLICT (telefone) DO NOTHING
            `;
        } else if (cliente && email && (!cliente.email || cliente.email !== email)) {
            // Se já existe cliente mas não tem email salvo, ou mudou, atualiza
            await db `UPDATE clientes SET email = ${email} WHERE telefone = ${telefone}`;
        }
        // Salva o agendamento
        await db `
            INSERT INTO agendamentos (nome, telefone, servico, profissional, data, hora, preco)
            VALUES (${nome}, ${telefone}, ${servico}, ${profissional}, ${data}, ${hora}, ${preco})
        `;
        // Envia e-mail de confirmação
        // 1. Se o cliente já existe e tem email cadastrado, envia para o email do banco
        // 2. Se o cliente não existe, mas o usuário marcou para receber notificações e forneceu email válido, envia para esse email
        let emailParaEnviar = null;
        if (cliente && cliente.email && cliente.email.includes('@')) {
            emailParaEnviar = cliente.email;
        } else if (!cliente && email && email.includes('@')) {
            // Novo cliente, forneceu email para notificações
            emailParaEnviar = email;
        }
        if (emailParaEnviar && emailParaEnviar.includes('@')) {
            try {
                await sendConfirmationEmail({
                    to: emailParaEnviar,
                    nome,
                    data: new Date(data).toLocaleDateString('pt-BR'),
                    hora,
                    profissional,
                    servico
                });
            } catch (mailErr) {
                // Não bloqueia o fluxo se o e-mail falhar
                console.error('Erro ao enviar e-mail de confirmação:', mailErr);
            }
        }
        // Envia e-mail para o barbeiro
        try {
            await sendBarberNotification({
                nome,
                telefone,
                servico,
                profissional,
                data: new Date(data).toLocaleDateString('pt-BR'),
                hora,
                preco,
                email
            });
        } catch (err) {
            console.error('Erro ao enviar e-mail para o barbeiro:', err);
        }
        // Cria notificação para dashboard (data UTC, mensagem curta)
        const titulo = 'Novo agendamento';
        const msg = `Novo agendamento para ${servico?.toString().slice(0,40)} com ${profissional?.toString().slice(0,40)} em ${
            dayjs.tz(data, BRAZIL_TZ).format('DD/MM/YYYY')
        } às ${hora}.`;
        // Use data/hora do Brasil
        const nowBrazil = dayjs().tz(BRAZIL_TZ).format('YYYY-MM-DD HH:mm:ss');
        await db `
            INSERT INTO notificacoes (titulo, mensagem, data)
            VALUES (${titulo}, ${msg}, ${nowBrazil})
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

// Cancelar agendamento por ID (atualiza status para 'cancelado')
router.patch('/cancelar/:id', async(req, res) => {
    const { id } = req.params;
    try {
        await db `UPDATE agendamentos SET status = 'cancelado' WHERE id = ${id}`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao cancelar agendamento.' });
    }
});

// Marcar agendamento como concluído por ID (atualiza status para 'concluido')
router.patch('/concluir/:id', async(req, res) => {
    const { id } = req.params;
    try {
        await db `UPDATE agendamentos SET status = 'concluido' WHERE id = ${id}`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao concluir agendamento.' });
    }
});

// Rota pública para listar profissionais ativos
router.get('/profissionais', async(req, res) => {
    try {
        const rows = await db `SELECT * FROM profissionais WHERE ativo = TRUE ORDER BY id ASC`;
        res.json({ success: true, profissionais: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar profissionais.' });
    }
});

// Rota para buscar agendamentos ocupados de um profissional em uma data
router.get('/ocupados', async(req, res) => {
    const { profissional, data } = req.query;
    if (!profissional || !data) {
        return res.status(400).json({ success: false, message: 'Profissional e data são obrigatórios.' });
    }
    try {
        // Busca todos os agendamentos do profissional na data
        const ags = await db `SELECT servico, hora FROM agendamentos WHERE profissional = ${profissional} AND data = ${data}`;
        res.json({ success: true, agendamentos: ags });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar horários ocupados.' });
    }
});

module.exports = router;