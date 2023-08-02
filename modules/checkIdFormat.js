const mongoose = require('mongoose')

function checkIdFormat(id) {
  const isValidObjectId = mongoose.Types.ObjectId.isValid(id)

  let isValidId = true

  if (!isValidObjectId) isValidId = false

  return isValidId
}

module.exports = { checkIdFormat }
