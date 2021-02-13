const ByondLink = require('byondlink')
const fs = require('fs')
const redis = require('../plugins/redis')
const { promisify } = require('util')
const redisGet = promisify(redis.get).bind(redis)

const configFile = process.env.GAME_SERVER_CONFIG || 'servers.example.conf'
let links = []

/**
 * Build a list of ByondLink instances according to the global config
 */
const buildLinks = function () {
	let serverConfig = fs.readFileSync(configFile)
	try {
		serverConfig = JSON.parse(serverConfig)
	} catch {
		// preserve old data if the config file is busted
		return
	}

	links = []
	for (const serverKey in serverConfig.servers) {
		const server = serverConfig.servers[serverKey]
		if (server.active) {
			console.log(`[byondlink] Support enabled for server '${serverKey}' at '${server.address}:${server.port}'`)
			links.push({
				server: serverKey,
				link: new ByondLink(server.address, server.port)
			})
		}
	}
}

/**
 * Get a ByondLink instance associated with a server
 * @param {string} server The server ID
 */
const getLink = function (server) {
	return links.find(link => link.server === server)?.link
}

/**
 * Send a query to a byond server
 * @param {object} link The ByondLink instance
 * @param {string} data URL encoded string of data to query byond with
 * @param {object} options
 * @param {boolean} options.ignoreSuffix Whether to ignore the predefined ByondLink suffix
 */
const send = function (link, data, { ignoreSuffix = false } = {}) {
	return new Promise((resolve, reject) => {
		link.send(`?${data}`, (response) => {
			// Response still has a terminating null byte. Maybe this lib sucks?
			if (response?.replace) {
				// eslint-disable-next-line no-control-regex
				response = response.replace(new RegExp("\u0000", 'g'), '')
			}
			resolve(response)
		}, ignoreSuffix)

		link.on('error', (e) => {
			reject(e)
		})
	})
}

/**
 * Send a query to a byond server, with caching!
 * @param {object} link The ByondLink instance
 * @param {string} data URL encoded string of data to query byond with
 * @param {string} cacheKey Redis cache key to save to
 * @param {object} options
 * @param {boolean} options.ignoreSuffix Whether to ignore the predefined ByondLink suffix
 * @param {number} options.cacheTime Expiry time of cached item in seconds
 */
const sendWithCache = async function (link, data, cacheKey, { ignoreSuffix = false, cacheTime = 60 } = {}) {
	let response = await redisGet(cacheKey)
	const meta = {}

	if (response) {
		try {
			meta.cache = 'hit'
			response = JSON.parse(response)
		} catch {
			// bad cache value
			meta.cache = 'miss'
			response = await send(link, data, { ignoreSuffix })
		}
	} else {
		meta.cache = 'miss'
		response = await send(link, data, { ignoreSuffix })
		redis.setex(cacheKey, cacheTime, JSON.stringify(response))
	}

	return { response, meta }
}

// Reload the ByondLink instances whenever the global config changes
let fsTimeout
fs.watch(configFile, (eventType) => {
	if (eventType === 'change' && !fsTimeout) {
		// debounce because node fs.watch is unstable and sends multiple events per save often
		fsTimeout = setTimeout(() => {
			console.log(`[byondlink] Server config changed, rebuilding links`)
			buildLinks()
			fsTimeout = null
		}, 1000)
	}
})

buildLinks()

module.exports = { getLink, send, sendWithCache }
