const mongoose = require('mongoose')

mongoose.connect(process.env.CONNECTION_MDB, { connectTimeoutMS: 2000 })
.then(() => console.log('=> Bien joué mon pote („• ᴗ •„)'))
.catch(error => console.error(error))
