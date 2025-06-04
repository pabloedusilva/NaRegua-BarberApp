// utils/mailer.js
const nodemailer = require('nodemailer');

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

async function sendConfirmationEmail({ to, nome, data, hora, profissional, servico }) {
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
    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'NaRégua Barbearia <seu-email@gmail.com>',
        to,
        subject: 'Confirmação de Agendamento - NaRégua Barbearia',
        html
    });
}

module.exports = { sendConfirmationEmail };