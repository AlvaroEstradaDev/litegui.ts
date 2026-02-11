import path from "path";
import ESLintPlugin from "eslint-webpack-plugin";
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import RemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts';

export const webpackCommon =
{
	entry: {
		'css':
			[
				path.resolve(__dirname, 'src/css/inspector.css'),
				path.resolve(__dirname, 'src/css/layout.css'),
				path.resolve(__dirname, 'src/css/style.css'),
				path.resolve(__dirname, 'src/css/normalize.css'),
				path.resolve(__dirname, 'src/css/widgets.css'),
			],
		litegui: [path.resolve(__dirname, './src/core.ts')]
	},
	devtool: 'inline-source-map',
	mode: 'development',
	output: {
		path: path.resolve(__dirname, "./dist"),
		publicPath: "./",
		library: {
			name: 'LiteGUI',
			type: 'umd',
			export: 'LiteGUI',
		},
		globalObject: 'this',
		filename: "[name].js"
	},
	plugins: [
		new RemoveEmptyScriptsPlugin(),
		new ESLintPlugin(),
		new MiniCssExtractPlugin({ filename: "litegui.css" })
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
			},
			{
				test: /\.ts?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			}
		],
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	}
};