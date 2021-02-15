const express = require('express')
const router = express.Router()
const routeRelay = require('./relay')

router.get('/relay/:server', routeRelay)

module.exports = router
