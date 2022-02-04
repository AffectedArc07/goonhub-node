const express = require('express')
const router = express.Router()
const routeStatus = require('./status')
const routeBanner = require('./banner')
const routeHub = require('./hub')

router.get('/status/:server', routeStatus)
router.get('/banner', routeBanner)
router.get('/hub', routeHub)

module.exports = router
