const ByondLink = require('byondlink')
const fs = require('fs');

const configFile = process.env.GAME_SERVER_CONFIG || 'servers.example.conf'
let links = []

const buildLinks = function() {
	let serverConfig = fs.readFileSync(configFile)
	try {
		serverConfig = JSON.parse(serverConfig)
	} catch {
		// preserve old data if the config file is busted
		return
	}

	links = []
	for (const serverKey in serverConfig) {
		const server = serverConfig[serverKey]
		if (server.active) {
			console.log(`[byondlink] Support enabled for server '${serverKey}' at '${server.address}:${server.port}'`)
			links.push({
				server: serverKey,
				link: new ByondLink(server.address, server.port)
			})
		}
	}
}

const getLink = function(server) {
	return links.find(link => link.server === server)?.link
}

let fsTimeout
fs.watch(configFile, (eventType) => {
	if (eventType === 'change' && !fsTimeout) {
		// debounce because node fs.watch is unstable and sends multiple events per save often
		fsTimeout = setTimeout(() => {
			console.log(`[byondlink] Server config changed, rebuilding links`)
			buildLinks()
			fsTimeout = null
		}, 1000)
	}
})

buildLinks()

module.exports = { getLink }
