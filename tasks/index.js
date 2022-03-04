const { ToadScheduler } = require('toad-scheduler')
const { job: bannersJob } = require('./banners')
const { job: hubJob } = require('./hub')
const { job: statusJob } = require('./status')

const scheduler = new ToadScheduler()

scheduler.addSimpleIntervalJob(bannersJob)
scheduler.addSimpleIntervalJob(hubJob)
scheduler.addSimpleIntervalJob(statusJob)
