var express = require('express');
var router = express.Router();


const Professionnel = require('@models/professionnels');
const uid2 = require('uid2')
const bcrypt = require('bcrypt')
const { checkBody } = require('@modules/checkBody');
const { isValidEmail } = require('@modules/emailValidator')

// ENREGISTRER UN PROFESSIONNEL

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['nom','prenom','email','mot_de_passe'])) {
    res.json({ result: false, error: 'Il vous manque des champs a remplir' });
    return;
  }

 // Validez l'adresse e-mail avec la regex EMAIL_REGEX
  // if (!EMAIL_REGEX.test(req.body.email)) {
  //   res.json({ result: false, error: 'Adresse e-mail invalide' });
  //   return;
  // };
  
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
      });
      
      newProfessionnel.save().then(data => {
        res.json({ result: true, token: data.token });
      });
    } else {
      // L'utilisateur existe déja en base de donnée
      res.json({ result: false, error: 'Lutilisateur existe' });
    }
  });  
});


//----------------------------------------

// CONNECTER UN PROFESSONNEL A SON COMPTE

// Vérifier si l'email et le mot de passe corresponde bien au professionnel qui se connecte
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email','mot_de_passe'])) {
    res.json({ result: false, error: 'Il vous manque des champs a remplir' });
    return;
  }
  // on vérifie si les coordonnées de l'utilisateur et on le connecte
  Professionnel.findOne({ email: req.body.email }).then(data => {
    if (data && bcrypt.compareSync(req.body.mot_de_passe, data.mot_de_passe)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'Lutilisateur na pas été trouvé' });
    }
  });
});


//----------------------------------------


module.exports = router;
