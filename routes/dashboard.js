const express = require('express');
const router = express.Router();
const db = require('../db/neon');
const { requireLogin } = require('../middleware/auth');
const path = require('path');
const PDFDocument = require('pdfkit');

// Função para obter a data/hora do Brasil
function getBrazilDateTime() {
    const now = new Date();
    const brazilTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    return {
        date: brazilTime.toISOString().slice(0, 10), // YYYY-MM-DD
        datetime: brazilTime.toISOString().slice(0, 19).replace('T', ' '), // YYYY-MM-DD HH:mm:ss
        dateObject: brazilTime
    };
}

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
        const brazilTime = getBrazilDateTime();
        const hoje = brazilTime.dateObject;
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
        const brazilTime = getBrazilDateTime();
        const dataHoje = brazilTime.date; // YYYY-MM-DD
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
        const brazilTime = getBrazilDateTime();
        const hoje = brazilTime.dateObject;
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
        const brazilTime = getBrazilDateTime();
        const hoje = brazilTime.dateObject;
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
        const brazilTime = getBrazilDateTime();
        const hoje = brazilTime.dateObject;
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

router.get('/folgas-especiais', requireLogin, async(req, res) => {
    try {
        const rows = await db `SELECT * FROM folgas_especiais ORDER BY data ASC`;
        res.json({ success: true, folgas: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar folgas especiais.' });
    }
});

// Adicionar dia de folga especial
router.post('/folgas-especiais', requireLogin, async(req, res) => {
    const { data, motivo } = req.body;
    try {
        await db `
            INSERT INTO folgas_especiais (data, motivo)
            VALUES (${data}, ${motivo})
            ON CONFLICT (data) DO NOTHING
        `;
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message || 'Erro ao adicionar folga.' });
    }
});

// Remover folga especial
router.delete('/folgas-especiais/:id', requireLogin, async(req, res) => {
    const { id } = req.params;
    try {
        await db `DELETE FROM folgas_especiais WHERE id = ${id}`;
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message || 'Erro ao remover folga.' });
    }
});

// Rota pública para retornar as datas de folgas especiais
router.get('/folgas-especiais-public', async(req, res) => {
    try {
        const rows = await db `SELECT data FROM folgas_especiais`;
        // Retorna array de datas no formato YYYY-MM-DD
        const datas = rows.map(r => r.data instanceof Date ? r.data.toISOString().slice(0, 10) : r.data);
        res.json({ success: true, datas });
    } catch (err) {
        res.json({ success: false, error: 'Erro ao buscar folgas especiais.' });
    }
});

// Rota para gerar PDF dos agendamentos concluídos do mês
router.get('/agendamentos-concluidos-mes-pdf', async (req, res) => {
    try {
        const brazilTime = getBrazilDateTime();
        const now = brazilTime.dateObject;
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // 1-12

        // Array de nomes dos meses
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        // Busca todos os agendamentos concluídos do mês atual
        const rows = await db`
            SELECT nome, telefone, servico, profissional, data, hora, preco
            FROM agendamentos
            WHERE status ILIKE 'concluido'
              AND EXTRACT(YEAR FROM data) = ${year}
              AND EXTRACT(MONTH FROM data) = ${month}
            ORDER BY data, hora
        `;

        // Busca informações da barbearia
        const barbeariaInfo = await db`SELECT * FROM barbearia LIMIT 1`;
        const barbearia = barbeariaInfo[0] || { nome: 'NaRégua Barbearia' };

        // Criar PDF com configurações simples
        const doc = new PDFDocument({ 
            margin: 40, 
            size: 'A4',
            info: {
                Title: `Agendamentos Concluídos - ${String(month).padStart(2, '0')}/${year}`,
                Author: barbearia.nome || 'NaRégua Barbearia',
                Subject: 'Relatório Mensal de Agendamentos Concluídos'
            }
        });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Agendamentos_${monthNames[month - 1]}_${year}.pdf"`);

        doc.pipe(res);

        // Cabeçalho simples
        doc.fillColor('#1A1A1A')
           .fontSize(18)
           .font('Helvetica-Bold')
           .text('AGENDAMENTOS CONCLUÍDOS', 40, 40);

        doc.fillColor('#666666')
           .fontSize(14)
           .font('Helvetica')
           .text(`Período: ${monthNames[month - 1]} de ${year}`, 40, 70);

        doc.fillColor('#999999')
           .fontSize(10)
           .text(`Gerado em: ${getBrazilDateTime().dateObject.toLocaleDateString('pt-BR')}`, 40, 95);

        let currentY = 130;

        if (rows.length > 0) {
            // Cabeçalho da tabela
            const headerHeight = 30;
            
            doc.rect(40, currentY, 515, headerHeight)
               .fill('#F5F5F5')
               .stroke('#CCCCCC')
               .lineWidth(1);

            doc.fillColor('#333333')
               .fontSize(10)
               .font('Helvetica-Bold');

            // Colunas da tabela
            doc.text('Cliente', 50, currentY + 10);
            doc.text('Serviço', 165, currentY + 10);
            doc.text('Profissional', 270, currentY + 10);
            doc.text('Data', 370, currentY + 10);
            doc.text('Horário', 430, currentY + 10);
            doc.text('Valor', 490, currentY + 10);

            currentY += headerHeight;

            // Dados da tabela
            const rowHeight = 25;
            let pageNumber = 1;

            rows.forEach((ag, index) => {
                // Verificar se precisa de nova página
                if (currentY > 750) {
                    doc.addPage();
                    pageNumber++;
                    currentY = 40;
                    
                    // Recriar cabeçalho na nova página
                    doc.rect(40, currentY, 515, headerHeight)
                       .fill('#F5F5F5')
                       .stroke('#CCCCCC')
                       .lineWidth(1);

                    doc.fillColor('#333333')
                       .fontSize(10)
                       .font('Helvetica-Bold');

                    doc.text('Cliente', 50, currentY + 10);
                    doc.text('Serviço', 165, currentY + 10);
                    doc.text('Profissional', 270, currentY + 10);
                    doc.text('Data', 370, currentY + 10);
                    doc.text('Horário', 430, currentY + 10);
                    doc.text('Valor', 490, currentY + 10);

                    currentY += headerHeight;
                }
                
                // Fundo alternado das linhas
                if (index % 2 === 1) {
                    doc.rect(40, currentY, 515, rowHeight)
                       .fill('#FAFAFA')
                       .stroke('#EEEEEE')
                       .lineWidth(0.5);
                } else {
                    doc.rect(40, currentY, 515, rowHeight)
                       .stroke('#EEEEEE')
                       .lineWidth(0.5);
                }

                // Dados da linha
                doc.fillColor('#333333')
                   .fontSize(9)
                   .font('Helvetica');

                // Truncar textos longos
                const cliente = (ag.nome || 'N/A').length > 15 ? 
                    (ag.nome || 'N/A').substring(0, 12) + '...' : (ag.nome || 'N/A');
                
                const servico = (ag.servico || 'N/A').length > 13 ? 
                    (ag.servico || 'N/A').substring(0, 10) + '...' : (ag.servico || 'N/A');
                
                const profissional = (ag.profissional || 'N/A').length > 12 ? 
                    (ag.profissional || 'N/A').substring(0, 9) + '...' : (ag.profissional || 'N/A');

                doc.text(cliente, 50, currentY + 8);
                doc.text(servico, 165, currentY + 8);
                doc.text(profissional, 270, currentY + 8);
                doc.text(new Date(ag.data).toLocaleDateString('pt-BR'), 370, currentY + 8);
                doc.text(ag.hora || 'N/A', 430, currentY + 8);
                doc.text(`R$ ${Number(ag.preco || 0).toFixed(2).replace('.', ',')}`, 490, currentY + 8);

                currentY += rowHeight;
            });

            // Total
            const totalFaturamento = rows.reduce((sum, ag) => sum + Number(ag.preco || 0), 0);
            
            currentY += 10;
            doc.rect(40, currentY, 515, 25)
               .fill('#E8E8E8')
               .stroke('#CCCCCC')
               .lineWidth(1);

            doc.fillColor('#333333')
               .fontSize(11)
               .font('Helvetica-Bold')
               .text(`Total de agendamentos: ${rows.length}`, 50, currentY + 8);

            doc.text(`Total faturado: R$ ${totalFaturamento.toFixed(2).replace('.', ',')}`, 350, currentY + 8);

        } else {
            // Mensagem para relatório vazio
            doc.fillColor('#666666')
               .fontSize(14)
               .font('Helvetica')
               .text('Nenhum agendamento concluído encontrado para este período.', 40, currentY, {
                   width: 515,
                   align: 'center'
               });
        }

        doc.end();
    } catch (err) {
        console.error('Erro ao gerar PDF:', err);
        res.status(500).send('Erro interno do servidor ao gerar PDF');
    }
});

module.exports = router;