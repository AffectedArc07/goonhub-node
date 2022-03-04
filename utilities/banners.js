const fs = require('fs')
const { createCanvas, loadImage, registerFont } = require('canvas')

registerFont(__dirname + '/banners/Play-Regular.ttf', { family: 'SS13-Banner' })
registerFont(__dirname + '/banners/Play-Bold.ttf', { family: 'SS13-Banner', weight: 'bold' })

const bannerDir = `${__dirname}/banners`
const bannerBgOn = `${bannerDir}/base_on.png`
const bannerBgOff = `${bannerDir}/base_off.png`
const cacheTime = 60 // seconds

function getBannerInfo(name) {
	const filename = `banner_${name}.png`
	return {
		dir: bannerDir,
		filename,
		path: `${bannerDir}/${filename}`
	}
}
exports.getBannerInfo = getBannerInfo

exports.getCachedBanner = function(name) {
	const bannerInfo = getBannerInfo(name)
	if (fs.existsSync(bannerInfo.path)) {
		const fileStats = fs.statSync(bannerInfo.path)
		const lastModified = fileStats.mtimeMs
		const diff = (new Date().getTime() - lastModified) / 1000
		if (diff < cacheTime) {
			return bannerInfo
		}
	}
	return false
}

exports.createBanner = async function(online, name, serverData = {}) {
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

	const bannerInfo = getBannerInfo(name)
	const buffer = canvas.toBuffer('image/png')
	fs.writeFileSync(bannerInfo.path, buffer)
	return bannerInfo
}
