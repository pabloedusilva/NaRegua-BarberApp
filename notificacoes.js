const cron = require('node-cron');
const webpush = require('web-push');
const db = require('./db/mysql');

const VAPID_PUBLIC_KEY = 'BElvOnVGxu5czvx63n1FEo3ea90bKMVWwxlky9nZBMNB39u97JOckXngiEKParctze7ciGdPvEZkSAnMSGGfo_s';
const VAPID_PRIVATE_KEY = 'VOEEZ8ZZH3Hi8CnFMEPQJK_9qdTspZe65-oiqPOQr9o';

webpush.setVapidDetails(
    'mailto:seu@email.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

// Função para buscar agendamentos para notificar 1h antes
async function buscarAgendamentosParaNotificar(target) {
    // target é um objeto Date para daqui a 1 hora
    const dataStr = target.toISOString().slice(0, 10);
    const horaStr = target.toTimeString().slice(0, 5);

    // Busca agendamentos para a data/hora exata
    const [rows] = await db.query(
        `SELECT a.id, a.nome, a.hora, a.profissional, s.id as sub_id, s.endpoint, s.p256dh, s.auth
         FROM agendamentos a
         JOIN subscriptions s ON s.agendamento_id = a.id
         WHERE a.data = ? AND a.hora = ?`, [dataStr, horaStr]
    );
    // Monta o objeto subscription para o web-push
    return rows.map(ag => ({
        nome: ag.nome,
        hora: ag.hora,
        profissional: ag.profissional,
        subscription: {
            endpoint: ag.endpoint,
            keys: {
                p256dh: ag.p256dh,
                auth: ag.auth
            }
        },
        sub_id: ag.sub_id
    }));
}

cron.schedule('* * * * *', async() => {
    const now = new Date();
    const target = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora antes
    const agendamentos = await buscarAgendamentosParaNotificar(target);
    for (const ag of agendamentos) {
        if (ag.subscription) {
            try {
                await webpush.sendNotification(
                    ag.subscription,
                    JSON.stringify({
                        title: 'Lembrete de agendamento',
                        body: `Olá ${ag.nome}, seu agendamento é às ${ag.hora} com ${ag.profissional}.`
                    })
                );
                console.log(`[Notificação enviada] Para: ${ag.nome} - ${ag.hora}`);
            } catch (err) {
                // Remove subscription inválida
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await db.query('DELETE FROM subscriptions WHERE id = ?', [ag.sub_id]);
                    console.log(`[Subscription removida] endpoint: ${ag.subscription.endpoint}`);
                } else {
                    console.error('Erro ao enviar push:', err);
                }
            }
        }
    }
});