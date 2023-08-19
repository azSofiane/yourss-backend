var express = require("express");
var router = express.Router();

const bcrypt = require("bcrypt");

const Eleve = require("../models/eleves");
const Annonce = require("../models/annonces");

const { isValidEmail } = require("../modules/emailValidator");
const { isStrongPassword } = require("../modules/passwordValidator");
const { cleanSpace } = require("../modules/cleanSpace");
const { checkIdFormat } = require("../modules/checkIdFormat");

// Route qui verifie un token
router.get("/token/:token", (req, res) => {
  Eleve.findOne({ token: req.params.token })
    .select("-_id -email -mot_de_passe -token -fonction")
    .then((data) => {
      data ? (result = true) : (result = false);

      res.json({ result, data });
    });
});



// Route pour modifier le profil
router.put("/edit/:token", async (req, res) => {
  const {
    nom,
    prenom,
    photos,
    date_de_naissance,
    etablissement,
    presentation,
    motivation,
    ville,
    code_postal,
    disponible,
    date_de_debut,
    date_de_fin,
    ma_recherche_de_stage,
    mot_cle,
  } = req.body;

  // variable de liste des champs modifiables
  let champs = {
    nom,
    prenom,
    photos,
    date_de_naissance,
    etablissement,
    presentation,
    motivation,
    ville,
    code_postal,
    disponible,
    date_de_debut,
    date_de_fin,
    ma_recherche_de_stage,
    mot_cle,
  };

  // cela retire les espaces avant et après à la reception des données
  const cleanClasseList = { nom, prenom, etablissement, ville, code_postal };

  for (const i in cleanClasseList) {
    const cleanedField = cleanSpace(cleanClasseList[i]);

    if (cleanedField !== null) {
      champs[i] = cleanedField;
    }
  }

  // vérifier que le token existe dans la bdd
  const isValidToken = await Eleve.findOne({ token: req.params.token });

  if (!isValidToken) {
    return res.json({
      result: false,
      message: "Token invalide. Accès non autorisé",
    });
  }

  // envoyer les modifications
  const updateResult = await Eleve.updateOne(
    { token: req.params.token },
    champs
  );

  if (updateResult.modifiedCount > 0) {
    return res.json({ result: true, message: "Mise à jour réussie !" });
  } else {
    return res.json({ result: false, message: "Aucun changement effectuée" });
  }
});



// Route pour modifier le email
router.put("/editemail/:token", async (req, res) => {
  const { email } = req.body;

  // vérifier que le token existe dans la bdd
  const isValidToken = await Eleve.findOne({ token: req.params.token });

  if (!isValidToken) {
    return res.json({
      result: false,
      message: "Token invalide. Accès non autorisé",
    });
  }
  // Vérifier si l'adresse e-mail est valide
  if (!isValidEmail(email)) {
    return res.json({ result: false, error: "Adresse e-mail invalide" });
  }

  // envoyer les modifications
  const updateResult = await Eleve.updateOne(
    { token: req.params.token },
    { email: email }
  );

  if (updateResult.modifiedCount > 0) {
    return res.json({ result: true, message: "Mise à jour réussie !" });
  } else {
    return res.json({ result: false, message: "Aucun changement effectuée" });
  }
});



// Route pour modifier le mot de passe
router.put("/editmotdepasse/:token", async (req, res) => {
  const { mot_de_passe } = req.body;

  // vérifier que le token existe dans la bdd
  const isValidToken = await Eleve.findOne({ token: req.params.token });

  if (!isValidToken) {
    return res.json({
      result: false,
      message: "Token invalide. Accès non autorisé",
    });
  }
  // Vérifiez si le mot de passe est très fort
  if (!isStrongPassword(mot_de_passe)) {
    res.json({
      result: false,
      error:
        "Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial (@$!%*?&)",
    });
    return;
  }
  const hash = bcrypt.hashSync(mot_de_passe, 10);

  // envoyer les modifications
  const updateResult = await Eleve.updateOne(
    { token: req.params.token },
    { mot_de_passe: hash }
  );

  if (updateResult.modifiedCount > 0) {
    return res.json({ result: true, message: "Mise à jour réussie !" });
  } else {
    return res.json({ result: false, message: "Aucun changement effectuée" });
  }
});



// Route postuler à une annonce
router.put("/postuler/:id/:token", async (req, res) => {
  const currentDate = new Date();



  // 1/7 - Vérifier que le token existe dans la bdd
  const isValidToken = await Eleve.findOne({ token: req.params.token });
  if (!isValidToken) return res.json({ result: false, message: "Token invalide. Accès non autorisé 🫣" }); // si pas trouvé



  // 2/7 - Vérifier si l'id est au bon format
  if (!checkIdFormat(req.params.id)) return res.json({ result: false, message: "ID d'annonce invalide 🫣" });



  // 3/7 - Vérifier que l'annonce existe dans la bdd - (async donc result décalé)
  const annonce = await Annonce.findById(req.params.id);
  if (!annonce ) return res.json({ result: false, message: "Annonce pas trouvée 🫣" }); // si pas trouvée



  // 4/7 - Vérifier si l'annonce est archivé
  if (annonce.archive) return res.json({ result: false, message: "Annonce archivée 🫣" });



  // 5/7 - Vérifier si la date de publication est inférieur à la date du jour
  if (annonce.date_de_publication > currentDate  && annonce.date_de_publication !== null) return res.json({ result: false, message: "Annonce pas encore publiée 🫣" });



  // 6/7 - Vérifier si la date de fin est inférieur à la date du jour
  if (annonce.date_de_fin < currentDate && annonce.date_de_fin !== null) return res.json({ result: false, message: "Annonce expirée 🫣" });



  // 7/7 - Vérifier si l'ID de l'élève existe déjà dans la liste eleves_postulants
  const eleveExists = annonce.eleves_postulants.some(data => data.eleve.toString() === isValidToken.id.toString());
  if (eleveExists) return res.json({ result: false, message: "Déjà postulé 🫣" }); // si existe déjà



  // Ajouter le nouvel élève à la liste existante
  annonce.eleves_postulants.push({ eleve: isValidToken.id, message: req.body.message });



  // Envoyer les modifications
  const updateResult = await Annonce.updateOne({ _id: req.params.id }, { eleves_postulants: annonce.eleves_postulants });

  if (updateResult.modifiedCount > 0) {
    return res.json({ result: true, message: "Ta candidature est envoyé 🥳" });
  } else {
    return res.json({ result: false, message: "Ta candidature n'a pu être envoyé 😔" });
  }
});



// Route pour récupérer un profil élève avec un token
router.get("/profil/:token", async (req, res) => {
  const eleves = await Eleve.findOne({ token: req.params.token });

  if (!eleves) {
    return res.json({ result: false, message: "Profil non trouvée" });
  }

  res.json({ result: true, eleves });
});



// Route filtrage des annonces
router.get("/recherche/annonce/:token", async (req, res) => {
  // Vérifier que le token existe dans la bdd
  const isValidToken = await Eleve.findOne({ token: req.params.token });
  if (!isValidToken) return res.json({ result: false, message: "Token invalide. Accès non autorisé 🫣" }); // si pas trouvé

  console.log("id élève", isValidToken.id);

  Annonce.find().sort({ date_de_creation: -1 }).then((data) => {
    const currentDate = new Date();

    // Filtre si l'annonce n'est pas archivée (archive=false), que la date de fin de l'annonce (si elle existe) ne dépasse pas la date d'aujourd'hui, et que la date de publication (si elle existe) est inférieure ou égale à la date d'aujourd'hui
    const filteredAnnonce = data.filter(
      (item) =>
        !item.archive &&
        (!item.date_de_fin || new Date(item.date_de_fin) >= currentDate) &&
        (!item.date_de_publication ||
          new Date(item.date_de_publication) <= currentDate)
    );

    console.log(filteredAnnonce);


    return res.json({
      result: true,
      nombre_annonce: filteredAnnonce.length,
      annonce: filteredAnnonce,
      eleve: isValidToken.token
    });
  });
});



// Route pour récupérer mes annonces favoris
router.get("/mesfavoris/:token", async (req, res)=> {
  // 1/7 - Vérifier que le token existe dans la bdd
  const isValidToken = await Eleve.findOne({ token: req.params.token });
  if (!isValidToken) return res.json({ result: false, message: "Token invalide. Accès non autorisé 🫣" }); // si pas trouvé



  Annonce.find().then((data)=> {

    console.log(data);

    return res.json({ result: false, message: "Edwin test", a: data });

//   const mesannoncesfavoris = data.filter(e =>
//   (e.eleves.toString() === isValidToken.id.toString()))
//  if (!mesannoncesfavoris) {
//    return res.json({ result: false, message: "Annonce non trouvée" });
//  }
//  console.log(data)
//  return res.json({
//    result: true,
//    nombre_annonces: mesannoncesfavoris.length,
//    annonces: mesannoncesfavoris
//  });

})

});

module.exports = router;
