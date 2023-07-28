const mongoose = require('mongoose')

const exempleSchema = mongoose.Schema({
  nom: String,
  prenom: String
}, { versionKey: false })

const Exemple = mongoose.model('exemmples', exempleSchema)

module.exports = Exemple
