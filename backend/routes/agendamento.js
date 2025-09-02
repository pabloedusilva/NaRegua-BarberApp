const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { sendConfirmationEmail, sendBarberNotification } = require('../utils/mailer');
const { nowBrazilParts } = require('../utils/clock');

// Criar novo agendamento
router.post('/novo', async (req, res) => {
	let { nome, telefone, servico, profissional, data, hora, preco, subscription, email } = req.body; // eslint-disable-line no-unused-vars
	try {
		let cliente = null;
		if (telefone) {
			const clientes = await db`SELECT * FROM clientes WHERE telefone = ${telefone} LIMIT 1`;
			if (clientes.length > 0) {
				cliente = clientes[0];
				if (!nome) nome = cliente.nome;
			}
		}
		if (!cliente && (!nome || nome.trim() === '')) {
			return res.status(400).json({ success: false, message: 'Nome obrigatório para novo cliente.' });
		}
		if (!cliente && telefone) {
			await db`INSERT INTO clientes (nome, telefone, email) VALUES (${nome}, ${telefone}, ${email || null}) ON CONFLICT (telefone) DO NOTHING`;
		} else if (cliente && email && (!cliente.email || cliente.email !== email)) {
			await db`UPDATE clientes SET email = ${email} WHERE telefone = ${telefone}`;
		}
		await db`INSERT INTO agendamentos (nome, telefone, servico, profissional, data, hora, preco) VALUES (${nome}, ${telefone}, ${servico}, ${profissional}, ${data}, ${hora}, ${preco})`;
		let emailParaEnviar = null;
		if (cliente && cliente.email && cliente.email.includes('@')) {
			emailParaEnviar = cliente.email;
		} else if (!cliente && email && email.includes('@')) {
			emailParaEnviar = email;
		}
		if (emailParaEnviar && emailParaEnviar.includes('@')) {
			try {
				await sendConfirmationEmail({
					to: emailParaEnviar,
					nome,
					data: nowBrazilParts().date.split('-').reverse().join('/'),
					hora,
					profissional,
					servico
				});
			} catch (mailErr) {
				console.error('Erro ao enviar e-mail de confirmação:', mailErr);
			}
		}
		try {
			await sendBarberNotification({
				nome,
				telefone,
				servico,
				profissional,
				data: nowBrazilParts().date.split('-').reverse().join('/'),
				hora,
				preco,
				email
			});
		} catch (err) {
			console.error('Erro ao enviar e-mail para o barbeiro:', err);
		}
		const brazilDate = nowBrazilParts();
		const titulo = 'Novo agendamento';
		const dataFormatada = brazilDate.date.split('-').reverse().join('/');
		const msg = `Novo agendamento para ${servico?.toString().slice(0, 40)} com ${profissional?.toString().slice(0, 40)} em ${dataFormatada} às ${hora}.`;
		await db`INSERT INTO notificacoes (titulo, mensagem, data) VALUES (${titulo}, ${msg}, ${brazilDate.datetime})`;
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Erro ao salvar agendamento.' });
	}
});

router.get('/meus', async (req, res) => {
	const { telefone } = req.query;
	try {
		const clientes = await db`SELECT * FROM clientes WHERE telefone = ${telefone} LIMIT 1`;
		const agendamentos = await db`SELECT * FROM agendamentos WHERE telefone = ${telefone} ORDER BY data DESC, hora DESC`;
		res.json({ success: true, cliente: clientes.length > 0 ? clientes[0] : null, agendamentos: agendamentos || [] });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Erro ao buscar cliente/agendamentos.' });
	}
});

router.patch('/cancelar/:id', async (req, res) => {
	const { id } = req.params;
	try {
		await db`UPDATE agendamentos SET status = 'cancelado' WHERE id = ${id}`;
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Erro ao cancelar agendamento.' });
	}
});

router.patch('/concluir/:id', async (req, res) => {
	const { id } = req.params;
	try {
		await db`UPDATE agendamentos SET status = 'concluido' WHERE id = ${id}`;
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Erro ao concluir agendamento.' });
	}
});

router.get('/profissionais', async (req, res) => {
	try {
		const rows = await db`SELECT * FROM profissionais WHERE ativo = TRUE ORDER BY id ASC`;
		res.json({ success: true, profissionais: rows });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Erro ao buscar profissionais.' });
	}
});

router.get('/ocupados', async (req, res) => {
	const { profissional, data } = req.query;
	if (!profissional || !data) return res.status(400).json({ success: false, message: 'Profissional e data são obrigatórios.' });
	try {
		const ags = await db`SELECT servico, hora FROM agendamentos WHERE profissional = ${profissional} AND data = ${data}`;
		res.json({ success: true, agendamentos: ags });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Erro ao buscar horários ocupados.' });
	}
});

module.exports = router;
