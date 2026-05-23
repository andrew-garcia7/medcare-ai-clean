const nodemailer = require('nodemailer');
const logger = require('./logger');

// ================= TRANSPORTER =================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});


// ================= SEND EMAIL =================
const sendEmail = async ({
  to,
  subject,
  html,
  text,
  retries = 2,
}) => {
  try {
    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]+>/g, ''), // fallback text
    };

    const info = await transporter.sendMail(message);

    logger.info(`📧 Email sent to ${to} | ID: ${info.messageId}`);

    return info;

  } catch (error) {
    logger.error(`❌ Email failed to ${to}: ${error.message}`);

    // 🔁 Retry logic
    if (retries > 0) {
      logger.warn(`🔁 Retrying email... (${retries})`);
      return sendEmail({ to, subject, html, text, retries: retries - 1 });
    }

    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;