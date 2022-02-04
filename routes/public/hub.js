const fs = require('fs')

const hubDataFile = `${__dirname}/../../bin/hub-client/hubdata`

const router = function (req, res) {
	try {
		const data = fs.readFileSync(hubDataFile, { encoding: 'utf8', flag: 'r' })
		res.send({ response: JSON.parse(data) })
	} catch {
		res.status(500).send({ message: 'Unable to query hub' })
	}
}

module.exports = router
