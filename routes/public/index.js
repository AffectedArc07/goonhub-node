const express = require('express')
const router = express.Router()
const routeStatus = require('./status')
const routeBanner = require('./banner')

router.get('/status/:server', routeStatus)
router.get('/banner', routeBanner)

module.exports = router
