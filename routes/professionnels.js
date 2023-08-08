var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');

const Professionnel = require('@models/professionnels');
const Annonce = require("@models/annonces");

const { isValidEmail } = require('@modules/emailValidator');
const { isStrongPassword } = require('@modules/passwordValidator');
const Eleve = require('@models/eleves');
const { cleanSpace } = require('@modules/cleanSpace');

// Route qui verifie un token
//Todo refaire le non de la route
router.get('/:token', (req, res) => {
  Professionnel.findOne({ token: req.params.token })
  .select('-_id -email -mot_de_passe -token -fonction')
  .then(data => {
    data ? result = true : result = false;

    res.json({ result, data });
  });
});

// Route pour modifier le profil
router.put('/edit/:token', async (req, res) => {
  const { nom, prenom, photos, societe, presentation, parcours_professionnel, conseil_metier } = req.body;

  // variable de liste des champs modifiables
  let champs = { nom, prenom, photos, societe, presentation, parcours_professionnel, conseil_metier };

  // cela retire les espaces avant et après à la reception des données
  const cleanClasseList = { nom, prenom, societe };

  for (const i in cleanClasseList) {
    const cleanedField = cleanSpace(cleanClasseList[i]);

    if (cleanedField !== null) {
      champs[i] = cleanedField;
    };
  };

  // vérifier que le token existe dans la bdd
  const isValidToken = await Professionnel.findOne({ token: req.params.token });

  if (!isValidToken) {
    return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });
  }

  // envoyer les modifications
  const updateResult = await Professionnel.updateOne({ token: req.params.token }, champs);

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
  const isValidToken = await Professionnel.findOne({ token: req.params.token });

  if (!isValidToken) {
    return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });
  }
    // Vérifier si l'adresse e-mail est valide
  if (!isValidEmail(email)) {
    return res.json({ result: false, error: 'Adresse e-mail invalide' });
  };

  // envoyer les modifications
  const updateResult = await Professionnel.updateOne({ token: req.params.token }, {email: email});

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
  const isValidToken = await Professionnel.findOne({ token: req.params.token });

  if (!isValidToken) {
    return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });
  }
  // Vérifiez si le mot de passe est très fort
  if (!isStrongPassword(mot_de_passe)) {
    res.json({ result: false, error: 'Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial (@$!%*?&)' });
    return;
  };
  const hash = bcrypt.hash(mot_de_passe, 10);

  // envoyer les modifications
  const updateResult = await Professionnel.updateOne({ token: req.params.token }, {mot_de_passe: hash});

  if (updateResult.modifiedCount > 0) {
    return res.json({ result: true, message: 'Mise à jour réussie !' });
  } else {
    return res.json({ result: false, message: 'Aucun changement effectuée' });
  }
});

// Route pour récupérer un profil élève avec un token
router.get("/01/:token", async (req, res) => {
  const { token } = req.params.token;

  const professionnels = await Professionnel.findOne(token);
  if (!professionnels) {
    return res.json({ result: false, message: "Profil non trouvée" });
  }
  res.json({ result: true, professionnels });
});

// Route pour récuperer les annonces avec l'ID qu'a posté un professionnel en vérifiant son token.
router.get("annonces/:token/:id", async (req, res) => {

  // vérifier que le token existe dans la bdd -
    const isValidToken = await Professionnel.findOne({ token });
  
    if (!isValidToken)
      return res.json({
        result: false,
        message: "Token invalide. Accès non autorisé",
      });
  
    // vérifier si l'id est au bon format -
    const { id } = req.params;
    if (!checkIdFormat(id))
      return res.json({ result: false, error: "ID d'annonce invalide" });
  
    const annonce = await Annonce.findById(id);
  
    if (!annonce) {
      return res.json({ result: false, message: "Annonce non trouvée" });
    }
    res.json({ result: true, annonce });
  
  });
  
//route de filtrage par date des élèves
//Todo refaire le non de la route
router.get("/recherche/eleves", (req, res) => {
  Eleve.find().then((data) => {
    console.log("Données de la requête:", data);
    const currentDate = new Date()
    // Filtre si la date de recherche du stage de l'eleve ne dépasse pas la date d'aujourd'hui
    const filteredEleves = data.filter((item) => {
      const dateDebut = item.date_de_debut;
      return dateDebut ? new Date(dateDebut) < currentDate : true;
    });

  return res.json({
    result: true,
    nombre_eleve: filteredEleves.length,
    eleve: filteredEleves,
  });
});
});


module.exports = router;
