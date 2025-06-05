const express = require('express');
const router = express.Router();
const db = require('../db/neon');
const { requireLogin } = require('../middleware/auth');
const path = require('path');
const webpush = require('web-push');

const VAPID_PUBLIC_KEY = 'BElvOnVGxu5czvx63n1FEo3ea90bKMVWwxlky9nZBMNB39u97JOckXngiEKParctze7ciGdPvEZkSAnMSGGfo_s';
const VAPID_PRIVATE_KEY = 'VOEEZ8ZZH3Hi8CnFMEPQJK_9qdTspZe65-oiqPOQr9o';

webpush.setVapidDetails(
    'mailto:seu@email.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

// Login (POST)
router.post('/login', async(req, res) => {
    const { username, password } = req.body;
    try {
        const rows = await db `SELECT * FROM usuarios WHERE username = ${username} AND password = ${password} LIMIT 1`;
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
        const rows = await db `SELECT COUNT(*) AS total FROM agendamentos`;
        res.json({ total: rows[0].total });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar total de agendamentos.' });
    }
});

// Rota para buscar total de agendamentos do mês atual
router.get('/total-agendamentos-mes', requireLogin, async(req, res) => {
    try {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        // Corrige o último dia do mês
        const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate();
        const dataInicio = `${ano}-${mes}-01`;
        const dataFim = `${ano}-${mes}-${String(ultimoDia).padStart(2, '0')}`;
        const rows = await db `
            SELECT COUNT(*) AS total
            FROM agendamentos
            WHERE data >= ${dataInicio} AND data <= ${dataFim}
        `;
        res.json({ total: rows[0].total });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar total de agendamentos do mês.' });
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
        const rows = await db `
            SELECT * FROM agendamentos
            WHERE data = ${dataHoje}
            ORDER BY hora ASC
        `;
        res.json({ agendamentos: rows });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar agendamentos de hoje.' });
    }
});

// Rota pública para buscar serviços (para o frontend)
router.get('/servicos', async(req, res) => {
    try {
        const rows = await db `SELECT * FROM servicos WHERE ativo = TRUE ORDER BY id ASC`;
        res.json({ success: true, servicos: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar serviços.' });
    }
});

// Rota para alterar senha do usuário logado
router.post('/alterar-senha', requireLogin, async(req, res) => {
    const { atual, nova } = req.body;
    const userId = req.session.user.id;

    try {
        // Verifica se a senha atual está correta
        const rows = await db `
            SELECT * FROM usuarios
            WHERE id = ${userId} AND password = ${atual}
        `;
        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Senha atual incorreta.' });
        }

        // Atualiza a senha
        await db `UPDATE usuarios SET password = ${nova} WHERE id = ${userId}`;
        return res.json({ success: true, message: 'Senha alterada com sucesso!' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Erro ao alterar senha.' });
    }
});

// Atualiza o contador de agendamentos da semana (segunda a domingo da semana atual)
router.get('/total-agendamentos-semana', requireLogin, async(req, res) => {
    try {
        const hoje = new Date();
        // Pega o dia da semana (0=domingo, 1=segunda, ...)
        const diaSemana = hoje.getDay();
        // Calcula o primeiro dia da semana (segunda-feira)
        const diff = hoje.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
        const inicioSemana = new Date(hoje.setHours(0, 0, 0, 0));
        inicioSemana.setDate(diff);
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);

        const dataInicio = inicioSemana.toISOString().slice(0, 10);
        const dataFim = fimSemana.toISOString().slice(0, 10);

        const rows = await db `
            SELECT COUNT(*) AS total
            FROM agendamentos
            WHERE data >= ${dataInicio} AND data <= ${dataFim}
        `;
        res.json({ total: rows[0].total });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar total de agendamentos da semana.' });
    }
});

// Agendamentos da semana atual (segunda a domingo da semana corrente)
router.get('/agendamentos-semana', requireLogin, async(req, res) => {
    try {
        const hoje = new Date();
        // Pega o dia da semana (0=domingo, 1=segunda, ...)
        const diaSemana = hoje.getDay();
        // Calcula o primeiro dia da semana (segunda-feira)
        const diff = hoje.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
        const inicioSemana = new Date(hoje.setHours(0, 0, 0, 0));
        inicioSemana.setDate(diff);
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);

        const dataInicio = inicioSemana.toISOString().slice(0, 10);
        const dataFim = fimSemana.toISOString().slice(0, 10);

        const rows = await db `
            SELECT * FROM agendamentos
            WHERE data >= ${dataInicio} AND data <= ${dataFim}
            ORDER BY data ASC, hora ASC
        `;
        res.json({ agendamentos: rows });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar agendamentos da semana.' });
    }
});

// Agendamentos do mês atual
router.get('/agendamentos-mes', requireLogin, async(req, res) => {
    try {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        // Corrige o último dia do mês
        const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate();
        const dataInicio = `${ano}-${mes}-01`;
        const dataFim = `${ano}-${mes}-${String(ultimoDia).padStart(2, '0')}`;
        const rows = await db `
            SELECT * FROM agendamentos
            WHERE data >= ${dataInicio} AND data <= ${dataFim}
            ORDER BY data ASC, hora ASC
        `;
        res.json({ agendamentos: rows });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar agendamentos do mês.' });
    }
});

// Rota para listar todos os serviços (inclusive inativos) para a dashboard
router.get('/servicos-admin', requireLogin, async(req, res) => {
    try {
        const rows = await db `SELECT * FROM servicos ORDER BY id ASC`;
        res.json({ success: true, servicos: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar serviços.' });
    }
});

// Rota para ativar/desativar serviço
router.post('/servicos/:id/ativo', requireLogin, async(req, res) => {
    const { ativo } = req.body;
    const { id } = req.params;
    try {
        await db `UPDATE servicos SET ativo = ${ativo ? 1 : 0} WHERE id = ${id}`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao atualizar serviço.' });
    }
});

// Atualizar serviço
router.put('/servicos/:id', async(req, res) => {
    const { id } = req.params;
    const { nome, tempo, preco, imagem } = req.body;
    if (!nome || !tempo || !preco) return res.status(400).json({ success: false, message: 'Campos obrigatórios.' });
    try {
        await db `
            UPDATE servicos
            SET nome=${nome}, tempo=${tempo}, preco=${preco}, imagem=${imagem}
            WHERE id=${id}
        `;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao atualizar serviço.' });
    }
});

// Excluir serviço
router.delete('/servicos/:id', async(req, res) => {
    const { id } = req.params;
    try {
        await db `DELETE FROM servicos WHERE id=${id}`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao excluir serviço.' });
    }
});
// Adicionar novo serviço
router.post('/servicos', requireLogin, async(req, res) => {
    let { nome, tempo, preco, imagem } = req.body;
    if (!nome || !tempo || !preco) return res.status(400).json({ success: false, message: 'Campos obrigatórios.' });
    // Garante que preco é número
    preco = Number(preco);
    if (isNaN(preco)) return res.status(400).json({ success: false, message: 'Preço inválido.' });
    // Se imagem for string vazia, salva como NULL
    if (!imagem || imagem.trim() === '') imagem = null;
    try {
        await db `
            INSERT INTO servicos (nome, tempo, preco, imagem, ativo)
            VALUES (${nome}, ${tempo}, ${preco}, ${imagem}, TRUE)
        `;
        res.json({ success: true });
    } catch (err) {
        let msg = 'Erro ao adicionar serviço.';
        if (err && err.message) msg += ' ' + err.message;
        res.status(500).json({ success: false, message: msg });
    }
});

// Endpoint para envio manual de push pela dashboard (apenas admin)
router.post('/enviar-push', requireLogin, async(req, res) => {
    const { title, body, url } = req.body;
    if (!title || !body) {
        return res.status(400).json({ success: false, message: 'Título e mensagem são obrigatórios.' });
    }
    try {
        const [subs] = await db.query('SELECT id, endpoint, p256dh, auth FROM subscriptions');
        let enviados = 0;
        for (const sub of subs) {
            const subscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };
            try {
                await webpush.sendNotification(
                    subscription,
                    JSON.stringify({ title, body, url })
                );
                enviados++;
            } catch (err) {
                // Remove subscription inválida
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await db.query('DELETE FROM subscriptions WHERE id = ?', [sub.id]);
                }
            }
        }
        res.json({ success: true, enviados });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao enviar notificações.' });
    }
});

// Buscar todos os turnos
router.get('/horarios-turnos', async(req, res) => {
    const diasSemana = [
        'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'
    ];
    const rows = await db `SELECT * FROM horarios_turnos`;
    const turnosPorDia = {};
    rows.forEach(t => {
        if (!turnosPorDia[t.dia_semana]) turnosPorDia[t.dia_semana] = [];
        turnosPorDia[t.dia_semana].push(t);
    });
    // Para cada dia, retorna array de turnos OU array vazio se não houver turnos
    const turnos = diasSemana.map(dia => {
        if (turnosPorDia[dia] && turnosPorDia[dia].length > 0) {
            return turnosPorDia[dia];
        } else {
            return [];
        }
    }).flat();
    res.json({ success: true, turnos });
});

// Salvar turnos de um dia (substitui todos os turnos do dia)
router.post('/horarios-turnos', requireLogin, async(req, res) => {
    const { dia_semana, turnos } = req.body; // turnos: [{inicio, fim}, ...]
    if (!dia_semana || !Array.isArray(turnos)) return res.status(400).json({ success: false });
    await db.query('DELETE FROM horarios_turnos WHERE dia_semana = $1', [dia_semana]);
    for (const t of turnos) {
        if (t.inicio && t.fim) {
            await db.query('INSERT INTO horarios_turnos (dia_semana, turno_inicio, turno_fim) VALUES ($1, $2, $3)', [dia_semana, t.inicio, t.fim]);
        }
    }
    // Se turnos for vazio ou [{fechado:true}], não insere nada (dia fechado)
    res.json({ success: true });
});

// Listar notificações (mais recentes primeiro)
router.get('/notificacoes', requireLogin, async(req, res) => {
    try {
        const rows = await db `SELECT * FROM notificacoes ORDER BY data DESC`;
        res.json({ success: true, notificacoes: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar notificações.' });
    }
});

// Criar notificação
router.post('/notificacoes', async(req, res) => {
    const { titulo, mensagem } = req.body;
    try {
        await db.query('INSERT INTO notificacoes (titulo, mensagem, data) VALUES ($1, $2, NOW())', [titulo, mensagem]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao criar notificação.' });
    }
});

// Excluir (marcar como lida)
router.delete('/notificacoes/:id', requireLogin, async(req, res) => {
    await db.query('DELETE FROM notificacoes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
});

// Endpoint para envio de push notification de agendamento
router.post('/enviar-push-agendamento', requireLogin, async(req, res) => {
    const { agendamentoId, nome, telefone, servico, profissional, data, hora } = req.body;
    if (!agendamentoId) return res.status(400).json({ success: false, message: 'Agendamento não informado.' });

    try {
        // Busca a subscription do usuário deste agendamento
        const [subs] = await db `
            SELECT endpoint, p256dh, auth
            FROM subscriptions
            WHERE agendamento_id = ${agendamentoId}
            ORDER BY criado_em DESC
            LIMIT 1
        `;
        if (!subs.length) {
            return res.status(404).json({ success: false, message: 'Usuário deste agendamento não possui push ativo.' });
        }
        const subscription = {
            endpoint: subs[0].endpoint,
            keys: {
                p256dh: subs[0].p256dh,
                auth: subs[0].auth
            }
        };

        // Monta a mensagem personalizada
        const pushPayload = JSON.stringify({
            title: 'Lembrete de agendamento',
            body: `Olá ${nome}, lembrete do seu agendamento de ${servico} com ${profissional} em ${new Date(data).toLocaleDateString('pt-BR')} às ${hora}.`,
        });

        await webpush.sendNotification(subscription, pushPayload);

        res.json({ success: true });
    } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription inválida, pode remover do banco
            await db.query('DELETE FROM subscriptions WHERE agendamento_id = ?', [agendamentoId]);
        }
        res.status(500).json({ success: false, message: 'Erro ao enviar notificação.' });
    }
});

// Buscar informações da barbearia
router.get('/barbearia', async(req, res) => {
    try {
        const rows = await db `SELECT * FROM barbearia LIMIT 1`;
        if (rows.length > 0) {
            res.json({ success: true, barbearia: rows[0] });
        } else {
            res.json({ success: false, message: 'Informações não cadastradas.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar informações.' });
    }
});

// Atualizar informações da barbearia
router.post('/barbearia', async(req, res) => {
    const { nome, endereco, cidade_estado, whatsapp, instagram, foto, email_notificacao } = req.body;
    try {
        // Garante que existe pelo menos um registro
        const rows = await db `SELECT id FROM barbearia LIMIT 1`;
        if (rows.length === 0) {
            await db `
                INSERT INTO barbearia (nome, endereco, cidade_estado, whatsapp, instagram, foto, email_notificacao)
                VALUES (${nome}, ${endereco}, ${cidade_estado}, ${whatsapp}, ${instagram}, ${foto}, ${email_notificacao})
            `;
        } else {
            await db `
                UPDATE barbearia SET nome=${nome}, endereco=${endereco}, cidade_estado=${cidade_estado}, whatsapp=${whatsapp}, instagram=${instagram}, foto=${foto}, email_notificacao=${email_notificacao} WHERE id=${rows[0].id}
            `;
        }
        res.json({ success: true });
    } catch (err) {
        let msg = 'Erro ao atualizar informações.';
        if (err && err.message) msg += ' ' + err.message;
        res.status(500).json({ success: false, message: msg });
    }
});

router.get('/servertime', (req, res) => {
    // Retorna a data/hora do servidor em UTC
    const now = new Date();
    res.json({
        iso: now.toISOString(),
        timestamp: now.getTime()
    });
});

// Rota para buscar total de clientes
router.get('/total-clientes', requireLogin, async(req, res) => {
    try {
        const rows = await db `SELECT COUNT(*) AS total FROM clientes`;
        res.json({ total: rows[0].total });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar total de clientes.' });
    }
});

// Listar wallpapers
router.get('/wallpapers', async(req, res) => {
    const rows = await db `SELECT * FROM wallpapers WHERE ativo = TRUE`;
    res.json({ success: true, wallpapers: rows });
});

// Salvar wallpaper selecionado
router.post('/wallpaper-selecionado', async(req, res) => {
    const { wallpaper_id } = req.body;
    await db `UPDATE barbearia SET wallpaper_id = ${wallpaper_id}`;
    res.json({ success: true });
});

// Obter wallpaper selecionado
router.get('/wallpaper-selecionado', async(req, res) => {
    const rows = await db `
        SELECT w.* FROM barbearia b
        LEFT JOIN wallpapers w ON b.wallpaper_id = w.id
        LIMIT 1
    `;
    if (rows.length && rows[0].url) {
        res.json({ success: true, wallpaper: rows[0] });
    } else {
        res.json({ success: false });
    }
});

// Endpoint para listar imagens de serviço
router.get('/servico-imagens', async(req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM servico_imagens WHERE ativo = TRUE');
        res.json({ success: true, imagens: rows });
    } catch (err) {
        res.json({ success: false, error: 'Erro ao buscar imagens.' });
    }
});

// Adicionar profissional
router.post('/profissionais', requireLogin, async(req, res) => {
    try {
        const { nome, avatar } = req.body;
        if (!nome || nome.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Nome inválido.' });
        }
        await db `
            INSERT INTO profissionais (nome, avatar, ativo)
            VALUES (${nome.trim()}, ${avatar || null}, TRUE)
        `;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao adicionar profissional.' });
    }
});

// Atualizar profissional
router.put('/profissionais/:id', requireLogin, async(req, res) => {
    const { id } = req.params;
    const { nome, avatar } = req.body;
    if (!nome) return res.status(400).json({ success: false, message: 'Nome é obrigatório.' });
    try {
        await db `
            UPDATE profissionais SET nome=${nome}, avatar=${avatar || null}
            WHERE id=${id}
        `;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao atualizar profissional.' });
    }
});

// Excluir profissional
router.delete('/profissionais/:id', requireLogin, async(req, res) => {
    const { id } = req.params;
    try {
        await db `DELETE FROM profissionais WHERE id=${id}`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao excluir profissional.' });
    }
});

module.exports = router;