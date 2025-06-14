const db = require('../db/neon');
const cron = require('node-cron');

// Roda a cada minuto
cron.schedule('* * * * *', async() => {
    try {
        // Marca como concluído todos os agendamentos que já passaram da data/hora e não estão cancelados/concluídos
        await db `
            UPDATE agendamentos
            SET status = 'concluido'
            WHERE status NOT IN ('cancelado', 'concluido')
              AND (data < CURRENT_DATE OR (data = CURRENT_DATE AND hora < TO_CHAR(NOW(), 'HH24:MI')))
        `;
        // Opcional: pode também garantir que futuros fiquem como confirmado
        await db `
            UPDATE agendamentos
            SET status = 'confirmado'
            WHERE status NOT IN ('cancelado', 'concluido')
              AND (data > CURRENT_DATE OR (data = CURRENT_DATE AND hora >= TO_CHAR(NOW(), 'HH24:MI')))
        `;
        // console.log('Status de agendamentos atualizado automaticamente.');
    } catch (err) {
        console.error('Erro ao atualizar status dos agendamentos:', err);
    }
});