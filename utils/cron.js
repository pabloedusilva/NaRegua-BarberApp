const db = require('../db/neon');

// Função para atualizar status dos agendamentos
async function atualizarStatusAgendamentos() {
    try {
        // Marca como concluído apenas se a data é menor OU (data igual e hora menor ou igual ao horário atual)
        await db`
            UPDATE agendamentos
            SET status = 'concluido'
            WHERE status NOT IN ('cancelado', 'concluido')
              AND (
                data < CURRENT_DATE
                OR (data = CURRENT_DATE AND hora::time <= CURRENT_TIME)
              )
        `;
        // Marca como confirmado se a data é maior OU (data igual e hora maior que o horário atual)
        await db`
            UPDATE agendamentos
            SET status = 'confirmado'
            WHERE status NOT IN ('cancelado', 'concluido')
              AND (
                data > CURRENT_DATE
                OR (data = CURRENT_DATE AND hora::time > CURRENT_TIME)
              )
        `;
    } catch (err) {
        console.error('Erro ao atualizar status dos agendamentos:', err);
    }
}

// Executa a cada 30 segundos para garantir precisão
setInterval(atualizarStatusAgendamentos, 30000);