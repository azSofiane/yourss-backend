var express = require('express');
var router = express.Router();

// import modelè annonce
const Ann = require('@models/annonces');
const Professionnel = require('@models/professionnels');

// import du modul de controle des champs
const { checkBody } = require('@modules/checkBody');
const { cleanSpace } = require('@modules/cleanSpace')


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
    // todo - active a supprimer
    active: req.body.active
  });
  newAnn.save()
  .then(newDoc => {
    res.json({ result: true, newAnn: newDoc});
  })
})


// route pour modifier une annonce 
router.put('/:id', async (req, res) => {
  // création des constantes token = req.body.token, titre = req.body.titre...
  const { token, titre, date_de_debut, date_de_fin, adresse, code_postal, ville, profession, description, archive } = req.body;

  // vérifier que le token existe dans la bdd - test ok
  const isValidToken = await Professionnel.findOne({ token });

  if (!isValidToken) {
    return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });
  }
  
  console.log(req.params.id);
  // vérifier que le token existe dans la bdd - test ok (async donc result décalé)
  const isValidAnnonce = await Ann.findOne({ _id: req.params.id });

  if (!isValidAnnonce) {
    return res.json({ result: false, message: 'Annonce pas trouvée ou archivée' });
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
  let champs = { titre, date_de_debut: dateDebutISO, date_de_fin: dateFinISO, adresse, code_postal, ville, profession, description };
  
  // cela retire les espaces avant et après à la reception des données
  const cleanClasseList = { titre, adresse, code_postal, ville };

  for (const i in cleanClasseList) {
    const cleanedField = cleanSpace(cleanClasseList[i]);

    if (cleanedField !== null) {
      champs[i] = cleanedField;
    };
  };









  Ann.findById({ _id: req.params.id })
    .then(data => {
          if (data.archive === true) {
            return ({ result: false, message: "annonce non modifiable "})
          }
    })



  


  // if (date_de_debut) {
  //   champs.date_de_debut = convertirDateFrEnISO(date_de_debut);
  // }

  // if (date_de_fin) {
  //   champs.date_de_fin = convertirDateFrEnISO(date_de_fin);
  // }

  // Supprimer les champs non définis (ceux qui ne sont pas présents dans la requête) de l'objet champs
  for (const key in champs) {
    if (champs[key] === undefined) {
      delete champs[key];
    }
  }

  

  // Vérifie si au moins un champ/propriété (comme titre, ville...) à modifier est présent dans la requête
  if (Object.keys(req.body).length === 0) {
    res.json({ result: false, error: "Aucun champ à modifier n'a été modifié" });
    return;
  }

   // Mise à jour de l'annonce dans la base de données
   Ann.findOneAndUpdate({ _id: req.params.id }, champs 
    // L'option new: true renvoie le document mis à jour
    )
   .then(updatedAnn => {
     if (!updatedAnn) {
       return res.json({ result: false, message: 'Annonce non trouvée' });
     }
     res.json({ result: true, updatedAnn });
   })
   .catch(error => {
    res.json({ result: false, error: "Une erreur est survenue lors de la mise à jour de l'annonce" });
  });
})

// // Archiver l'annonce
// router.put('/desactiver/:id', async (req, res) => {
//   const annonceId = req.params.id;

//   // Vérifier que l'annonce existe dans la base de données
//   const annonce = await Ann.findById(annonceId);

//   if (!annonce) {
//     return res.json({ result: false, message: 'Annonce non trouvée' });
//   }

//   // Mettre à jour l'état de l'annonce pour le désactiver (archive: false)
//   annonce.archive = true;

//   // Sauvegarder la mise à jour dans la base de données
//   annonce.save()
//     .then(updatedAnn => {
//       res.json({ result: true, updatedAnn });
//     })
//     .catch(error => {
//       res.json({ result: false, error: 'Une erreur est survenue lors de la désactivation de l\'annonce' });
//     });
// });

module.exports = router