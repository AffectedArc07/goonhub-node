const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const gameStatusRouter = require('./routes/game-status')

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/game-status', gameStatusRouter)

module.exports = app
