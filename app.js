require('module-alias/register')
require('dotenv').config()
require('@config/config')

var path = require('path')

var express = require('express')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var indexRouter = require('@routes/index')
var inscriptionRouter = require('@routes/inscription')
var connexionRouter = require('@routes/connexion')
var elevesRouter = require('@routes/eleves')
var professionnelsRouter = require('@routes/professionnels')
var annoncesRouter = require('@routes/annonces')
var reinisialisermdpRouter = require('@routes/reinisialisermdp')

var app = express()

const cors = require('cors')
app.use(cors())

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/inscription', inscriptionRouter)
app.use('/connexion', connexionRouter)
app.use('/professionnels', professionnelsRouter)
app.use('/eleves', elevesRouter)
app.use('/annonces', annoncesRouter)
app.use('/reinisialisermdp', reinisialisermdpRouter)

module.exports = app
