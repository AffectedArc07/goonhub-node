const express = require('express')
const router = express.Router()
const { getLink: getByondLink, send: sendToByondLink } = require('../plugins/byondlink')

router.get('/:server', async function (req, res) {
	const server = req.params.server || 'dev'
	const relayData = req.query.data
	const link = getByondLink(server)

	if (!link) {
		return res.status(500).send({ message: 'Incorrect server given' })
	}
	if (!relayData) {
		return res.status(500).send({ message: 'No data to relay' })
	}

	try {
		const response = await sendToByondLink(link, relayData)
		res.send({ response })
	} catch {
		res.status(500).send({ message: 'Unable to query server' })
	}
})

module.exports = router
