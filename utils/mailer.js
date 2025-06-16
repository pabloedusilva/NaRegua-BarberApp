// utils/mailer.js
const nodemailer = require('nodemailer');
const db = require('../db/neon');

// Configure o transporte SMTP (ajuste para seu provedor)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
    secure: true, // true para 465, false para outras portas
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
});

// SMTP config validation
function validateSMTPEnv() {
    const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
    let ok = true;
    for (const v of required) {
        if (!process.env[v] || process.env[v].includes('seu-email')) {
            ok = false;
        }
    }
    return ok;
}

async function sendConfirmationEmail({ to, nome, data, hora, profissional, servico }) {
    if (!validateSMTPEnv()) {
        return;
    }
    const html = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f9f9f9;border-radius:12px;padding:32px 24px 24px 24px;box-shadow:0 2px 16px #0001;">
            <div style="text-align:center;margin-bottom:18px;">
                <img 
                    src="https://github.com/user-attachments/assets/eda4e558-eddd-48f2-bdb6-89be7c141b70" 
                    alt="NaRégua" 
                    style="width:80px;height:80px;border-radius:50%;margin-bottom:8px;"
                >
                <h2 style="color:#28a745;margin:0 0 8px 0;">
                    Agendamento Confirmado!
                </h2>
            </div>
            <div style="background:#fff;border-radius:10px;padding:18px 16px 12px 16px;margin-bottom:18px;box-shadow:0 1px 6px #0001;">
                <p style="font-size:1.08rem;color:#222;margin:0 0 10px 0;">
                    Olá <b>${nome}</b>, seu agendamento foi confirmado com sucesso!
                </p>
                <ul style="list-style:none;padding:0;margin:0 0 10px 0;font-size:1.05rem;">
                    <li><b>Serviço:</b> ${servico}</li>
                    <li><b>Profissional:</b> ${profissional}</li>
                    <li><b>Data:</b> ${data}</li>
                    <li><b>Horário:</b> ${hora}</li>
                </ul>
                <p style="color:#555;font-size:0.98rem;margin:0;">
                    Se precisar reagendar, entre em contato conosco.
                </p>
            </div>
            <div style="text-align:center;color:#888;font-size:0.97rem;">
                Obrigado por escolher a <b>NaRégua Barbearia</b>!<br>
                Esperamos por você!
            </div>
        </div>
    `;
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'NaRégua Barbearia <seu-email@gmail.com>',
            to,
            subject: 'Confirmação de Agendamento - NaRégua Barbearia',
            html
        });
        return info;
    } catch (err) {
        throw err;
    }
}

// Envia e-mail para o barbeiro sempre que houver novo agendamento
async function sendBarberNotification({ nome, telefone, servico, profissional, data, hora, preco, email }) {
    if (!validateSMTPEnv()) {
        return;
    }
    // Busca o e-mail de notificação da barbearia
    let emailNotificacao = 'pablo.silva.edu@gmail.com';
    try {
        const rows = await db `SELECT email_notificacao FROM barbearia LIMIT 1`;
        if (rows.length && rows[0].email_notificacao && rows[0].email_notificacao.includes('@')) {
            emailNotificacao = rows[0].email_notificacao;
        }
    } catch (e) {
        // fallback para padrão
    }
    const html = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f9f9f9;border-radius:12px;padding:32px 24px 24px 24px;box-shadow:0 2px 16px #0001;">
            <div style="text-align:center;margin-bottom:18px;">
                <img 
                    src="https://github.com/user-attachments/assets/eda4e558-eddd-48f2-bdb6-89be7c141b70" 
                    alt="NaRégua" 
                    style="width:80px;height:80px;border-radius:50%;margin-bottom:8px;"
                >
                <h2 style="color:#fdcf00;margin:0 0 8px 0;">
                    Novo Agendamento Recebido
                </h2>
            </div>
            <div style="background:#fff;border-radius:10px;padding:18px 16px 12px 16px;margin-bottom:18px;box-shadow:0 1px 6px #0001;">
                <p style="font-size:1.08rem;color:#222;margin:0 0 10px 0;">
                    Olá, você recebeu um novo agendamento!
                </p>
                <ul style="list-style:none;padding:0;margin:0 0 10px 0;font-size:1.05rem;">
                    <li style="margin-bottom:6px;"><b>Cliente:</b> <span style='color:#28a745;font-weight: bold;'>${nome}</span></li>
                    <li style="margin-bottom:6px;"><b>Telefone:</b> <span style='color:#222;'>${telefone}</span></li>
                    <li style="margin-bottom:6px;"><b>Serviço:</b> <span style='color:#222;'>${servico}</span></li>
                    <li style="margin-bottom:6px;"><b>Profissional:</b> <span style='color:#222;'>${profissional}</span></li>
                    <li style="margin-bottom:6px;"><b>Data:</b> <span style='color:#222;'>${data}</span></li>
                    <li style="margin-bottom:6px;"><b>Horário:</b> <span style='color:#222;'>${hora}</span></li>
                    <li style="margin-bottom:6px;"><b>Preço:</b> <span style='color:#28a745;'>R$ ${preco || '-'}</span></li>
                    ${email ? `<li style=\"margin-bottom:6px;\"><b>Email do cliente:</b> <span style='color:#222;'>${email}</span></li>` : ''}
                </ul>
                <p style="color:#555;font-size:0.98rem;margin:0;">
                    Fique atento ao horário e prepare-se para o atendimento.
                </p>
            </div>
            <div style="text-align:center;color:#888;font-size:0.97rem;">
                Notificação automática do sistema <b>NaRégua Barbearia</b>.
            </div>
        </div>
    `;
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'NaRégua Barbearia <seu-email@gmail.com>',
            to: emailNotificacao,
            subject: 'Novo Agendamento Recebido - NaRégua Barbearia',
            html
        });
        return info;
    } catch (err) {
        throw err;
    }
}

// Envia e-mail de lembrete 1h antes do agendamento
async function sendReminderEmail({ to, nome, data, hora, profissional, servico }) {
    if (!validateSMTPEnv()) {
        return;
    }
    const html = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#fffbe6;border-radius:12px;padding:32px 24px 24px 24px;box-shadow:0 2px 16px #0001;">
            <div style="text-align:center;margin-bottom:18px;">
                <img 
                    src="https://github.com/user-attachments/assets/eda4e558-eddd-48f2-bdb6-89be7c141b70" 
                    alt="NaRégua" 
                    style="width:80px;height:80px;border-radius:50%;margin-bottom:8px;"
                >
                <h2 style="color:#fdcf00;margin:0 0 8px 0;">
                    Lembrete de Agendamento
                </h2>
            </div>
            <div style="background:#fff;border-radius:10px;padding:18px 16px 12px 16px;margin-bottom:18px;box-shadow:0 1px 6px #0001;">
                <p style="font-size:1.08rem;color:#222;margin:0 0 10px 0;">
                    Olá <b>${nome}</b>, este é um lembrete do seu agendamento na <b>NaRégua Barbearia</b>!
                </p>
                <ul style="list-style:none;padding:0;margin:0 0 10px 0;font-size:1.05rem;">
                    <li><b>Serviço:</b> ${servico}</li>
                    <li><b>Profissional:</b> ${profissional}</li>
                    <li><b>Data:</b> ${data}</li>
                    <li><b>Horário:</b> ${hora}</li>
                </ul>
                <p style="color:#555;font-size:0.98rem;margin:0;">
                    Chegue com antecedência para garantir o melhor atendimento. Se precisar reagendar, entre em contato conosco.
                </p>
            </div>
            <div style="text-align:center;color:#888;font-size:0.97rem;">
                Esperamos por você!<br>
                <b>NaRégua Barbearia</b>
            </div>
        </div>
    `;
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'NaRégua Barbearia <seu-email@gmail.com>',
            to,
            subject: 'Lembrete: Seu agendamento é daqui a 1 hora! - NaRégua Barbearia',
            html
        });
        return info;
    } catch (err) {
        throw err;
    }
}

module.exports = { sendConfirmationEmail, sendBarberNotification, sendReminderEmail };