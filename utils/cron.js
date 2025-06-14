const db = require('../db/neon');

// Função para atualizar status dos agendamentos
async function atualizarStatusAgendamentos() {
    try {
        // Marca como concluído todos os agendamentos que já passaram da data/hora e não estão cancelados/concluídos
        await db `
            UPDATE agendamentos
            SET status = 'concluido'
            WHERE status NOT IN ('cancelado', 'concluido')
              AND (data < CURRENT_DATE OR (data = CURRENT_DATE AND hora < TO_CHAR(NOW(), 'HH24:MI')))
        `;
        // Garante que futuros fiquem como confirmado
        await db `
            UPDATE agendamentos
            SET status = 'confirmado'
            WHERE status NOT IN ('cancelado', 'concluido')
              AND (data > CURRENT_DATE OR (data = CURRENT_DATE AND hora >= TO_CHAR(NOW(), 'HH24:MI')))
        `;
    } catch (err) {
        console.error('Erro ao atualizar status dos agendamentos:', err);
    }
}

// Executa a cada 5 segundos (tempo real)
setInterval(atualizarStatusAgendamentos, 5000);