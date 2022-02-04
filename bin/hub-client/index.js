const fs = require('fs')
let HubClient
if (fs.existsSync(`${__dirname}/hubclient.js`)) {
	HubClient = require('./hubclient')
} else {
	HubClient = require('./hubclient-stub')
}

const cacheFile = `${__dirname}/hubdata`
// const cacheTime = 1 * 60

function getBlacklist() {
	const data = fs.readFileSync(__dirname + '/blacklist.txt', { encoding: 'utf8', flag: 'r' })
	return data.split(/\r?\n/).filter(w => w)
}

function decodeQueryParam(p) {
	p = p.replace(/%ff%16/g, '')
  return decodeURIComponent(p.replace(/\+/g, ' '));
}

function parseHubData(data) {
	const blacklist = getBlacklist()
	const decoded = decodeURIComponent(data)
	const primarySplit = decoded.split(';worlds=')
	const serverSplit = primarySplit[1].split('&')
	const servers = []
	serverSplit.forEach(server => {
		const serverPieces = server.split(';')
		// const id = serverPieces[0].split('=')[1]
		const urlId = serverPieces[1].split('=')[1]
		let status = serverPieces[2].split('=')[1]
		const players = parseInt(serverPieces[3].split('=')[1])
		// const guests = parseInt(serverPieces[4].split('=')[1])

		try {
			status = decodeQueryParam(status)
		} catch {
			console.log('Error on', status)
			return
		}

		if (!status) return
		if (blacklist.some(v => status.includes(v))) {
			// console.log('Bad words!', status)
			return
		}

		servers.push({
			urlId,
			players,
			status
		})
	})
	return servers
}

function fetchData(cb) {
	const client = new HubClient()
	client.once('connect', () => {
		// were a client on 513.1542, give us a hub key
		client.send_0xdb(513, 1542)
		// were a client on 513 and windows (1). just log this for the sake of it
		client.send_0x7b(513, 1)
		// get me all live games for 8266 (ss13)
		client.send_0xea(8266, 0, 'live')
		client.once('reply', data => {
			const parsedData = parseHubData(data)
			typeof cb === 'function' && cb(parsedData)
			client.server.destroy()
		})
	})
}

function update() {
	// if (fs.existsSync(cacheFile)) {
	// 	const fileStats = fs.statSync(cacheFile)
	// 	const lastModified = fileStats.mtimeMs
	// 	const diff = (new Date().getTime() - lastModified) / 1000
	// 	if (diff < cacheTime) {
	// 		console.log('File within cachetime, skipping')
	// 		return
	// 	}
	// }

	fetchData((data) => {
		fs.writeFile(cacheFile, JSON.stringify(data), (err) => {
			if (err) {
				return console.log('Error writing to cache file', err)
			}
		})
	})
}

module.exports = update
