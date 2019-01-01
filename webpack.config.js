const path = require('path')

module.exports = {
	mode: 'development',
	entry: {
		'demo/dist/js/demo.js' : './demo/src/js/demo.js'
	},
	output: {
		path: path.resolve('.'),
		filename: '[name]',
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /(bower_components|node_modules|compile-server)/,
			loader: 'babel-loader'
		}]
	}
}
