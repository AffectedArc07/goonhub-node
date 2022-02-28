module.exports = {
  apps : [{
		name: 'goonhub-node',
    script: 'bin/www',
		instances: 2,
		exec_mode: 'cluster',
		env_production: {
			NODE_ENV: "production",
			PORT: 4000
		},
		env_development: {
			NODE_ENV: "development",
			PORT: 4000
		}
  }]
};
