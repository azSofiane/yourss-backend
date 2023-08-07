var express = require('express');
var router = express.Router();

const Eleve = require('@models/eleves');
const Professionnel = require('@models/professionnels');
const uid2 = require('uid2')
const bcrypt = require('bcrypt')



const { checkBody } = require('@modules/checkBody')
const { isValidEmail } = require('@modules/emailValidator')
const { sendResetPasswordEmail } = require('@modules/sendResetPasswordEmail');
const useDispatch = () => useDispatch();
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
  }

  // Rechercher l'utilisateur dans les collections "eleves" et "professionnels"
  Promise.all([
    Eleve.findOne({ email }),
    Professionnel.findOne({ email }),
  ])
    .then(([eleve, professionnel]) => {
      if (!eleve && !professionnel) {
        return res.json({ result: false, error: 'Adresse e-mail invalide' });
      }

      // Générer un jeton de réinitialisation unique
      const resetToken = uid2(32);

      // Enregistrer le jeton de réinitialisation dans la base de données pour l'utilisateur trouvé
      if (eleve) {
        eleve.resetToken = resetToken;
        eleve.save();
      } else if (professionnel) {
        professionnel.resetToken = resetToken;
        professionnel.save();
      }

      // Envoyer le jeton de réinitialisation à l'adresse e-mail de l'utilisateur
      sendResetPasswordEmail(email, resetToken);

      res.json({ result: true, message: 'Instructions de réinitialisation de mot de passe envoyées à votre adresse e-mail' });
    });
});

// Route pour la réinitialisation de mot de passe
router.post('/reset-password', async (req, res) => {
  const {  resetToken, mot_de_passe } = req.body;
  
  // Vérifier si l'adresse e-mail est valide
  // if (!isValidEmail(email)) {
  //   return res.json({ result: false, error: 'Adresse e-mail invalide' });
  // }

  // Rechercher l'utilisateur dans les collections "eleves" et "professionnels" en utilisant le jeton de réinitialisation
  const [eleve, professionnel] = await Promise.all([
    Eleve.findOne({  resetToken: resetToken }),
    Professionnel.findOne({  resetToken: resetToken }),
  ]);

  if (!eleve && !professionnel) {
    return res.json({ result: false, error: 'Utilisateur non trouvé ou jeton de réinitialisation invalide' });
  }

  // Hacher le nouveau mot de passe avant de le sauvegarder
  if (!mot_de_passe) {
     return res.json({ result: false, error: 'Le nouveau mot de passe est vide' });
  }
  const hash = bcrypt.hashSync(mot_de_passe, 10); 
      
  // Mettre à jour le mot de passe de l'utilisateur trouvé
  const utilisateur = eleve || professionnel;
  utilisateur.mot_de_passe = hash;
  utilisateur.token = uid2(32);  // Générer un jeton de réinitialisation unique
  utilisateur.resetToken = undefined; // Effacer le jeton de réinitialisation après la réinitialisation 

  try {
    await utilisateur.save();
    res.json({ result: true, message: 'Mot de passe réinitialisé avec succès', resetToken: utilisateur.token});
  } catch (error) {
    res.status(500).json({ result: false, error: 'Erreur lors de la sauvegarde du nouveau mot de passe' });
  }

});
module.exports = router;