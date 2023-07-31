const mongoose = require('mongoose')

const explicationSchema = mongoose.Schema({
  message: String,
  image: String,
}, { versionKey: false })

const Expli = mongoose.model('explications', explicationSchema)

module.exports = Expli