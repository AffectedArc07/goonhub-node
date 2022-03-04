const http2byond = require('http2byond')
const fs = require('fs')
const redis = require('./redis')
const { promisify } = require('util')
const redisGet = promisify(redis.get).bind(redis)
const { REDIS_CACHE_PREFIX } = require('../utilities/defines')

const Link = new http2byond()

const goonConfigFile = process.env.GAME_SERVER_CONFIG || 'servers.example.conf'
let goonServers

/**
 * Load the goon central config file
 */
function loadGoonServers () {
	const config = fs.readFileSync(goonConfigFile)
	goonServers = JSON.parse(config)
}

/**
 * Retrieve a goon server config object
 * @param {string} server The server ID
 * @returns {object|null} The server object if found
 */
function getGoonServer (server) {
	for (const serverKey in goonServers.servers) {
		const cServer = goonServers.servers[serverKey]
		if (server === serverKey && cServer.active) {
			return cServer
		}
	}
	return null
}

/**
 * Query a game server
 * @param {object} conn Game server connection details
 * @param {string} conn.ip The game server IP
 * @param {string|number} conn.port The game server port
 * @param {string} conn.server The goon server ID
 * @param {string|object} topic The message to send
 * @param {boolean} bypassCache Skip caching
 * @param {number} cacheTime How long to cache for
 * @returns {object} The game server response
 */
const send = async function (
	{ ip = null, port = null, server = null } = {},
	topic,
	bypassCache = false,
	cacheTime = 60
) {
	if (server) {
		const serverConfig = getGoonServer(server)
		if (serverConfig) {
			ip = serverConfig.address
			port = serverConfig.port
		}
	}
	if (!ip || !port) throw new Error('Unable to figure out who to query')
	if (typeof topic === 'object') topic = new URLSearchParams(topic).toString()

	const cacheKey = `${REDIS_CACHE_PREFIX}:${ip}-${port}-${topic}`
	const meta = { cache: 'miss' }
	let response

	if (!bypassCache) {
		response = await redisGet(cacheKey)
		if (response) {
			try {
				meta.cache = 'hit'
				response = JSON.parse(response)
			} catch {
				// bad cache value
				response = null
			}
		}
	}

	if (!response) {
		response = await Link.run({ ip, port, topic })
		// Response might still have a terminating null byte
		if (response?.replace) {
			// eslint-disable-next-line no-control-regex
			response = response.replace(new RegExp("\u0000", 'g'), '')
		}
		if (response) redis.setex(cacheKey, cacheTime, JSON.stringify(response))
	}

	return { response, meta }
}

// Reload the parsed config object whenever the actual config file changes
let fsTimeout
fs.watch(goonConfigFile, (eventType) => {
	if (eventType === 'change' && !fsTimeout) {
		// debounce because node fs.watch is unstable and sends multiple events per save often
		fsTimeout = setTimeout(() => {
			console.log(`[byondlink] Server config changed, refetching`)
			loadGoonServers()
			fsTimeout = null
		}, 1000)
	}
})

loadGoonServers()

module.exports = { getGoonServer, send }
