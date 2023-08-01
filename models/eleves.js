const mongoose = require('mongoose')

const elevesSchema = mongoose.Schema({
  nom: String,
  prenom: String,
  email: String,
  mot_de_passe: String,
  token: String,
  resetToken: String,
  fonction: {
    type: String,
    default: 'true'
  },
  photos: String,
  date_de_naissance: String,
  etablissement: String,
  presentation: String,
  motivation: String,
  ville: String,
  code_postal: String,
  classe: String,
  disponible: Boolean,
  date_de_debut: Date,
  date_de_fin: Date,
  ma_recherche_de_stage: String,
  mot_cle: String,
  annonce_favori: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'annonces'
  }
}, { versionKey: false })

const Eleve = mongoose.model('eleves', elevesSchema)

module.exports = Eleve
