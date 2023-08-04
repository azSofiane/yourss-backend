const nodemailer = require('nodemailer');

// Configuration de transport pour Nodemailer (utilisez votre propre service SMTP ou fournisseur d'e-mails)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  auth: {
    user: 'yourslacapsule@gmail.com',
    pass: 'jislphrmtbbfruqj'
  },
});

function sendResetPasswordEmail(email, resetToken) {
  // Créez le lien de réinitialisation avec le jeton et l'URL de réinitialisation de mot de passe (à remplacer par l'URL réelle de votre application)
  const resetLink = `http://localhost:3001/resetpassword?token=${resetToken}`;

  // Configurations de l'e-mail
  const mailOptions = {
    from: 'yourslacapsule@gmail.com',
    to: email,
    subject: 'Réinitialisation de mot de passe',
    html: `<p>Bonjour,</p><p>Vous avez demandé une réinitialisation de mot de passe.</p><p>Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe :</p><p><a href="${resetLink}">${resetLink}</a></p><p>Si vous n'avez pas effectué cette demande, veuillez ignorer cet e-mail.</p><p>Cordialement,<br>Edwin de l'équipe Yours</p>`,
  };

  // Envoi de l'e-mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail de réinitialisation de mot de passe:', error);
    } else {
      console.log('E-mail de réinitialisation de mot de passe envoyé avec succès:', info.response);
    }
  });
}

module.exports = { sendResetPasswordEmail };
