module.exports = {
  apps : [{
		name: 'goonhub-node',
    script: 'bin/www',
		ignore_watch: [
			'node_modules',
			'utilities/banners',
			'.git',
			'bin/hub-client/hubdata',
			'thunder-tests'
		],
		env_development: {
			NODE_ENV: "development",
			PORT: 4000
		}
  }]
};
