var express = require('express');
var router = express.Router();


const Professionnel = require('@models/professionnels');


// Enregistrer le contenu de la présentation du professionnel

router.post('/createpresentation', (req, res) => {
    // if (!checkBody(req.body, ['presentation'])) {
    //   res.json({ result: false, error: 'Il vous manque des champs a remplir' });
    //   return;
    // }
    Professionnel.findOne({ presentation: req.body.presentation }).then(data => {
        if (data === null) {
          const newPresentationProfessionnel  = new Professionnel({
            presentation: req.body.presentation,
          });
          
          newPresentationProfessionnel.save().then(() => {
            res.json({ result: true, error:"le présentation a bien été enregistré"});
          });
          console.log(newPresentationProfessionnel)
        } 
      });  
    });

    // Modifier le contenu de la présentation du professionnel
    router.updateOne('/modifypresentation', (req, res) => {
        // if (!checkBody(req.body, ['presentation'])) {
        //   res.json({ result: false, error: 'Il vous manque des champs a remplir' });
        //   return;
        // }
        Professionnel.find({ presentation: req.body.presentation }).then(data => {
            if (data === null) {
              const newPresentationProfessionnel  = new Professionnel({
                presentation: req.body.presentation,
              });
              
              newPresentationProfessionnel.save().then(() => {
                res.json({ result: true, error:"le présentation a bien été modifié"});
              });
            } 
          });  
        });


module.exports = router;
