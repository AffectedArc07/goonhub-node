const express = require('express')
const router = express.Router()
const { getLink: getByondLink } = require('../plugins/byondlink')
const redis = require('../plugins/redis')
const { promisify } = require('util')
const redisGet = promisify(redis.get).bind(redis)

function queryStatus(link) {
	return new Promise((resolve, reject) => {
		link.send('?status', (data) => {
			// Response still has a terminating null byte. Maybe this lib sucks?
			// eslint-disable-next-line no-control-regex
			data = data.replace(new RegExp("\u0000", 'g'), '')
			data = Object.fromEntries(new URLSearchParams(data))
			resolve(data)
		})

		link.on('error', (e) => {
			reject(e)
		})
	})
}

router.get('/:server', async function (req, res) {
	const server = req.params.server || 'dev'
	const link = getByondLink(server)

	if (!link) {
		return res.status(500).send({ message: 'Incorrect server given' })
	}

	const meta = {}
	const cacheKey = `goonhub-node:status-${server}`

	// check cache
	let status = await redisGet(cacheKey)

	if (status) {
		// cache hit
		meta.cache = 'hit'
		try {
			status = JSON.parse(status)
		} catch (e) {
			// bad cache value
			status = await queryStatus(link)
		}
	} else {
		// cache miss
		meta.cache = 'miss'
		status = await queryStatus(link)
		redis.setex(cacheKey, 60, JSON.stringify(status))
	}

	res.send({ response: status, meta })
})

module.exports = router
