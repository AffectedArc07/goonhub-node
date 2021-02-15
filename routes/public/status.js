const { getLink: getByondLink, sendWithCache: sendToByondLink } = require('../../plugins/byondlink')

const router = async function (req, res) {
	const server = req.params.server || 'dev'
	const link = getByondLink(server)

	if (!link) {
		return res.status(500).send({ message: 'Incorrect server given' })
	}

	try {
		const data = await sendToByondLink(link, 'status', `${req.app.locals.cachePrefix}:status-${server}`)
		res.send({
			response: Object.fromEntries(new URLSearchParams(data.response)),
			meta: data.meta
		})
	} catch {
		res.status(500).send({ message: 'Unable to query server' })
	}
}

module.exports = router
