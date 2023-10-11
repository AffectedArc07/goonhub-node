const express = require('express')
const router = express.Router()
const routeRelay = require('./relay')

router.get('/relay', routeRelay)

module.exports = router
