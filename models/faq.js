const mongoose = require('mongoose')

const faqSchema = mongoose.Schema({
  question: String,
  reponse: String,
}, { versionKey: false })

const Faq = mongoose.model('faqs', faqSchema)

module.exports = Faq