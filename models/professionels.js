const mongoose = require('mongoose')

const ProfSchema = mongoose.Schema({
  nom: String,
  prenom: String,
  societe: String,
  email: String,
  mot_de_passe:String,
  token:String,
  fonction:String,
  photos:String,
  parcours_professionnel: String,
  presentation: String,
  conseil_métier:String,
  eleve_favori: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'eleves'
  }, 
}, { versionKey: false })

const Prof = mongoose.model('profs', ProfSchema)

module.exports = Prof
