var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');

const { isValidEmail } = require('@modules/emailValidator');
const {isStrongPassword} = require('@modules/passwordValidator');
const { cleanSpace } = require('@modules/cleanSpace');
const { checkIdFormat } = require("@modules/checkIdFormat");

const Professionnel = require('@models/professionnels');
const Eleve = require('@models/eleves');
const Annonce = require("@models/annonces");

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

// route de filtrage par date des élèves
//Todo refaire le non de la route
router.get("/recherche/eleves/:token", async (req, res) => {
  const currentDate = new Date()

  // 1/3 - Vérifier que le token existe dans la bdd
  const isValidToken = await Professionnel.findOne({ token: req.params.token });
  if (!isValidToken) return res.json({ result: false, message: "Token invalide. Accès non autorisé 🫣" }); // si pas trouvé => out

  // 2/3 recherche des élèves dans la bdd
  Eleve.find().then((data) => {

    // 3/3 Filtre si la date de recherche du stage de l'eleve n'est pas antérieur à la date d'aujourd'hui
    const filteredEleves = data
    .filter(item => item.date_de_fin > currentDate && item.disponible )
    .map(item => {
      return {
        nom: item.nom,
        prenom: item.prenom,
        photos: item.photos,
        ville: item.ville,
        code_postal: item.code_postal,
        date_de_debut: item.date_de_debut,
        date_de_fin: item.date_de_fin,
        mot_cle: item.mot_cle,
        etablissement: item.etablissement,
        motivation: item.motivation,
        ma_recherche_de_stage: item.ma_recherche_de_stage,
        token: item.token
      };
    });

  return res.json({
    result: true,
    nombre_eleve: filteredEleves.length,
    eleve: filteredEleves,
  });
});
});

// ROute pour récupérer les annonces que le professionnels vient de poster ( vérifier avec le token du professionnel), et les afficher dans la page "AnnonceList"
router.get("/mesannonces/:token", async (req, res)=> {
  // vérifier que le token existe dans la bdd
  const isValidToken = await Professionnel.findOne({ token: req.params.token });

  if (!isValidToken) {
    return res.json({ result: false, message: 'Token invalide. Accès non autorisé 🫣' });
  }


  Annonce.find().sort({ date_de_creation: -1 }).then((data)=> {
    const mesannonces = data.filter(e => e.professionnel?.toString() === isValidToken.id.toString())

    if (!mesannonces) {
      return res.json({ result: false, message: "Annonce non trouvée" });
    }

    return res.json({
      result: true,
      nombre_annonces: mesannonces.length,
      annonces: mesannonces
    });
  })
});


// Route accepter ou refuser un eleve
router.put('/postuler/:id/:token', async (req, res) => {
  // 1/5 - Vérifier que le token du professionnel existe dans la bdd
  const isValidToken = await Professionnel.findOne({ token: req.params.token });
  if (!isValidToken) return res.json({ result: false, message: "Token invalide. Accès non autorisé 🫣" }); // si pas trouvé



  // 2/5 - Vérifier si l'id de l'annonce est au bon format
  if (!checkIdFormat(req.params.id)) return res.json({ result: false, message: "ID d'annonce invalide 🫣" });



  // 3/5 - Vérifier que l'annonce existe dans la bdd - (async donc result décalé)
  const annonce = await Annonce.findById(req.params.id);
  if (!annonce ) return res.json({ result: false, message: "Annonce pas trouvée 🫣" }); // si pas trouvée



  // 4/5 - Vérifier que le token de l'eleve existe dans la bdd
  const isValidTokenEleve = await Eleve.findOne({ token: req.body.token });
  if (!isValidTokenEleve) return res.json({ result: false, message: "Token invalide. Accès non autorisé 🫣" }); // si pas trouvé



  // 5/5 - Vérifier si l'ID de l'élève existe dans la liste eleves_postulants
  const eleveExists = annonce.eleves_postulants.some(data => data.eleve.toString() === isValidTokenEleve.id.toString());
  if (!eleveExists) return res.json({ result: false, message: "Eleve n'est plus dans les postulants 🫣" }); // si existe déjà

  console.log('id', isValidTokenEleve.id)
  console.log('token', isValidTokenEleve.token)

  // Envoyer la modification de sont status
  const updateResult = await Annonce.updateOne({ _id: req.params.id }, { $set: { 'eleves_postulants.$[eleve].statut': req.body.statut } }, { arrayFilters: [{ 'eleve.eleve': isValidTokenEleve.id }] });

  if (updateResult.modifiedCount > 0) {
    return res.json({ result: true, message: "Status modifié 🥳" });
  } else {
    return res.json({ result: false, message: "Status non modifié 😔" });
  }
});


module.exports = router;
