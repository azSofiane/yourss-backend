var express = require('express');
var router = express.Router();

const Annonce = require('@models/annonces');

router.get('/', async (req, res) => {
  Annonce.find().then(data => {
    const currentDate = new Date();

    // Filtre si l'annonce n'est pas archivée (archive=false), que la date de fin de l'annonce (si elle existe) ne dépasse pas la date d'aujourd'hui, et que la date de publication (si elle existe) est inférieure ou égale à la date d'aujourd'hui
    const filteredAnnonce = data.filter(item => !item.archive && (!item.date_de_fin || new Date(item.date_de_fin) >= currentDate) && (!item.date_de_publication || new Date(item.date_de_publication) <= currentDate));

    return res.json({ result: false, nombre_annonce: filteredAnnonce.length, annonce: filteredAnnonce });
  });
});

module.exports = router;
