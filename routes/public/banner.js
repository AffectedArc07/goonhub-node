const fs = require('fs')
const { send } = require('../../plugins/byondlink')
const { getBannerInfo, getCachedBanner, createBanner } = require('../../utilities/banners')
const { pregenBanners } = require('../../tasks/banners')

const router = async function (req, res) {
	let name = req.query.name || ''
	const address = req.query.add
	const port = req.query.port

	// Sanitize the name a little
	name = name.replace(/[^A-Za-z0-9]/g, '').substring(0, 7)

	if (!name || !address || !port) {
		return res.status(400).end()
	}

	// If the banner is in our pregen task, assume it's generated in the background
	// and just return it outright
	const pregenBanner = pregenBanners.find(banner => {
		return banner.name === name && banner.ip === address && banner.port === parseInt(port)
	})
	if (pregenBanner) {
		const pregenBannerInfo = getBannerInfo(pregenBanner.name)
		// It's technically possible for the banner to be in the pregen list, but not yet
		// generated, due to task scheduling delays. This should be extremely rare.
		if (fs.existsSync(pregenBannerInfo.path)) {
			return res.sendFile(pregenBannerInfo.filename, { root: pregenBannerInfo.dir })
		}
	}

	// Check for and return a cached banner if possible
	const cachedBanner = getCachedBanner(name)
	if (cachedBanner) {
		return res.sendFile(cachedBanner.filename, { root: cachedBanner.dir })
	}

	let serverData
	try {
		serverData = await send({ ip: address, port }, 'status')
		serverData = Object.fromEntries(new URLSearchParams(serverData.response))
	} catch {
		// suppress error
	}

	try {
		const { dir, filename } = await createBanner(!!serverData, name, serverData || {})
		res.sendFile(filename, { root: dir })
	} catch {
		res.status(500).send()
	}
}

module.exports = router
