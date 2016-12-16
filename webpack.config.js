const path = require('path');
module.exports = {
	entry: {
		'demo/dist/demo.js' : './demo/src/demo.js'
	},
	output: {
		path: '.',
		filename: '[name]',
	},
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		}]
	}
}
