const mongoose = require('mongoose')

const annoncesSchema = mongoose.Schema({
  titre: String,
  date_de_creation: Date,
  date_de_modification: Date,
  date_de_publication: Date,
  date_de_debut: Date,
  date_de_fin: Date,
  adresse: String,
  code_postal: String,
  ville: String,
  profession: [String],
  description: String,
  archive: {
    type: Boolean,
    default: false
  },
  professionnel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'professionnels'
  },
  eleves_postulants: [{
    eleve: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'eleves'
    },
    statut: {
      type: String,
      default: 'en cours'
    },
    message: String
  }]
}, { versionKey: false })

const Annonce = mongoose.model('annonces', annoncesSchema)

module.exports = Annonce
