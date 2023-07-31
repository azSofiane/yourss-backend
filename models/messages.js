const mongoose = require('mongoose')

const messagesSchema = mongoose.Schema({
  messages: String,
  date: Date,

  expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profs'
  }, 
},{ versionKey: false });
const Msg = mongoose.model('messages', messagesSchema)

module.exports = Msg
