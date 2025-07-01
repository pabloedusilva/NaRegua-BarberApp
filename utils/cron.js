const db = require('../db/neon');
const { sendReminderEmail } = require('./mailer');

// Função para obter a data/hora do Brasil
function getBrazilDateTime() {
    const now = new Date();
    const brazilTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    return {
        date: brazilTime.toISOString().slice(0, 10), // YYYY-MM-DD
        time: brazilTime.toISOString().slice(11, 19), // HH:mm:ss
        datetime: brazilTime.toISOString().slice(0, 19).replace('T', ' ') // YYYY-MM-DD HH:mm:ss
    };
}

// Função para atualizar status dos agendamentos
async function atualizarStatusAgendamentos() {
    try {
        // Pega data/hora do Brasil
        const brazilTime = getBrazilDateTime();
        const dataHoje = brazilTime.date;
        const horaAgora = brazilTime.time;
        // Marca como concluído apenas se a data é menor OU (data igual e hora menor ou igual ao horário atual)
        await db `
            UPDATE agendamentos
            SET status = 'concluido'
            WHERE status NOT IN ('cancelado', 'concluido')
              AND (
                data < ${dataHoje}
                OR (data = ${dataHoje} AND hora <= ${horaAgora})
              )
        `;
        // Marca como confirmado se a data é maior OU (data igual e hora maior que o horário atual)
        await db `
            UPDATE agendamentos
            SET status = 'confirmado'
            WHERE status NOT IN ('cancelado', 'concluido')
              AND (
                data > ${dataHoje}
                OR (data = ${dataHoje} AND hora > ${horaAgora})
              )
        `;
    } catch (err) {
        console.error('Erro ao atualizar status dos agendamentos:', err);
    }
}

// Função para enviar lembrete 1h antes do agendamento (baseado em diferença de minutos)
async function enviarLembretesAgendamentos() {
    try {
        const brazilTime = getBrazilDateTime();
        const dataHoje = brazilTime.date;
        const horaAgora = brazilTime.time;
        // Busca agendamentos para daqui a 1 hora (tolerância de 1 minuto)
        const rows = await db `
            SELECT a.*, c.email as cliente_email FROM agendamentos a
            LEFT JOIN clientes c ON a.telefone = c.telefone
            WHERE LOWER(a.status) = 'confirmado'
              AND a.data = ${dataHoje}
              AND a.id NOT IN (SELECT agendamento_id FROM lembretes_enviados)
              AND c.email IS NOT NULL AND c.email != ''
              AND ABS(EXTRACT(EPOCH FROM (a.hora::time - ${horaAgora}::time))/60) BETWEEN 59 AND 61
        `;
        for (const ag of rows) {
            try {
                await sendReminderEmail({
                    to: ag.cliente_email,
                    nome: ag.nome,
                    data: ag.data,
                    hora: ag.hora,
                    profissional: ag.profissional,
                    servico: ag.servico
                });
                await db `INSERT INTO lembretes_enviados (agendamento_id, enviado_em) VALUES (${ag.id}, NOW())`;
            } catch (err) {
                console.error(`[ERRO] Falha ao enviar lembrete para ${ag.cliente_email} (agendamento ${ag.id}):`, err);
            }
        }
    } catch (err) {
        console.error('[ERRO] Falha geral ao buscar/enviar lembretes:', err);
    }
}

// Executa a cada 30 segundos para garantir precisão
setInterval(atualizarStatusAgendamentos, 30000);
// Executa a cada minuto para lembretes
setInterval(enviarLembretesAgendamentos, 60000);