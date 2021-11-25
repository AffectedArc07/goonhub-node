// const { getLink: getByondLink, sendWithCache: sendToByondLink } = require('../../plugins/byondlink')
const { send } = require('../../plugins/byondlink2')

const router = async function (req, res) {
	const server = req.params.server || 'dev'

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
