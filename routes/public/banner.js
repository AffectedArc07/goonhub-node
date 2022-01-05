const { send } = require('../../plugins/byondlink')

const router = async function (req, res) {
	const server = req.params.server || 'dev'

	console.log('Hit status with ' + server)
	try {
		const data = await send({ server }, 'status')
		res.send({
			response: Object.fromEntries(new URLSearchParams(data.response)),
			meta: data.meta
		})
	} catch {
		res.status(500).send({ message: 'Unable to query server' })
	}
}

module.exports = router
