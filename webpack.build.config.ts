// Webpack.pack.config.ts
import { webpackCommon } from './webpack.var.config';
import path from "path";
import fs from "fs";
import TerserPlugin from "terser-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { Compiler } from "webpack";

// Set entry point
webpackCommon.entry.litegui = [path.resolve(__dirname, './src/core.ts')];

// Common setup
const copyPlugin = new CopyPlugin({
	patterns: [
		{ from: "node_modules/@simonwep/pickr/dist", to: "Pickr" },
	]
});

// Custom plugin to copy core.d.ts to litegui.d.ts and fix sourcemap reference
const CopyDtsPluginSafe = {
	apply: (compiler: Compiler) =>
	{
		compiler.hooks.done.tap('CopyTypesPlugin', () =>
		{
			const buildPath = path.resolve(__dirname, "./dist");
			const srcTypes = path.join(buildPath, "core.d.ts");
			const srcMap = path.join(buildPath, "core.d.ts.map");
			const destTypes = path.join(buildPath, "litegui.d.ts");
			const destMap = path.join(buildPath, "litegui.d.ts.map");

			try
			{
				if (fs.existsSync(srcTypes))
				{
					let content = fs.readFileSync(srcTypes, 'utf8');

					const sourceMapComment = "//# sourceMappingURL=core.d.ts.map";
					if (content.includes(sourceMapComment))
					{
						/*
						 * Replace the comment with the export AND the new comment
						 * Note: \n ensure newline.
						 */
						content = content.replace(sourceMapComment, "export as namespace LiteGUI;\n//# sourceMappingURL=litegui.d.ts.map");
					}
					else
					{
						// Fallback if comment not found for some reason
						content += "\nexport as namespace LiteGUI;\n//# sourceMappingURL=litegui.d.ts.map";
					}

					fs.writeFileSync(destTypes, content);
					console.log("Copied and updated core.d.ts to litegui.d.ts");
				}
				if (fs.existsSync(srcMap))
				{
					let mapContent = fs.readFileSync(srcMap, 'utf8');
					mapContent = mapContent.replace(/"file":"core.d.ts"/, '"file":"litegui.d.ts"');
					fs.writeFileSync(destMap, mapContent);
					console.log("Copied and updated core.d.ts.map to litegui.d.ts.map");
				}
			}
			catch (e)
			{
				console.error("Error copying definition files:", e);
			}
		});
	}
};


// Configuration 1: Unminified (litegui.js)
const unminifiedConfig = {
	...webpackCommon,
	mode: 'production',
	devtool: 'source-map',
	output: {
		path: path.resolve(__dirname, "./dist"),
		publicPath: "./",
		library: {
			name: 'LiteGUI',
			type: 'var',
			export: 'LiteGUI',
		},
		filename: "[name].js"
	},
	optimization: {
		minimize: false
	},
	plugins: [
		...webpackCommon.plugins,
		new CleanWebpackPlugin({
			cleanStaleWebpackAssets: false,
			protectWebpackAssets: false
		}),
		copyPlugin,
		CopyDtsPluginSafe
	],
	module: {
		...webpackCommon.module,
		rules: webpackCommon.module.rules.map((rule) =>
		{
			// Override ts-loader to output declarations to dist/
			if (rule.use === 'ts-loader')
			{
				return {
					...rule,
					use: {
						loader: 'ts-loader',
						options: {
							compilerOptions: {
								declaration: true,
								outDir: path.resolve(__dirname, "./dist")
							}
						}
					}
				};
			}
			return rule;
		})
	}
};

// Configuration 2: Minified (litegui.mini.js)
const minifiedConfig = {
	...webpackCommon,
	mode: 'production',
	devtool: false,
	output: {
		path: path.resolve(__dirname, "./dist"),
		publicPath: "./",
		library: {
			name: 'LiteGUI',
			type: 'var',
			export: 'LiteGUI',
		},
		filename: "[name].mini.js"
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
				terserOptions: {
					format: {
						comments: false,
					},
				},
			}),
			new CssMinimizerPlugin({
				minimizerOptions: {
					preset: [
						"default",
						{
							discardComments: { removeAll: true },
						},
					],
				}
			})
		]
	},
	plugins: [
		...webpackCommon.plugins,
		new CssMinimizerPlugin()
	],
	module: {
		...webpackCommon.module,
		rules: webpackCommon.module.rules.map((rule) =>
		{
			// Override ts-loader to disable declaration generation
			if (rule.use === 'ts-loader')
			{
				return {
					...rule,
					use: {
						loader: 'ts-loader',
						options: {
							compilerOptions: {
								declaration: false,
								declarationMap: false
							}
						}
					}
				};
			}
			return rule;
		})
	}
};

module.exports = [unminifiedConfig, minifiedConfig];
