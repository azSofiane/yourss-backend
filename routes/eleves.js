var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');

const Eleve= require ('@models/eleves');

const { isValidEmail } = require('@modules/emailValidator');
const {isStrongPassword} = require('@modules/passwordValidator');
const { cleanSpace } = require('@modules/cleanSpace')

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

// Route pour modifier le email
router.put('/editemail/:token', async (req, res) => {
  const { email } = req.body;

  // vérifier que le token existe dans la bdd
  const isValidToken = await Eleve.findOne({ token: req.params.token });

  if (!isValidToken) {
    return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });
  }
    // Vérifier si l'adresse e-mail est valide
  if (!isValidEmail(email)) {
    return res.json({ result: false, error: 'Adresse e-mail invalide' });
  };

  // envoyer les modifications
  const updateResult = await Eleve.updateOne({ token: req.params.token }, {email: email});

  if (updateResult.modifiedCount > 0) {
    return res.json({ result: true, message: 'Mise à jour réussie !' });
  } else {
    return res.json({ result: false, message: 'Aucun changement effectuée' });
  }
});

// Route pour modifier le mot de passe
router.put('/editmotdepasse/:token', async (req, res) => {
  const { mot_de_passe } = req.body;

  // vérifier que le token existe dans la bdd
  const isValidToken = await Eleve.findOne({ token: req.params.token });

  if (!isValidToken) {
    return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });
  }
  // Vérifiez si le mot de passe est très fort
  if (!isStrongPassword(mot_de_passe)) {
    res.json({ result: false, error: 'Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial (@$!%*?&)' });
    return;
  };
  const hash = bcrypt.hashSync(mot_de_passe, 10);

  // envoyer les modifications
  const updateResult = await Eleve.updateOne({ token: req.params.token }, {mot_de_passe: hash});

  if (updateResult.modifiedCount > 0) {
    return res.json({ result: true, message: 'Mise à jour réussie !' });
  } else {
    return res.json({ result: false, message: 'Aucun changement effectuée' });
  }
});

module.exports = router
