var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const uid2 = require('uid2');

const Eleve = require('../models/eleves');
const Professionnel = require('../models/professionnels');

const { checkBody } = require('../modules/checkBody');
const { isValidEmail } = require('../modules/emailValidator');
const { isStrongPassword } = require('../modules/passwordValidator');

// Route pour inscription des utilisateurs
router.post('/', async (req, res) => {
  if (!checkBody(req.body, ['nom', 'prenom', 'email', 'mot_de_passe', 'fonction'])) {
    res.json({ result: false, error: 'Champs manquants ou vides' });
    return
  };

  const { nom, prenom, email, mot_de_passe, fonction } = req.body;

  // todo - decommenter verification mail
  // Vérifier si l'adresse e-mail est valide
  // if (!isValidEmail(email)) {
  //   return res.json({ result: false, error: 'Adresse e-mail invalide' });
  // };

  // todo - decommenter la verification du mot de passe si fort ou non (8 caractères suffi)
  // Vérifiez si le mot de passe est très fort
  /*if (!isStrongPassword(mot_de_passe)) {
    res.json({ result: false, error: 'Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial (@$!%*?&)' });
    return;
  };*/

  // Vérifiez si la valeur est true ou false pour fonction
  if(fonction !== 'true' && fonction !== 'false'){
    res.json({ result: false, error: ' Bien essayé !'});
    return;
  }

  // verifier dans les deux collections le mail
  const [eleve, professionnel] = await Promise.all([
    Eleve.findOne({ email }),
    Professionnel.findOne({ email })
  ]);

  // verifier si il trouve avec le mail un utilisateur et si oui que le mot de passe correspond
  if (eleve || professionnel) {
    return res.json({ result: false, error: 'L\'utilisateur existe déjà' });
  };

  const hash = bcrypt.hashSync(mot_de_passe, 10);
  const donnesUtilisateur = { nom, prenom, email, fonction, mot_de_passe: hash, token: uid2(32) };

  // création du nouvelle utilisateur dans la bonne collection selon la fonction
  const newUtilisateur = fonction === 'true' ? new Eleve(donnesUtilisateur) : new Professionnel(donnesUtilisateur);

  newUtilisateur.save().then(newDocument => res.json({ result: true, token: newDocument.token, fonction: newDocument.fonction }));
});

module.exports = router;
