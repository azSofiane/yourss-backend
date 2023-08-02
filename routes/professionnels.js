var express = require('express');
var router = express.Router();

const Professionnel = require('@models/professionnels');
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
  Professionnel.findOne({ email }).then(utilisateur => {
    if (!utilisateur) {
      return res.json({ result: false, error: 'Adresse e-mail non trouvée' });
    }

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

// todo - revoir verification pour mail, photo, mot de passe (token aussi) et date de naissance (voir si une nouvelle route ou plusieurs conditions dans la route de modification)
// Route pour modifier le profil
router.post('/edit', async (req, res) => {
  const { token, nom, prenom, photos, societe, presentation, parcours_professionnel, conseil_métier } = req.body;

  // variable de liste des champs modifiables
  let champs = { nom, prenom, photos, societe, presentation, parcours_professionnel, conseil_métier };

  // cela retire les espaces avant et après à la reception des données
  const cleanClasseList = { nom, prenom, societe };

  for (const i in cleanClasseList) {
    const cleanedField = cleanSpace(cleanClasseList[i]);

    if (cleanedField !== null) {
      champs[i] = cleanedField;
    };
  };

  // vérifier que le token existe dans la bdd
  const isValidToken = await Professionnel.findOne({ token });

  if (!isValidToken) {
    return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });
  }

  // envoyer les modifications
  const updateResult = await Professionnel.updateOne({ token }, champs);

  if (updateResult.modifiedCount > 0) {
    return res.json({ result: true, message: 'Mise à jour réussie !' });
  } else {
    return res.json({ result: false, message: 'Aucun changement effectuée' });
  }
});

module.exports = router;
