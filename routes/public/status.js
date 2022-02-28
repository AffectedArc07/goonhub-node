const { send } = require('../../plugins/byondlink')

const router = async function (req, res) {
	const server = req.query.server
	const ip = req.query.ip
	const port = req.query.port

	try {
		const target = {}
		if (server) target.server = server
		else {
			target.ip = ip
			target.port = port
		}
		const data = await send(target, 'status')
		res.send({
			response: Object.fromEntries(new URLSearchParams(data.response)),
			meta: data.meta
		})
	} catch {
		res.status(500).send({ message: 'Unable to query server' })
	}
}

module.exports = router
