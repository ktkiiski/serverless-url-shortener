const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

// Webpack plugins
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Read the website configuration
const websiteConfig = require("./website.config.js");

// Read the TypeScript configuration and use it
const tsconfigPath = path.resolve(__dirname, "tsconfig.json");
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

// Read configuration from environment variables
const debug = process.env.NODE_ENV !== "production";

// Resolve modules, source, build and static paths
const entryPaths = [path.resolve(__dirname, "./src/index.ts")];
const sourceDirPaths = _.uniq(entryPaths.map(filePath => path.dirname(filePath)));
const buildDirPath = path.resolve(__dirname, tsconfig.compilerOptions.outDir);
const modulesDirPath = path.resolve(__dirname, "node_modules");

// General plugins
const corePlugins = [
    new ExtractTextPlugin({
        disable: debug,
        filename: debug ? "[name].css" : "[name].[hash].css",
    }),
];

// Create HTML plugins for each webpage
const htmlPlugins = websiteConfig.pages.map(
    ({file, title}) => new HtmlWebpackPlugin({
        title: title,
        filename: path.relative("src", path.format(_.assign(_.pick(path.parse(file), 'dir', 'name'), {ext: ".html"}))),
        template: file,
        chunks: ['app'],
        // Insert tags for stylesheets and scripts
        inject: true,
        // No cache-busting needed, because hash is included in file names
        hash: false,
    })
);

// If building for the production, minimize the JavaScript
const compressPlugins = debug ? [] : [
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
        },
    }),
];

/**
 * The Webpack 2 configuration. The options are documented at
 * https://webpack.js.org/configuration/
 */
module.exports = {
    entry: {
        // The main entry point source files.
        // These are determined from the tsconfig.json file
        app: entryPaths,
    },

    output: {
        // Output files are place to this folder
        path: buildDirPath,
        // The file name template for the entry chunks
        filename: debug ? "[name].js" : "[name].[hash].js",
        // The URL to the output directory resolved relative to the HTML page
        publicPath: "/",
        // The name of the exported library, e.g. the global variable name
        library: "app",
        // How the library is exported? E.g. "var", "this"
        libraryTarget: "var",
    },

    module: {
        rules: [
            // Pre-process sourcemaps for JavaScript files ('.js')
            {
                test: /\.js$/,
                loader: "source-map-loader",
                enforce: "pre",
            },
            // Compile TypeScript files ('.ts' or '.tsx')
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
            },
            // Compile SASS files ('.scss')
            {
                test: /\.scss$/,
                // Extract to separate stylesheet file from the main bundle
                loader: ExtractTextPlugin.extract({
                    use: [{
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                        },
                    }, {
                        loader: "sass-loader",
                        options: {
                            outputStyle: debug ? 'nested' : 'compressed',
                            sourceMap: true,
                            sourceMapContents: true,
                        },
                    }],
                    fallback: 'style-loader',
                }),
            },
            // Convert any Pug (previously "Jade") templates to HTML
            {
                test: /\.pug$/,
                loader: 'pug-loader',
                options: {
                    pretty: debug,
                },
            },
            // Ensure that any images references in HTML files are included
            {
                test: /\.(md|markdown|html?|tmpl)$/,
                loader: 'html-loader',
                options: {
                    attrs: ["img:src", "link:href"],
                },
            },
            // Convert any Markdown files to HTML, and require any referred images/stylesheet
            {
                test: /\.(md|markdown)$/,
                loader: 'markdown-loader',
            },
            // Optimize image files and save them as files
            {
                test: /\.(gif|png|jpe?g|svg)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: "images/[name].[hash].[ext]",
                    },
                }, {
                    loader: 'image-webpack-loader',
                    options: {
                        progressive: true,
                        optipng: {
                            optimizationLevel: debug ? 0 : 7,
                        },
                    },
                }],
            },
        ],
    },

    resolve: {
        // Look import modules from these directories
        modules: sourceDirPaths.concat([modulesDirPath]),
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js"],
    },

    // When developing, enable sourcemaps for debugging webpack's output.
    devtool: debug ? "cheap-eval-source-map" : "source-map",

    // Configuration for webpack-dev-server
    devServer: {
        stats: {
            colors: true,
        },
        watchOptions: {
            poll: 1000,
        },
        host: process.env.HOST || "0.0.0.0",
        port: process.env.PORT || 1111,
    },

    // Plugins
    plugins: corePlugins.concat(htmlPlugins, compressPlugins),
};
