var express = require('express')
var router = express.Router()

const Eleve= require ('@models/eleves');
const { cleanSpace } = require('@modules/cleanSpace')


// todo - revoir verification pour mail, mot de passe (token aussi) et date de naissance (voir si une nouvelle route ou plusieurs conditions dans la route de modification)
// Route pour modifier le profil
router.post('/edit', async (req, res) => {
  const { token, nom, prenom, photos, etablissement, presentation, motivation, ville, code_postal, classe, disponible, date_de_debut, date_de_fin, ma_recherche_de_stage, mot_cle } = req.body;

  // variable de liste des champs modifiables
  let champs = { nom, prenom, photos, etablissement, presentation, motivation, ville, code_postal, classe, disponible, date_de_debut, date_de_fin, ma_recherche_de_stage, mot_cle };

  // cela retire les espaces avant et après à la reception des données
  const cleanClasseList = { nom, prenom, etablissement, ville, code_postal, classe };

  for (const i in cleanClasseList) {
    const cleanedField = cleanSpace(cleanClasseList[i]);

    if (cleanedField !== null) {
      champs[i] = cleanedField;
    };
  };

  // vérifier que le token existe dans la bdd
  const isValidToken = await Eleve.findOne({ token });

  if (!isValidToken) {
    return res.json({ result: false, message: 'Token invalide. Accès non autorisé' });
  }

  // envoyer les modifications
  const updateResult = await Eleve.updateOne({ token }, champs);

  if (updateResult.modifiedCount > 0) {
    return res.json({ result: true, message: 'Mise à jour réussie !' });
  } else {
    return res.json({ result: false, message: 'Aucun changement effectuée' });
  }
});

module.exports = router
