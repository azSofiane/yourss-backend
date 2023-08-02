var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');

const Eleve = require('@models/eleves');
const Professionnel = require('@models/professionnels');

const { checkBody } = require('@modules/checkBody');
const { isValidEmail } = require('@modules/emailValidator');

// Route pour connexion des utilisateurs
router.post('/', async (req, res) => {
  if (!checkBody(req.body, ['email', 'mot_de_passe'])) {
    res.json({ result: false, error: 'Champs manquants ou vides' });
    return
  };

  const { email, mot_de_passe } = req.body;

  // Vérifier si l'adresse e-mail est valide
  if (!isValidEmail(email)) {
    return res.json({ result: false, error: 'Adresse e-mail invalide' });
  };

  // verifier dans les deux collections le mail
  const [eleve, professionnel] = await Promise.all([
    Eleve.findOne({ email }),
    Professionnel.findOne({ email })
  ]);

  // verifier si il trouve avec le mail un utilisateur et si oui que le mot de passe correspond
  if(((!eleve && !professionnel) || (eleve && !bcrypt.compareSync(mot_de_passe, eleve.mot_de_passe)) || (professionnel && !bcrypt.compareSync(mot_de_passe, professionnel.mot_de_passe)))){
    return res.json({ result: false, error: 'Adresse e-mail ou mot de passe incorrect' });
  }

  let token;
  let userType;

  if(eleve && bcrypt.compareSync(mot_de_passe, eleve.mot_de_passe)){
    token = eleve?.token;
    userType = 'true';
  };

  if (professionnel && bcrypt.compareSync(mot_de_passe, professionnel.mot_de_passe)) {
    token = professionnel?.token;
    userType = 'false';
  };

  return res.json({ result: true, token, fonction: userType });
});

module.exports = router;
