var express = require('express');
var router = express.Router();

// import modelè annonce
const Ann = require('@models/annonces');
const Professionnel = require('@models/professionnels');

// import du modul de controle des champs
const { checkBody } = require('@modules/checkBody');


// route pour création d'une annonce par le professionnel
router.post('/', async (req, res) => {
  // vérifie si les champs sont remplis 
  if (!checkBody(req.body, ['titre', 'date_de_debut', 'date_de_fin',  'adresse', 'code_postal', 'ville','profession', 'description', 'token' ])) {
    res.json({ result: false, error: 'Champs vide(s) ou manquant(s)' });
    return;
  }

  // vérifier que le token existe dans la bdd
  const isValidToken = await Professionnel.findOne({ token: req.body.token });

  if (!isValidToken) {
    return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });
  }

  //conversion de date 
  // 1- Fonction pour convertir une date au format français (par exemple, "15/08/2023") en format ISO 8601 (par exemple, "2023-08-15")
  //padStart permet de convertir en nombre entier (si 1 seul caractère, on ajoute "0" car on demande 2 caractères pour le jour et mois)

  function convertirDateFrEnISO(dateFr) {
    const [jour, mois, annee] = dateFr.split('/');
    return `${annee}-${mois.padStart(2, '0')}-${jour.padStart(2, '0')}`;
  }

  // 2- Suppose que req.body.date_de_debut et req.body.date_de_fin contiennent les dates françaises sous forme de chaîne (par exemple, "15/08/2023")
  const dateDebutFr = req.body.date_de_debut;
  const dateFinFr = req.body.date_de_fin;

  // 3- Convertit les dates françaises en format ISO 8601 (par exemple, "2023-08-15")
  const dateDebutISO = convertirDateFrEnISO(dateDebutFr);
  const dateFinISO = convertirDateFrEnISO(dateFinFr);
    
  // si pas de champs vides ou manquants, création de l'annonce
  const newAnn = new Ann({
    titre: req.body.titre,
    date_de_debut: dateDebutISO,
    date_de_fin: dateFinISO,
    adresse: req.body.adresse,
    code_postal: req.body.code_postal,
    ville: req.body.ville, 
    profession: req.body.profession,
    description: req.body.description,
  });
  newAnn.save()
  .then(newDoc => {
    res.json({ result: true, newAnn: newDoc});
  })
})


// route pour modifier une annonce 

router.put('/:id', async (req, res) => {

  // création des constantes token = req.body.token, titre = req.body.titre...
  const { token, titre, date_de_debut, date_de_fin, adresse, code_postal, ville, profession, description } = req.body;

  // vérifier que le token existe dans la bdd
  const isValidToken = await Professionnel.findOne({ token: req.body.token });

  if (!isValidToken) {
    return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });
  }

  //conversion de date 
  // 1- Fonction pour convertir une date au format français 
  //padStart permet de convertir en nombre entier (si 1 seul caractère, on ajoute "0" car on demande 2 caractères pour le jour et mois)

  function convertirDateFrEnISO(dateFr) {
    const [jour, mois, annee] = dateFr.split('/');
    return `${annee}-${mois.padStart(2, '0')}-${jour.padStart(2, '0')}`;
  }

  // 2- Suppose que req.body.date_de_debut et req.body.date_de_fin contiennent les dates françaises sous forme de chaîne (par exemple, "15/08/2023")
  const dateDebutFr = req.body.date_de_debut;
  const dateFinFr = req.body.date_de_fin;

  // 3- Convertit les dates françaises en format ISO 8601 (par exemple, "2023-08-15")
  const dateDebutISO = convertirDateFrEnISO(dateDebutFr);
  const dateFinISO = convertirDateFrEnISO(dateFinFr);

  // variable de liste des champs modifiables
  let champs = { titre, date_de_debut: dateDebutISO, date_de_fin: dateFinISO , adresse, code_postal, ville, profession, description};

  // Supprimer les champs non définis (ceux qui ne sont pas présents dans la requête) de l'objet champs
  for (const key in champs) {
    if (champs[key] === undefined) {
      delete champs[key];
    }
  }


  // Vérifie si au moins un champ à modifier est présent dans la requête
  if (Object.keys(req.body).length === 0) {
    res.json({ result: false, error: "Aucun champ à modifier n'a été modifié" });
    return;
  }

   // Mise à jour de l'annonce dans la base de données
   Ann.findByIdAndUpdate(req.params.id, champs, { new: true })
   .then(updatedAnn => {
     if (!updatedAnn) {
       return res.json({ result: false, message: 'Annonce non trouvée' });
     }
     res.json({ result: true, updatedAnn });
   })

   
  // Ann.updateOne(
  //   { },//  qui doit changer
  //   { } //  ce qui doit changer
  // ).then(() => { 
  //   Ann.find().then(UpdatedAnn => {
  //     console.log(UpdatedAnn);
  //   });
  //   });

})

module.exports = router