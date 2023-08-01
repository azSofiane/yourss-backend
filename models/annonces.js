const mongoose = require('mongoose')

const annoncesSchema = mongoose.Schema({
  titre: String,
  date_de_debut: Date,
  date_de_fin: Date,
  adresse: String,
  code_postal: String,
  ville: String,
  profession: [String],
  description: String,
  professionnel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profs'
  }, 
  eleves_postulants: [{
    type: mongoose.Schema.Types.ObjectId,
      eleve: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'eleves'
    },
    statut: {
      type: String,
      default: 'en cours'
    }
  }]
}, { versionKey: false })

const Ann = mongoose.model('annonces', annoncesSchema)

module.exports = Ann