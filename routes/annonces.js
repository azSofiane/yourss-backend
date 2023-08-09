var express = require("express");
var router = express.Router();

// import modelè annonce
const Annonce = require("@models/annonces");
const Eleve = require("@models/eleves");
const Professionnel = require("@models/professionnels");

// import du modul de controle des champs
const { checkBody } = require("@modules/checkBody");
const { checkIdFormat } = require("@modules/checkIdFormat");
const { cleanSpace } = require("@modules/cleanSpace");

// route pour création d'une annonce par le professionnel
router.post("/create/:token", async (req, res) => {
  // todo - remettre
  // création des constantes token = req.body.token, titre = req.body.titre...
  const {
    date_de_creation,
    date_de_publication,
    date_de_debut,
    date_de_fin,
    token,
    titre,
    adresse,
    code_postal,
    ville,
    profession,
    description,
  } = req.body;

  // todo - remettre 'date_de_creation', 'token' et le control sur checkbody
  // vérifie si les champs sont remplis
  if (!checkBody(req.body, ["titre", "code_postal", "ville", "description"])) {
    res.json({ result: false, error: "Champs vide(s) ou manquant(s)" });
    return;
  }

  // vérifier que le token existe dans la bdd
  const isValidToken = await Professionnel.findOne({ token: req.params.token });

  console.log(isValidToken);

  // todo - remettre control sur verif du token
  if (!isValidToken) {
    // return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });
  }

  // todo - remettre dates :
  // variable de liste des champs modifiables
  // let champs = { titre, date_de_debut: dateDebutISO, date_de_fin: dateFinISO, adresse, code_postal, ville, profession, description };
  let champs = {
    date_de_creation,
    date_de_debut,
    date_de_publication,
    date_de_fin,
    titre,
    adresse,
    code_postal,
    ville,
    profession,
    description,
  };

  // cela retire les espaces avant et après à la reception des données
  const cleanClasseList = { titre, adresse, code_postal, ville };

  for (const i in cleanClasseList) {
    const cleanedField = cleanSpace(cleanClasseList[i]);

    if (cleanedField !== null) {
      champs[i] = cleanedField;
    }
  }

  // si pas de champs vides ou manquants, création de l'annonce
  const newAnnonce = new Annonce(champs)
    .save()
    .then((newDoc) => res.json({ result: true, newAnnonce: newDoc }));
});

// route pour modifier une annonce
router.put("/edit/:id", async (req, res) => {
  // création des constantes token = req.body.token, titre = req.body.titre...
  const { token, archive, titre, date_de_modification, date_de_publication, date_de_debut, date_de_fin, adresse, code_postal, ville, profession, description } = req.body;

  // vérifier que le token existe dans la bdd -
  const isValidToken = await Professionnel.findOne({ token });

  if (!isValidToken)
    return res.json({
      result: false,
      message: "Token invalide. Accès non autorisé",
    });

  // vérifier si l'id est au bon format -
  if (!checkIdFormat(req.params.id))
    return res.json({ result: false, message: "ID d'annonce invalide" });

  // vérifier que l'annonce existe dans la bdd -  (async donc result décalé)
  const isValidAnnonce = await Annonce.findById(req.params.id);

  if (!isValidAnnonce)
    return res.json({
      result: false,
      message: "Annonce pas trouvée ou archivée",
    });

  // variable de liste des champs modifiables
  // let champs = { titre, date_de_debut: dateDebutISO, date_de_fin: dateFinISO, adresse, code_postal, ville, profession, description };
  let champs = {
    titre,
    date_de_modification,
    date_de_publication,
    date_de_debut,
    date_de_fin,
    adresse,
    code_postal,
    ville,
    profession,
    description,
    archive
  };

  // cela retire les espaces avant et après à la reception des données
  const cleanClasseList = { titre, adresse, code_postal, ville };

  for (const i in cleanClasseList) {
    const cleanedField = cleanSpace(cleanClasseList[i]);

    if (cleanedField !== null) {
      champs[i] = cleanedField;
    }
  }

  // envoyer les modifications
  const updateResult = await Annonce.updateOne({ _id: req.params.id }, champs);

  if (updateResult.modifiedCount > 0) {
    return res.json({ result: true, message: "Mise à jour réussie !" });
  } else {
    return res.json({ result: false, message: "Aucun changement effectuée" });
  }
});

// route get pour récupérer toutes les annonces
router.get("/all/", async (req, res) => {
  Annonce.find().then((data) => {
    res.json({ result: true, Annonce: data });
  });
});

// route pour récupérer une annonce via sont id
router.get("/id/:id", async (req, res) => {
  // vérifier si l'id est au bon format
  if (!checkIdFormat(req.params.id)) return res.json({ result: false, error: "ID d'annonce invalide" });



  // chercher si l'annonce existe + regarder le token des éléves qui ont postulés
  const annonce = await Annonce.findById(req.params.id).populate('eleves_postulants.eleve');
  if (!annonce) return res.json({ result: false, message: "Annonce non trouvée" }); // si l'annonce existe pas



  // changement de l'id des éléves qui postule par leurs token
  const changeIdToTokenEleve = {
    ...annonce.toObject(),
    eleves_postulants: annonce.eleves_postulants.map(postulant => ({ eleve: postulant.eleve.token, statut: postulant.statut, message: postulant.message }))
  };


  // si tout bon, envoyer le résultat
  res.json({ result: true, annonce: changeIdToTokenEleve });
});

module.exports = router;
