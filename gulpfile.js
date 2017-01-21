const gulp = require("gulp");
const gutil = require("gulp-util");
const del = require("del");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./webpack.config.js");

/**
 * Clean the build folder.
 */
gulp.task('clean', () => del(["dist/**/*"]));

/**
 * Build and watch cycle (another option for development)
 * Advantage: No server required, can run app from filesystem.
 * Disadvantage: Requests are not blocked until bundle is available,
 * can serve an old app on refresh.
 */
gulp.task("watch", ["build"], () => {
    gulp.watch(["src/**/*"], ["build"]);
});

/**
 * Build the JavaScript and stylesheet assets by
 * using the Webpack 2.
 */
gulp.task("build", callback => {
    webpack(webpackConfig).run((err, stats) => {
        if (err) {
            throw new gutil.PluginError("build", err);
        }
        gutil.log("[build]", stats.toString({
            colors: true,
        }));
        callback();
    });
});

/**
 * Serves and auto-reloads with webpack-dev-server.
 */
gulp.task("serve", callback => {
    const serverConfig = webpackConfig.devServer;
    const host = serverConfig.host;
    const port = serverConfig.port;
    const url = `http://${host}:${port}/`;
    // Modify the configuration so that the inline livereloading is enabled.
    // See: https://webpack.github.io/docs/webpack-dev-server.html#inline-mode-with-node-js-api
    webpackConfig.entry.main.unshift(`webpack-dev-server/client?${url}`);
    new WebpackDevServer(webpack(webpackConfig), serverConfig).listen(port, host, err => {
        if (err) {
            throw new gutil.PluginError("serve", err);
        }
        gutil.log("[serve]", url);
    });
});

// By default run the webpack-dev-server
gulp.task("default", ["serve"]);
