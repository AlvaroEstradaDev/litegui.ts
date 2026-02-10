import path from "path";

module.exports = {
	mode: "development",
	devtool: "source-map",
	entry: {
		litegui: path.resolve(__dirname, "src/index.ts")
	},
	output: {
		path: path.resolve(__dirname, "./dist"),
		filename: "[name].js",
		library: "LiteGUI",
		libraryTarget: "umd",
		globalObject: "this"
	},
	resolve: {
		extensions: [".ts", ".js"]
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: "ts-loader",
				exclude: /node_modules/
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"]
			}
		]
	},
	devServer: {
		static: [
			{
				directory: path.join(__dirname, "docs"),
				publicPath: "/docs"
			},
			{
				directory: path.join(__dirname, "examples"),
				publicPath: "/examples"
			},
			{
				directory: path.join(__dirname, "dist"),
				publicPath: "/dist"
			}
		],
		compress: true,
		port: 8080,
		open: ["/examples/editor.html"],
		hot: true,
		watchFiles: ["src/**/*", "examples/**/*"]
	}
};
