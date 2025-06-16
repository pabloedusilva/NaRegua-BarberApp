const db = require('../db/neon');
const { sendReminderEmail } = require('./mailer');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
const BRAZIL_TZ = 'America/Sao_Paulo';

// Função para atualizar status dos agendamentos
async function atualizarStatusAgendamentos() {
    try {
        // Pega data/hora do Brasil
        const now = dayjs().tz(BRAZIL_TZ);
        const dataHoje = now.format('YYYY-MM-DD');
        const horaAgora = now.format('HH:mm:ss');
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
        const now = dayjs().tz(BRAZIL_TZ);
        const dataHoje = now.format('YYYY-MM-DD');
        const horaAgora = now.format('HH:mm:ss');
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