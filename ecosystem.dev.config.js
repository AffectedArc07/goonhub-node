module.exports = {
  apps : [{
		name: 'goonhub-node',
    script: 'bin/www',
		ignore_watch: [
			'node_modules',
			'routes/public/banners',
			'.git',
			'bin/hub-client/hubdata'
		],
		env_development: {
			NODE_ENV: "development",
			PORT: 4000
		}
  }]
};
