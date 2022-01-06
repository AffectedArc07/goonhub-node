const fs = require('fs')
const { createCanvas, loadImage, registerFont } = require('canvas')
const { send } = require('../../plugins/byondlink')

registerFont(__dirname + '/banners/Play-Regular.ttf', { family: 'SS13-Banner' })
registerFont(__dirname + '/banners/Play-Bold.ttf', { family: 'SS13-Banner', weight: 'bold' })

const cacheTime = 60 // seconds
const bannerBgOn = `${__dirname}/banners/base_on.png`
const bannerBgOff = `${__dirname}/banners/base_off.png`

async function createBanner(online, bannerFile, name, serverData = {}) {
	const data = fs.readFileSync(online ? bannerBgOn : bannerBgOff)
	const img = await loadImage(data)
	const canvas = createCanvas(img.width, img.height)
	const context = canvas.getContext('2d')
	context.drawImage(img, 0, 0)

	context.font = "bold 13.5pt 'SS13-Banner'"
	context.fillStyle = online ? '#1b606f' : '#7f3524'
	context.fillText(name, 7, 21)

	context.font = "9pt 'SS13-Banner'"
	context.fillStyle = '#fff'
	let bannerText
	if (online) {
		bannerText = `Currently Playing, `
		if (parseInt(serverData.players) === 1) {
			bannerText += `there is 1 player.`
		} else {
			bannerText += `there are ${serverData.players} players.`
		}
	} else {
		bannerText = 'ERROR COMMUNICATING WITH SERVER.'
	}
	context.fillText(bannerText, 125, 19)

	const buffer = canvas.toBuffer('image/png')
	fs.writeFileSync(bannerFile, buffer)
}

const router = async function (req, res) {
	let name = req.query.name || ''
	const address = req.query.add
	const port = req.query.port

	// Sanitize the name a little
	name = name.replace(/[^A-Za-z0-9]/g, '').substring(0, 7)

	if (!name || !address || !port) {
		return res.status(400).end()
	}

	const bannerFile = `${__dirname}/banners/banner_${name}.png`

	// Respond with cached banner based on last modified
	if (fs.existsSync(bannerFile)) {
		const fileStats = fs.statSync(bannerFile)
		const lastModified = fileStats.mtimeMs
		const diff = (new Date().getTime() - lastModified) / 1000
		if (diff < cacheTime) {
			return res.sendFile(bannerFile)
		}
	}

	try {
		let serverData = await send({ ip: address, port }, 'status')
		serverData = Object.fromEntries(new URLSearchParams(serverData.response))
		await createBanner(true, bannerFile, name, serverData)
		res.sendFile(bannerFile)
	} catch {
		res.status(500)
	}
}

module.exports = router
