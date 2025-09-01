const nodemailer = require('nodemailer');
const db = require('../db/database');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
    secure: true,
    auth: { user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '' }
});

function validateSMTPEnv() {
    const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
    return required.every(v => process.env[v] && !process.env[v].includes('seu-email'));
}

async function sendConfirmationEmail({ to, nome, data, hora, profissional, servico }) {
    if (!validateSMTPEnv()) return;
    const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f9f9f9;border-radius:12px;padding:32px 24px 24px 24px;box-shadow:0 2px 16px #0001;">...</div>`;
    return transporter.sendMail({ from: process.env.SMTP_FROM || 'NaRégua Barbearia <seu-email@gmail.com>', to, subject: 'Confirmação de Agendamento - NaRégua Barbearia', html });
}

async function sendBarberNotification({ nome, telefone, servico, profissional, data, hora, preco, email }) {
    if (!validateSMTPEnv()) return;
    let emailNotificacao = null;
    try { const rows = await db`SELECT email_notificacao FROM barbearia LIMIT 1`; if (rows.length && rows[0].email_notificacao.includes('@')) emailNotificacao = rows[0].email_notificacao; } catch {}
    if (!emailNotificacao) return;
    const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f9f9f9;border-radius:12px;padding:32px 24px 24px 24px;box-shadow:0 2px 16px #0001;">...</div>`;
    return transporter.sendMail({ from: process.env.SMTP_FROM || 'NaRégua Barbearia <seu-email@gmail.com>', to: emailNotificacao, subject: 'Novo Agendamento Recebido - NaRégua Barbearia', html });
}

async function sendReminderEmail({ to, nome, data, hora, profissional, servico }) { if (!validateSMTPEnv()) return; return transporter.sendMail({ from: process.env.SMTP_FROM || 'NaRégua Barbearia <seu-email@gmail.com>', to, subject: 'Lembrete: Seu agendamento é daqui a 1 hora! - NaRégua Barbearia', html: '<div>...</div>' }); }

module.exports = { sendConfirmationEmail, sendBarberNotification, sendReminderEmail };
