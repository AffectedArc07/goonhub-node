/*
Banners that we expect high traffic to, and thus pre-generate on an interval
*/

const { SimpleIntervalJob, Task } = require('toad-scheduler')
const { createBanner } = require('../utilities/banners')
const { send } = require('../plugins/byondlink')

const banners = [
	// { name: 'GOONDEV', ip: 'goondev.goonhub.com', port: 26900 },
	{ name: 'GOON1', ip: 'goon1.goonhub.com', port: 26100 },
	{ name: 'GOON2', ip: 'goon2.goonhub.com', port: 26200 },
	{ name: 'GOON3RP', ip: 'goon3.goonhub.com', port: 26300 },
	{ name: 'GOON4RP', ip: 'goon4.goonhub.com', port: 26400 },
]

const task = new Task(
	'banners',
	() => {
		banners.forEach(banner => {
			send({ ip: banner.ip, port: banner.port }, 'status')
				.then(serverData => {
					const parsedData = Object.fromEntries(new URLSearchParams(serverData.response))
					createBanner(true, banner.name, parsedData)
				})
		})
	}
)

exports.pregenBanners = banners
exports.job = new SimpleIntervalJob({ seconds: 90 }, task, 'banners')
