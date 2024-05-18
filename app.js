const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const redisClient = require('./plugins/redis')
const cors = require('cors')
const basicAuth = require('express-basic-auth')
const RateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis');

const app = express()

if (process.env.NODE_ENV === 'production') {
	app.use(cors({
		origin: [
			'https://goonhub.com',
			'https://staging.goonhub.com',
			'https://tomato.goonhub.com',
			'https://spacestation13.com',
			'https://wiki.ss13.co'
		],
		methods: 'GET'
	}))
} else {
	app.use(cors())
}

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(new RateLimit({
  store: new RedisStore({
		client: redisClient,
		prefix: `${app.locals.cachePrefix}-rl:`
	}),
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 300, // limit each IP to this many requests per windowMs
	message: { error: 'Too many requests, please try again later' }
}))

// Routes
const publicRoutes = require('./routes/public')
const gameRelayRouter = require('./routes/private/relay')

app.use('/', publicRoutes)
app.use('/wiz', basicAuth({
	users: { [process.env.API_PRIVATE_USER]: process.env.API_PRIVATE_PASS }
}), gameRelayRouter)

app.use(function (req, res) {
	res.status(404).send({ error: "Sorry can't find that!" })
})

// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
	res.status(500).send({ error: err.message });
})

if (process.env.NODE_ENV === 'production' && process.env.NODE_APP_INSTANCE === '0') {
	require('./tasks')
}

module.exports = app
