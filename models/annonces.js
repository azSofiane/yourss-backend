const mongoose = require('mongoose')

const annoncesSchema = mongoose.Schema({
  titre: String,
  date_de_debut: Date,
  date_de_fin: Date,
  adresse:String,
  code_postal:String,
  ville:String,
  profession:[String],
  description:String,
  statuts:String,
  professionnel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profs'
  }, 
  eleve_postuler: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'eleves'
  }],
}, { versionKey: false })

const Ann = mongoose.model('annonces', annoncesSchema)

module.exports = Ann
