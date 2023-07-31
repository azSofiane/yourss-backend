require('module-alias/register')
require('dotenv').config()
require('@config/config')

var path = require('path')

var express = require('express')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var indexRouter = require('@routes/index')
var professionnelsRouter = require('@routes/professionnels')
var profil_professionnelsRouter = require('@routes/professionnels')

var elevesRouter = require('@routes/eleves')
var app = express()

const cors = require('cors')
app.use(cors())

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/professionnels', professionnelsRouter)
app.use('/profil_professionnels', profil_professionnelsRouter)
app.use('/eleves', elevesRouter)

module.exports = app
