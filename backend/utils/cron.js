const db = require('../db/database');
const { sendReminderEmail } = require('./mailer');
const { nowBrazilParts } = require('./clock');

function getBrazilDateTime() {
    const p = nowBrazilParts();
    return { date: p.date, time: p.time, datetime: p.datetime };
}

function isTransient(err) {
    if (!err) return false; const msg = (err.message || '').toLowerCase();
    return msg.includes('fetch failed') || msg.includes('econnreset') || msg.includes('timeout');
}

async function retry(fn, { attempts = 3, delay = 300 } = {}) {
    let last; for (let i = 1; i <= attempts; i++) {
        try { return await fn(); } catch (e) { last = e; if (!isTransient(e) || i === attempts) throw e; await new Promise(r => setTimeout(r, delay * i)); }
    } throw last;
}

async function atualizarStatusAgendamentos() {
    if (!db.ready) return; // pula se DB não conectado
    const brazilTime = getBrazilDateTime(); // agora fixo no boot, mantido igual nesta chamada
    const dataHoje = brazilTime.date;
    const horaAgora = brazilTime.time;
    try {
        await retry(() => db`UPDATE agendamentos SET status = 'concluido' WHERE status NOT IN ('cancelado', 'concluido') AND (data < ${dataHoje} OR (data = ${dataHoje} AND hora <= ${horaAgora}))`);
        await retry(() => db`UPDATE agendamentos SET status = 'confirmado' WHERE status NOT IN ('cancelado', 'concluido') AND (data > ${dataHoje} OR (data = ${dataHoje} AND hora > ${horaAgora}))`);
    } catch (err) { console.error('[CRON] Falha após retries ao atualizar status:', err?.message || err); }
}

async function enviarLembretesAgendamentos() {
    if (!db.ready) return; // pula se DB não conectado
    const brazilTime = getBrazilDateTime();
    const dataHoje = brazilTime.date;
    const horaAgora = brazilTime.time;
    try {
        const rows = await retry(() => db`SELECT a.*, c.email as cliente_email FROM agendamentos a LEFT JOIN clientes c ON a.telefone = c.telefone WHERE LOWER(a.status) = 'confirmado' AND a.data = ${dataHoje} AND a.id NOT IN (SELECT agendamento_id FROM lembretes_enviados) AND c.email IS NOT NULL AND c.email != '' AND ABS(EXTRACT(EPOCH FROM (a.hora::time - ${horaAgora}::time))/60) BETWEEN 59 AND 61`);
        for (const ag of rows) {
            try {
                await sendReminderEmail({ to: ag.cliente_email, nome: ag.nome, data: ag.data, hora: ag.hora, profissional: ag.profissional, servico: ag.servico });
                await retry(() => db`INSERT INTO lembretes_enviados (agendamento_id, enviado_em) VALUES (${ag.id}, NOW())`);
            } catch (err) { console.error(`[LEMBRETE] Falha ao processar agendamento ${ag.id}:`, err?.message || err); }
        }
    } catch (err) { console.error('[CRON] Falha geral lembretes após retries:', err?.message || err); }
}

setInterval(atualizarStatusAgendamentos, 30000);
setInterval(enviarLembretesAgendamentos, 60000);
