const gulp = require("gulp");
const gutil = require("gulp-util");
const del = require("del");
const _ = require("lodash");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("./webpack.config.js");
const websiteConfig = require("./website.config.js");
const ghpages = require('gh-pages');
const s3 = require("gulp-s3-upload")({ signatureVersion: 'v4' });
const AWS = require("aws-sdk");

// Static assets are cached for a year
const staticAssetsCacheDuration = 31556926;
// HTML pages are cached for an hour
const staticHtmlCacheDuration = 3600;

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
gulp.task("build", ["clean"], callback => {
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
    _.each(webpackConfig.entry, entries => entries.unshift(`webpack-dev-server/client?${url}`));
    new WebpackDevServer(webpack(webpackConfig), serverConfig).listen(port, host, err => {
        if (err) {
            throw new gutil.PluginError("serve", err);
        }
        gutil.log("[serve]", url);
    });
});

/**
 * Upload the static assets to Amazon S3.
 */
gulp.task("deploy:s3:assets", ["build"], () =>
    gulp.src(["dist/**/*", "!dist/**/*.html"]).pipe(s3({
        Bucket: websiteConfig.bucket,
        ACL: 'public-read',
        CacheControl: `max-age=${staticAssetsCacheDuration}`,
    }))
);

/**
 * Upload the HTML files to Amazon S3.
 */
gulp.task("deploy:s3:html", ["deploy:s3:assets"], () =>
    gulp.src(["dist/**/*.html"]).pipe(s3({
        Bucket: websiteConfig.bucket,
        ACL: 'public-read',
        CacheControl: `max-age=${staticHtmlCacheDuration}`,
    }))
);

/**
 * Deploy the static website to Amazon S3.
 */
gulp.task("deploy:s3", ["deploy:s3:html"]);

/**
 * Deploy the static website to GitHub pages.
 */
gulp.task("deploy:ghpages", ["build"], complete => {
    ghpages.publish("dist", {
        remote: 'template',
        message: "Auto-generated commit",
        push: true,
        logger: message => console.log(message),
    }, complete);
});

// By default run the webpack-dev-server
gulp.task("default", ["serve"]);
