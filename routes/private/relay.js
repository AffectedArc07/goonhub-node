const { send } = require('../../plugins/byondlink')

const relay = async function (req, res) {
	const server = req.query.server || 'dev'
	const relayData = req.query.data

	if (!relayData) {
		return res.status(500).send({ message: 'No data to relay' })
	}

	try {
		const data = await send({ server }, relayData, true)
		res.send({ response: data.response })
	} catch {
		res.status(500).send({ message: 'Unable to query server' })
	}
}

module.exports = relay
