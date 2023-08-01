var express = require('express');
var router = express.Router();

const Professionnel = require('@models/professionnels');
const uid2 = require('uid2')
const bcrypt = require('bcrypt')

const { checkBody } = require('@modules/checkBody');
const { cleanSpace } = require('@modules/cleanSpace')
const { isValidEmail } = require('@modules/emailValidator')
const { sendResetPasswordEmail } = require('@modules/sendResetPasswordEmail');
const { isStrongPassword } = require('@modules/passwordValidator');

// Routes post pour s'enregistrer en tant que professionel
router.post('/signup', (req, res) => {
  // Vérifiez si les champs sont remplies
  if (!checkBody(req.body, ['nom','prenom','email','mot_de_passe','fonction'])) {
    res.json({ result: false, error: 'Champs manquants ou vides' });
    return;
  };

  // Validez l'adresse e-mail avec la regex EMAIL_REGEX
  if (!isValidEmail(req.body.email)) {
    res.json({ result: false, error: 'Adresse e-mail invalide' });
    return;
  };

  // Vérifiez si le mot de passe est très fort
  /*if (!isStrongPassword(req.body.mot_de_passe)) {
    res.json({ result: false, error: 'Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial (@$!%*?&)' });
    return;
  };*/

  // Vérifiez si la valeur "fonction" est un Boolean
  /*if(typeof req.body.fonction !== 'boolean' ){
    res.json({ result: false, error: 'Tu te fou de ma gueule !'});
    return;
  }*/

  // Vérifiez si la valeur est true ou false
  /*if(req.body.fonction !== 'true' && req.body.fonction !== 'false'){
    res.json({ result: false, error: ' Bien essayé !'});
    return;
  }*/

  // Vérifier si l'utilisateur est déjà enregistré
  Professionnel.findOne({ email: req.body.email }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.mot_de_passe, 10);

      const newProfessionnel  = new Professionnel({
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email,
        fonction: req.body.fonction,
        mot_de_passe: hash,
        token: uid2(32),
      }).save().then(data => {
        res.json({ result: true, token: data.token });
      });
    } else {
      // L'utilisateur existe déja en base de donnée
      res.json({ result: false, error: 'L\'utilisateur existe déjà' });
    }
  });
});

// Routes post pour se connecter en tant que professionel
router.post('/signin', (req, res) => {
  // Vérifier si l'email et le mot de passe corresponde bien au professionnel qui se connecte
  if (!checkBody(req.body, ['email','mot_de_passe'])) {
    res.json({ result: false, error: 'Champs manquants ou vides' });
    return;
  };

  // Validez l'adresse e-mail avec la regex EMAIL_REGEX
  if (!isValidEmail(req.body.email)) {
    res.json({ result: false, error: 'Adresse e-mail invalide' });
    return;
  };

  // Rechercher l'utilisateur dans la base de données
  Professionnel.findOne({ email: req.body.email }).then(data => {
    if (data && bcrypt.compareSync(req.body.mot_de_passe, data.mot_de_passe)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'Utilisateur introuvable ou mot de passe incorrect' });
    };
  });
});

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
