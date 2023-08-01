var express = require('express');
var router = express.Router();

const Eleve = require('@models/eleves');
const Professionnel = require('@models/professionnels');
const uid2 = require('uid2')
const bcrypt = require('bcrypt')

const { checkBody } = require('@modules/checkBody')
const { isValidEmail } = require('@modules/emailValidator')
const { sendResetPasswordEmail } = require('@modules/sendResetPasswordEmail');
const { isStrongPassword } = require('@modules/passwordValidator');

// Route pour demander la réinitialisation de mot de passe
router.post('/forgot-password', async (req, res) => {
  if (!checkBody(req.body, ['email'])) {
    res.json({ result: false, error: 'Champs manquants ou vides' });
    return
  };

  const { email } = req.body;

  // Vérifier si l'adresse e-mail est valide
  if (!isValidEmail(email)) {
    return res.json({ result: false, error: 'Adresse e-mail invalide' });
  };
  
  console.log(email)

  const [professionnel, eleve] = await Promise.all([
    Professionnel.findOne({ email }),
    Eleve.findOne({ email })
  ]);

  console.log('01', professionnel)
  console.log('02', eleve)

  if(!professionnel && !eleve) {
    return res.json({ result: false, error: 'Adresse e-mail non trouvée' });
  };

  let token;
  let userType;

  if (professionnel) {
    token = professionnel?.token;
    userType = 'false';
  } else {
    token = eleve?.token;
    userType = 'true';
  };

  res.json({ result: true, token, fonction: userType });
});

// todo - revoir la partie envoyer mail de reinisialisation
// Route pour la réinitialisation de mot de passe
router.post('/reset-password', (req, res) => {
  const { email, resetToken, newMot_de_passe } = req.body;

  // Vérifier si le jeton de réinitialisation est valide et correspond à l'utilisateur dans la base de données
  Professionnel.findOne({ email, resetToken }).then(utilisateur => {
    if (!utilisateur) {
      return res.json({ result: false, error: 'Jeton de réinitialisation invalide ou expiré' });
    }

    // Mettre à jour le mot de passe avec le nouveau mot de passe haché
    const hash = bcrypt.hashSync(newMot_de_passe, 10);
    utilisateur.mot_de_passe = hash;

    // Supprimer le jeton de réinitialisation
    utilisateur.resetToken = undefined;

    utilisateur.save().then(() => {
      res.json({ result: true, message: 'Le mot de passe a été réinitialisé avec succès' });
    });
  });
});

module.exports = router;
