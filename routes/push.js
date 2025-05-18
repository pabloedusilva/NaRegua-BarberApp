const express = require('express');
const router = express.Router();
const db = require('../db/mysql');
const webpush = require('web-push');

const VAPID_PUBLIC_KEY = 'BElvOnVGxu5czvx63n1FEo3ea90bKMVWwxlky9nZBMNB39u97JOckXngiEKParctze7ciGdPvEZkSAnMSGGfo_s';
const VAPID_PRIVATE_KEY = 'VOEEZ8ZZH3Hi8CnFMEPQJK_9qdTspZe65-oiqPOQr9o';

webpush.setVapidDetails(
    'mailto:seu@email.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

// POST /push/manual
router.post('/manual', async(req, res) => {
    const { title, body } = req.body;
    if (!title || !body) {
        return res.status(400).json({ success: false, message: 'Título e corpo são obrigatórios.' });
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
                    JSON.stringify({ title, body })
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

module.exports = router;