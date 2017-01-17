var path = require("path");

// Read configuration from environment variables
const nodeEnv = process.env.NODE_ENV || "dev";

// Resolve modules, source, build and static paths
var sourceDirPath = path.resolve(__dirname, "src");
var buildDirPath = path.resolve(__dirname, "dist");
var staticDirPath = path.resolve(__dirname, "static");
var modulesDirPath = path.resolve(__dirname, "node_modules");

/**
 * The Webpack 2 configuration. The options are documented at
 * https://webpack.js.org/configuration/
 */
module.exports = {
    entry: {
        // The main entry point source file
        main: path.resolve(sourceDirPath, "index.tsx"),
    },

    output: {
        // Output files are place to this folder
        path: buildDirPath,
        // The file name template for the entry chunks
        filename: "index.js",
        // The URL to the output directory resolved relative to the HTML page
        publicPath: "/",
        // The name of the exported library, e.g. the global variable name
        library: "MyLibrary",
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
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" },
                    { loader: "sass-loader" },
                ],
            },
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
    devtool: nodeEnv === "dev" ? "cheap-eval-source-map" : "hidden-source-map",

    // Configuration for webpack-dev-server
    devServer: {
        contentBase: staticDirPath,
        stats: {
            colors: true,
        },
        watchOptions: {
            poll: 1000,
        },
        host: process.env.HOST || "0.0.0.0",
        port: process.env.PORT || 1111,
    },
};
