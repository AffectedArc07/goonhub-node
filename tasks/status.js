/*
Query for status of some servers that we expect high traffic for
*/

const { SimpleIntervalJob, Task } = require('toad-scheduler')
const { send } = require('../plugins/byondlink')

const servers = [
	// { ip: 'goondev.goonhub.com', port: 26900 },
	{ ip: 'goon1.goonhub.com', port: 26100 },
	{ ip: 'goon2.goonhub.com', port: 26200 },
	{ ip: 'goon3.goonhub.com', port: 26300 },
	{ ip: 'goon4.goonhub.com', port: 26400 },
]

const task = new Task(
	'status',
	() => {
		servers.forEach(server => {
			send({ ip: server.ip, port: server.port }, 'status', true)
				.catch(() => {})
		})
	}
)

exports.job = new SimpleIntervalJob({ minutes: 1 }, task, 'status')
