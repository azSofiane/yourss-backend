const mongoose = require('mongoose')

const ProfessionnelsSchema = mongoose.Schema({
  nom: String,
  prenom: String,
  societe: String,
  email: String,
  mot_de_passe: String,
  token: String,
  fonction: Boolean,
  photos: String,
  parcours_professionnel: String,
  presentation: String,
  conseil_métier:String,
  resetPasswordToken: String,
  eleve_favori: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'eleves'
  }, 
}, { versionKey: false })

const Professionnel = mongoose.model('professionnels', ProfessionnelsSchema)

module.exports = Professionnel
