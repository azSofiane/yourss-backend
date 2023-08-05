var express = require('express');
var router = express.Router();

// import modelè annonce
const Annonce = require('@models/annonces');
const Professionnel = require('@models/professionnels');

// import du modul de controle des champs
const { checkBody } = require('@modules/checkBody');
const { checkIdFormat } = require('@modules/checkIdFormat')
const { cleanSpace } = require('@modules/cleanSpace')


// route pour création d'une annonce par le professionnel
router.post('/', async (req, res) => {
  // todo - remettre date_de_creation, date_de_publication, date_de_debut, date_de_fin
  // création des constantes token = req.body.token, titre = req.body.titre...
  const { token, titre,  adresse, code_postal, ville, profession, description } = req.body;

  // todo - remettre 'date_de_creation',
  // vérifie si les champs sont remplis
  if (!checkBody(req.body, ['titre', 'code_postal', 'ville', 'description', 'token' ])) {
    // res.json({ result: false, error: 'Champs vide(s) ou manquant(s)' });
    // return;
  }

  // vérifier que le token existe dans la bdd
  const isValidToken = await Professionnel.findOne({ token: token });

  if (!isValidToken) {
    // return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });
  }

  // todo - remettre dates : date_de_creation, date_de_publication, date_de_debut, date_de_fin,
  // variable de liste des champs modifiables
  // let champs = { titre, date_de_debut: dateDebutISO, date_de_fin: dateFinISO, adresse, code_postal, ville, profession, description };
  let champs = { titre, adresse, code_postal, ville, profession, description };

  // //conversion de date
  // // 1- Fonction pour convertir une date au format français
  // //padStart permet de convertir en nombre entier (si 1 seul caractère, on ajoute "0" car on demande 2 caractères pour le jour et mois
  // function convertirDateFrEnISO(dateFr) {
  //   const [jour, mois, annee] = dateFr.split('/');
  //   return `${annee}-${mois.padStart(2, '0')}-${jour.padStart(2, '0')}`;
  // };

  // // 2- Convertit les dates françaises en format ISO 8601 (par exemple, "2023-08-15")
  // if (date_de_creation) {
  //   const dateCreationFr = date_de_creation;
  //   const dateCreationISO = convertirDateFrEnISO(dateCreationFr);
  //   champs.date_de_creation = dateCreationISO;
  // };

  // if (date_de_publication) {
  //   const datePublicationFr = date_de_publication;
  //   const datePublicationISO = convertirDateFrEnISO(datePublicationFr);
  //   champs.date_de_publication = datePublicationISO;
  // };

  // if (date_de_debut) {
  //   const dateDebutFr = date_de_debut;
  //   const dateDebutISO = convertirDateFrEnISO(dateDebutFr);
  //   champs.date_de_debut = dateDebutISO;
  // };

  // if (date_de_fin) {
  //   const dateFinFr = date_de_fin;
  //   const dateFinISO = convertirDateFrEnISO(dateFinFr);
  //   champs.date_de_fin = dateFinISO;
  // };

  // cela retire les espaces avant et après à la reception des données
  const cleanClasseList = { titre, adresse, code_postal, ville };

  for (const i in cleanClasseList) {
    const cleanedField = cleanSpace(cleanClasseList[i]);

    if (cleanedField !== null) {
      champs[i] = cleanedField;
    };
  };

  // si pas de champs vides ou manquants, création de l'annonce
  const newAnnonce = new Annonce(champs).save().then(newDoc => res.json({ result: true, newAnnonce: newDoc }))
})


// route pour modifier une annonce
router.put('/', async (req, res) => {
  // création des constantes token = req.body.token, titre = req.body.titre...
  const { id, token, archive, titre, date_de_modification, date_de_debut, date_de_fin, adresse, code_postal, ville, profession, description } = req.body;

  // vérifier que le token existe dans la bdd -
  const isValidToken = await Professionnel.findOne({ token });

  if (!isValidToken) return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });

  // vérifier si l'id est au bon format -
  if (!checkIdFormat(id)) return res.json({ result: false, error: 'ID d\'annonce invalide' });

  // vérifier que l'annonce existe dans la bdd -  (async donc result décalé)
  const isValidAnnonce = await Annonce.findById(id);

  if (!isValidAnnonce) return res.json({ result: false, message: 'Annonce pas trouvée ou archivée' });

  // variable de liste des champs modifiables
  // let champs = { titre, date_de_debut: dateDebutISO, date_de_fin: dateFinISO, adresse, code_postal, ville, profession, description };
  let champs = { titre, date_de_modification, date_de_debut, date_de_fin, adresse, code_postal, ville, profession, description };

  //conversion de date
  // 1- Fonction pour convertir une date au format français
  //padStart permet de convertir en nombre entier (si 1 seul caractère, on ajoute "0" car on demande 2 caractères pour le jour et mois)
  function convertirDateFrEnISO(dateFr) {
    const [jour, mois, annee] = dateFr.split('/');
    return `${annee}-${mois.padStart(2, '0')}-${jour.padStart(2, '0')}`;
  };

  // 2- Convertit les dates françaises en format ISO 8601 (par exemple, "2023-08-15")
  if (date_de_modification) {
    const dateModificationFr = date_de_modification;
    const dateModificationISO = convertirDateFrEnISO(dateModificationFr);
    champs.date_de_modification = dateModificationISO;
  };

  if (date_de_debut) {
    const dateDebutFr = date_de_debut;
    const dateDebutISO = convertirDateFrEnISO(dateDebutFr);
    champs.date_de_debut = dateDebutISO;
  };

  if (date_de_fin) {
    const dateFinFr = date_de_fin;
    const dateFinISO = convertirDateFrEnISO(dateFinFr);
    champs.date_de_fin = dateFinISO;
  };

  // cela retire les espaces avant et après à la reception des données
  const cleanClasseList = { titre, adresse, code_postal, ville };

  for (const i in cleanClasseList) {
    const cleanedField = cleanSpace(cleanClasseList[i]);

    if (cleanedField !== null) {
      champs[i] = cleanedField;
    };
  };

  // envoyer les modifications
  const updateResult = await Annonce.updateOne({ _id: id }, champs);

  if (updateResult.modifiedCount > 0) {
    console.log(updateResult);
    return res.json({ result: true, message: 'Mise à jour réussie !' });
  } else {
    return res.json({ result: false, message: 'Aucun changement effectuée' });
  };
});


// route pour archiver une annonce
router.put('/archive', async (req, res) => {
  // création des constantes token = req.body.token, titre = req.body.titre...
  const { id, token, archive } = req.body;

  // todo - faire en un module
  // Vérifiez si la valeur "archive" est un Boolean
    if(typeof archive !== 'boolean'){
    res.json({ result: false, error: 'envoi moi un booléen stp'});
    return;
  };

  // // vérifier que le token existe dans la bdd - 
  // const isValidToken = await Professionnel.findOne({ token });
  // vérifier que le token existe dans la bdd -
  const isValidToken = await Professionnel.findOne({ token });

  // if (!isValidToken) return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });

  // vérifier si l'id est au bon format -
  if (!checkIdFormat(id)) return res.json({ result: false, error: 'ID d\'annonce invalide' });

  // vérifier que l'annonce existe dans la bdd -  (async donc result décalé)
  const isValidAnnonce = await Annonce.findById(id);

  if (!isValidAnnonce) return res.json({ result: false, message: 'Annonce pas trouvée ou archivée' });


  // envoyer la modification pour archivage de l'annonce
  const updateResult = await Annonce.updateOne({ _id: id }, { archive });


  if (updateResult.modifiedCount > 0) {
    return res.json({ result: true, message: 'Mise à jour réussie!' });
  } else {
    return res.json({ result: false, message: 'Aucun changement effectuée' });
  };
});


// route get pour récupérer toutes les annonces
router.get('/', (req, res) => {
  Annonce.find()
  .then(data => {
    res.json({ result: true, Annonce: data})
  }) 
})

module.exports = router
