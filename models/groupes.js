const mongoose = require('mongoose')

const groupeSchema = mongoose.Schema({
    message:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'messages'},
    eleve: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'eleves'},
    professionnel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profs'
    },
}, { versionKey: false })
const Group = mongoose.model('groupes', groupeSchema)

module.exports = Group
