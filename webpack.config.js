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

// Resolve modules, source, build and static paths
const sourceDirPath = path.resolve(__dirname, websiteConfig.sourceDir);
const scripts = _.union(..._.map(websiteConfig.pages, page => page.scripts));
const buildDirPath = path.resolve(__dirname, tsconfig.compilerOptions.outDir);
const modulesDirPath = path.resolve(__dirname, "node_modules");

/**
 * Creates the Webpack 2 configuration according to the
 * defined environment. The options are documented at
 * https://webpack.js.org/configuration/
 */
module.exports = (env = process.env) => {
    const config = _.assign({}, env, process.env);
    // Read configuration from environment variables
    const devServerHost = config.HOST || '0.0.0.0';
    const devServerPort = config.PORT || 1111;
    const devServerBaseUrl = `http://${devServerHost}:${devServerPort}/`;
    const debug = config.NODE_ENV !== "production";
    const devServer = config.devServer;
    // Generate the plugins
    const plugins = [
        // Extract stylesheets to separate files in production
        new ExtractTextPlugin({
            disable: devServer,
            filename: debug ? "[name].css" : "[name].[hash].css",
        }),
        // Create HTML plugins for each webpage
        ...websiteConfig.pages.map(
            ({file, title, scripts}) => new HtmlWebpackPlugin({
                title: title,
                filename: path.format(_.assign(_.pick(path.parse(file), 'dir', 'name'), {ext: ".html"})),
                template: path.resolve(sourceDirPath, file),
                chunks: scripts.map(name => path.basename(name)),
                // Insert tags for stylesheets and scripts
                inject: true,
                // No cache-busting needed, because hash is included in file names
                hash: false,
            })
        ),
    ];
    // If building for the production, minimize the JavaScript
    if (!debug) {
        plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                },
            })
        );
    }
    return {
        // The main entry points for source files.
        entry: _.fromPairs(
            scripts.map(entry => [path.basename(entry), [path.resolve(sourceDirPath, entry)]])
        ),

        output: {
            // Output files are place to this folder
            path: buildDirPath,
            // The file name template for the entry chunks
            filename: debug ? "[name].js" : "[name].[hash].js",
            // The URL to the output directory resolved relative to the HTML page
            publicPath: devServer ? devServerBaseUrl : "/",
            // The name of the exported library, e.g. the global variable name
            library: "app",
            // How the library is exported? E.g. "var", "this"
            libraryTarget: "var",
        },

        module: {
            rules: [
                // Pre-process sourcemaps for JavaScript files ('.js')
                {
                    test: /\.(js|tsx?)$/,
                    loader: "source-map-loader",
                    enforce: "pre",
                },
                // Compile TypeScript files ('.ts' or '.tsx')
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                },
                // Extract CSS stylesheets from the main bundle
                {
                    test: /\.(css|scss)($|\?)/,
                    loader: ExtractTextPlugin.extract({
                        use: [{
                            loader: "css-loader",
                            options: {
                                // For production, compress the CSS
                                minimize: !debug,
                                sourceMap: true,
                                url: true,
                                import: true,
                            },
                        }, {
                            // Resolve relative url(...) references in the stylesheets
                            loader: "resolve-url-loader",
                            options: {
                                fail: true,
                                sourceMap: true,
                            },
                        }],
                        fallback: 'style-loader',
                    }),
                },
                // Compile SASS files ('.scss')
                {
                    test: /\.scss($|\?)/,
                    // Extract to separate stylesheet file from the main bundle
                    loader: "sass-loader",
                    options: {
                        outputStyle: 'nested',
                        // Source maps must be used in order to resolve-url-loader to work correctly!
                        sourceMap: true,
                        sourceMapContents: true,
                    },
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
                // Optimize image files and bundle them as files or data URIs
                {
                    test: /\.(gif|png|jpe?g|svg)$/,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            // Max bytes to be converted to inline data URI
                            limit: 100,
                            // If larger, then convert to a file instead
                            name: 'images/[name].[hash].[ext]',
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
                // Include font files either as data URIs or separate files
                {
                    test: /\.(eot|ttf|otf|woff2?|svg)($|\?|#)/,
                    loader: 'url-loader',
                    options: {
                        // Max bytes to be converted to inline data URI
                        limit: 100,
                        // If larger, then convert to a file instead
                        name: 'fonts/[name].[hash].[ext]',
                    }
                }
            ],
        },

        resolve: {
            // Look import modules from these directories
            modules: [
                sourceDirPath,
                modulesDirPath,
            ],
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
        plugins: plugins,
    };
};
