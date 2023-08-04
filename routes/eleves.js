var express = require('express');
var router = express.Router();

const Eleve= require ('@models/eleves');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

const { checkBody } = require('@modules/checkBody');
const { cleanSpace } = require('@modules/cleanSpace');
const { isValidEmail } = require('@modules/emailValidator');
const { sendResetPasswordEmail } = require('@modules/sendResetPasswordEmail');
const { isStrongPassword } = require('@modules/passwordValidator');

// Route pour demander la réinitialisation de mot de passe
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  // Vérifier si l'adresse e-mail est valide
  if (!isValidEmail(email)) {
    return res.json({ result: false, error: 'Adresse e-mail invalide' });
  };

  // Rechercher l'utilisateur dans la base de données
  Eleve.findOne({ email }).then(utilisateur => {
    if (!utilisateur) {
      return res.json({ result: false, error: 'Adresse e-mail non trouvée' });
    };

    // Générer un jeton de réinitialisation unique
    const resetToken = uid2(32);

    // Enregistrer le jeton de réinitialisation dans la base de données pour l'utilisateur
    utilisateur.resetToken = resetToken;

    utilisateur.save().then(() => {
      // Envoyer le jeton de réinitialisation à l'adresse e-mail de l'utilisateur
      sendResetPasswordEmail(utilisateur.email, resetToken);

      res.json({ result: true, message: 'Instructions de réinitialisation de mot de passe envoyées à votre adresse e-mail' });
    });
  });
});

// Route pour la réinitialisation de mot de passe
router.post('/reset-password', (req, res) => {
  const { email, resetToken, newMpot_de_passe } = req.body;

  // Vérifier si le jeton de réinitialisation est valide et correspond à l'utilisateur dans la base de données
  Eleve.findOne({ email, resetToken }).then(utilisateur => {
    if (!utilisateur) {
      return res.json({ result: false, error: 'Jeton de réinitialisation invalide ou expiré' });
    };

    // Mettre à jour le mot de passe avec le nouveau mot de passe haché
    const hash = bcrypt.hashSync(newMpot_de_passe, 10);
    utilisateur.mot_de_passe = hash;

    // Supprimer le jeton de réinitialisation
    utilisateur.resetToken = undefined;

    utilisateur.save().then(() => {
      res.json({ result: true, message: 'Le mot de passe a été réinitialisé avec succès' });
    });
  });
});

// Route qui verifie un token
router.get('/:token', (req, res) => {
  Eleve.findOne({ token: req.params.token })
  .select('-_id -email -mot_de_passe -token -fonction')
  .then(data => {
    data ? result = true : result = false;

    res.json({ result, data });
  });
});

// Route pour modifier le profil
router.put('/edit/:token', async (req, res) => {
  const { nom, prenom, photos, etablissement, presentation, motivation, ville, code_postal, disponible, date_de_debut, date_de_fin, ma_recherche_de_stage, mot_cle } = req.body;

  // variable de liste des champs modifiables
  let champs = { nom, prenom, photos, etablissement, presentation, motivation, ville, code_postal, disponible, date_de_debut, date_de_fin, ma_recherche_de_stage, mot_cle };

  // cela retire les espaces avant et après à la reception des données
  const cleanClasseList = { nom, prenom, etablissement, ville, code_postal };

  for (const i in cleanClasseList) {
    const cleanedField = cleanSpace(cleanClasseList[i]);

    if (cleanedField !== null) {
      champs[i] = cleanedField;
    };
  };

  // vérifier que le token existe dans la bdd
  const isValidToken = await Eleve.findOne({ token: req.params.token });

  if (!isValidToken) {
    return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });
  };

  // envoyer les modifications
  const updateResult = await Eleve.updateOne({ token: req.params.token }, champs);

  if (updateResult.modifiedCount > 0) {
    return res.json({ result: true, message: 'Mise à jour réussie !' });
  } else {
    return res.json({ result: false, message: 'Aucun changement effectuée' });
  }
});

module.exports = router
