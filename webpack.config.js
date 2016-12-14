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
					include: [
						path.resolve(__dirname, "demo/src"),
						path.resolve(__dirname, "node_modules/coffeekraken-sugar"),
						path.resolve(__dirname, "src"),
						path.resolve(__dirname, "index.js"),
						path.resolve(__dirname, "index-part.js")
					],
					loader: 'babel-loader'
				}, {
					test: /\.html$/,
					loader: 'html'
				}]
		}
}
