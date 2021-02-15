const express = require('express')
const router = express.Router()
const routeStatus = require('./status')

router.get('/status/:server', routeStatus)

module.exports = router
