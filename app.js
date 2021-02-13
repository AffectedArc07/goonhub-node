const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')

const gameStatusRouter = require('./routes/game-status')
const gameRelayRouter = require('./routes/game-relay')

const app = express()

app.locals.cachePrefix = process.env.REDIS_KEY_PREFIX || 'goonhub-node'

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

const corsWhitelist = [
	'198.27.70.16', // iridium3
	'51.161.117.110' // olympus
]
app.use(cors({
	origin: function (origin, callback) {
		if (origin === undefined || corsWhitelist.indexOf(origin) !== -1) {
			callback(null, true)
		} else {
			callback(new Error('Not allowed by CORS'))
		}
	},
	optionsSuccessStatus: 200 // for legacy browsers (like, oh i dunno, byond IE)
}))

// Routes
app.use('/game-status', gameStatusRouter)
app.use('/game-relay', gameRelayRouter)

app.use(function (req, res) {
	res.status(404).send({ error: "Sorry can't find that!" })
})

// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
	res.status(500).send({ error: err.message });
})

module.exports = app
