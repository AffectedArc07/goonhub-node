const redis = require('redis')
const client = redis.createClient({
	host: process.env.REDIS_HOST || '127.0.0.1',
	port: process.env.REDIS_PORT || 6379,
	retry_strategy: function (options) {
		if (options.error && options.error.code === 'ECONNREFUSED') {
			// End reconnecting on a specific error and flush all commands with
			// a individual error
			return new Error('The server refused the connection')
		}
		if (options.total_retry_time > 1000 * 60 * 60) {
			// End reconnecting after a specific timeout and flush all commands
			// with a individual error
			return new Error('Retry time exhausted')
		}
		if (options.attempt > 10) {
			// End reconnecting with built in error
			return undefined
		}
		// reconnect after
		return Math.min(options.attempt * 100, 3000)
	},
})

client.on('ready', function () {
	console.log('[redis] Connected to server')
})

module.exports = client
