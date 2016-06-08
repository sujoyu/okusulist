var path = require("path");
var webpack = require("webpack");
var BowerWebpackPlugin = require("bower-webpack-plugin");
var CordovaPlugin = require('webpack-cordova-plugin');

module.exports = {
		entry: "./source/js/app.js",
		output: {
			filename: "./app.js"
		},
		module: {
	    loaders: [
	      { test: /\.css$/, loader: "style-loader!css-loader" },
	      { test: /\.png$/, loader: "url-loader?limit=100000" },
	      { test: /\.jpg$/, loader: "file-loader" },
	      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?mimetype=image/svg+xml' },
	      { test: /\.woff(\d+)?(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?mimetype=application/font-woff' },
	      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?mimetype=application/font-woff' },
	      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?mimetype=application/font-woff' },
        {
            test: /[\/\\]?persistence[\/\\]lib[\/\\].*\.js$/,
            loader: "imports?exports=>undefined"
        }
	    ]
	  },
    resolve: {
        root: [path.join(__dirname, "bower_components")],
        moduleDirectories: ["bower_components"],
    		extensions: ["", ".js", ".coffee", ".webpack.js", ".web.js"],
    		alias: {
            persistencejs: "persistence/lib/persistence.js",
            persistenceSql: "persistence/lib/persistence.store.sql.js",
            persistenceCordova: "persistence/lib/persistence.store.cordovasql.js"
        },
    },
    plugins: [
    	new BowerWebpackPlugin(),
    	new webpack.ProvidePlugin({
		    $: "jquery",
		    jQuery: "jquery",
		    "window.jQuery": "jquery",
		    _: "underscore",
		    // Promise: "es6-promise-polyfill",
		    // Materialize: "materialize/dist/js/materialize.js",
		    moment: "moment",
		    Encoding: "encoding-japanese",
			}),
   //  	new CordovaPlugin({
			//   config: 'config.xml',  // Location of Cordova' config.xml (will be created if not found)
			//   src: 'index.html',     // Set entry-point of cordova in config.xml
			//   platform: 'ios', // Set `webpack-dev-server` to correct `contentBase` to use Cordova plugins.
			//   version: true,         // Set config.xml' version. (true = use version from package.json)
			// })
    ]
}