/**
 * This is a stub file that just defines the bare minimum to satisfy linters.
 * Code to communicate with the BYOND hub directly is considered by Lummox to
 * be uhh, how shall we say, "not cool" for public dissemination.
 */

class HubClient {
	constructor() {
		this.server = {
			destroy: function() {}
		}
	}
	once() {}
	send_0xdb() {}
	send_0x7b() {}
	send_0xea() {}
}

module.exports = HubClient
