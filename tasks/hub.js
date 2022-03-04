/*
Fetch new data from the byond hub
*/

const { SimpleIntervalJob, Task } = require('toad-scheduler')
const hubClientUpdate = require('../bin/hub-client')

const task = new Task(
	'hub',
	() => {
		hubClientUpdate()
	}
)

exports.job = new SimpleIntervalJob({ minutes: 1 }, task, 'hub')
