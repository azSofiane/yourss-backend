require('module-alias/register')
require('dotenv').config()
require('@config/config')

var path = require('path')

var express = require('express')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var indexRouter = require('@routes/index')
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
app.use('/eleves', elevesRouter)

module.exports = app
