const db = require('../db/neon');
const { sendReminderEmail } = require('./mailer');
const { getBrazilNow } = require('./time');

function getBrazilDateTime() {
    const now = getBrazilNow();
    return {
        date: now.toISOString().slice(0, 10),
        time: now.toISOString().slice(11, 19),
        datetime: now.toISOString().slice(0, 19).replace('T', ' ')
    };
}

async function atualizarStatusAgendamentos() {
    try {
        const brazilTime = getBrazilDateTime();
        const dataHoje = brazilTime.date;
        const horaAgora = brazilTime.time;
        await db`UPDATE agendamentos SET status = 'concluido' WHERE status NOT IN ('cancelado', 'concluido') AND (data < ${dataHoje} OR (data = ${dataHoje} AND hora <= ${horaAgora}))`;
        await db`UPDATE agendamentos SET status = 'confirmado' WHERE status NOT IN ('cancelado', 'concluido') AND (data > ${dataHoje} OR (data = ${dataHoje} AND hora > ${horaAgora}))`;
    } catch (err) { console.error('Erro ao atualizar status dos agendamentos:', err); }
}

async function enviarLembretesAgendamentos() {
    try {
        const brazilTime = getBrazilDateTime();
        const dataHoje = brazilTime.date;
        const horaAgora = brazilTime.time;
        const rows = await db`SELECT a.*, c.email as cliente_email FROM agendamentos a LEFT JOIN clientes c ON a.telefone = c.telefone WHERE LOWER(a.status) = 'confirmado' AND a.data = ${dataHoje} AND a.id NOT IN (SELECT agendamento_id FROM lembretes_enviados) AND c.email IS NOT NULL AND c.email != '' AND ABS(EXTRACT(EPOCH FROM (a.hora::time - ${horaAgora}::time))/60) BETWEEN 59 AND 61`;
        for (const ag of rows) {
            try {
                await sendReminderEmail({ to: ag.cliente_email, nome: ag.nome, data: ag.data, hora: ag.hora, profissional: ag.profissional, servico: ag.servico });
                await db`INSERT INTO lembretes_enviados (agendamento_id, enviado_em) VALUES (${ag.id}, NOW())`;
            } catch (err) { console.error(`[ERRO] Falha ao enviar lembrete para ${ag.cliente_email} (agendamento ${ag.id}):`, err); }
        }
    } catch (err) { console.error('[ERRO] Falha geral ao buscar/enviar lembretes:', err); }
}

setInterval(atualizarStatusAgendamentos, 30000);
setInterval(enviarLembretesAgendamentos, 60000);
