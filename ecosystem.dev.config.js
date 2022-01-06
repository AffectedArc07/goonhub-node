module.exports = {
  apps : [{
		name: 'goonhub-node',
    script: 'bin/www',
		ignore_watch: ['node_modules', 'routes/public/banners']
  }]
};
