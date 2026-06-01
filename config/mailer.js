const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY
  }
});

function sendWelcomeEmail(toEmail, username) {
  const mailOptions = {
    from: 'Clefchamp <noreply@clefchamp.es>',
    to: toEmail,
    subject: '¡Bienvenido a Clefchamp!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">¡Bienvenido a Clefchamp, ${username}!</h1>
        <p>Tu cuenta ha sido creada correctamente. Ya puedes empezar a entrenar tu oído musical.</p>
        <p>Accede a tu cuenta en <a href="https://clefchamp.es">clefchamp.es</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="color: #888; font-size: 12px;">Si no has creado esta cuenta, ignora este correo.</p>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) console.error('Error enviando email de bienvenida:', err.message);
  });
}

module.exports = { sendWelcomeEmail };
