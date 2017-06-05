const gulp = require('gulp');
const gutil = require('gulp-util');
const del = require('del');
const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const createWebpackConfig = require('./webpack.config.js');
const siteConfig = require('./site.config.js');
const AWS = require('aws-sdk');
const fs = require('fs');
const serverlessStatePath = path.resolve(__dirname, '.serverless/serverless-state.json');
const serverlessState = JSON.parse(fs.readFileSync(serverlessStatePath, 'utf8')).service;
const s3 = require('gulp-s3-upload')(
    { signatureVersion: 'v4' },
    { region: serverlessState.provider.region }
);

// Static assets are cached for a year
const staticAssetsCacheDuration = 31556926;
// HTML pages are cached for an hour
const staticHtmlCacheDuration = 3600;

/**
 * Clean the build folder.
 */
gulp.task('clean', () => del(['dist/**/*']));

/**
 * Build and watch cycle (another option for development)
 * Advantage: No server required, can run app from filesystem.
 * Disadvantage: Requests are not blocked until bundle is available,
 * can serve an old app on refresh.
 */
gulp.task('watch', ['build'], () => {
    gulp.watch(['src/**/*'], ['build']);
});

/**
 * Build the JavaScript and stylesheet assets by
 * using the Webpack 2.
 */
gulp.task('build', ['clean'], callback => {
    const webpackConfig = createWebpackConfig(process.env);
    webpack(webpackConfig).run((err, stats) => {
        if (err) {
            throw new gutil.PluginError('build', err);
        }
        gutil.log('[build]', stats.toString({
            colors: true,
        }));
        callback();
    });
});

/**
 * Serves and auto-reloads with webpack-dev-server.
 */
gulp.task('serve', callback => {
    const webpackConfig = createWebpackConfig(Object.assign({}, process.env, {devServer: true}));
    const serverConfig = webpackConfig.devServer;
    const host = serverConfig.host;
    const port = serverConfig.port;
    const url = `http://${host}:${port}/`;
    // Modify the configuration so that the inline livereloading is enabled.
    // See: https://webpack.github.io/docs/webpack-dev-server.html#inline-mode-with-node-js-api
    _.each(webpackConfig.entry, entries => entries.unshift(`webpack-dev-server/client?${url}`));
    new WebpackDevServer(webpack(webpackConfig), serverConfig).listen(port, host, err => {
        if (err) {
            throw new gutil.PluginError('serve', err);
        }
        gutil.log('[serve]', url);
    });
});

/**
 * Upload the static assets to Amazon S3.
 */
gulp.task('deploy:assets', ['build'], () =>
    gulp.src(['dist/**/*', '!dist/**/*.html']).pipe(s3({
        Bucket: serverlessState.custom.bucketName,
        ACL: 'public-read',
        CacheControl: `max-age=${staticAssetsCacheDuration}`,
        keyTransform: (filename) => `static/${filename}`,
    }))
);

/**
 * Upload the HTML files to Amazon S3.
 */
gulp.task('deploy:html', ['deploy:assets'], () =>
    gulp.src(['dist/**/*.html']).pipe(s3({
        Bucket: serverlessState.custom.bucketName,
        ACL: 'public-read',
        CacheControl: `max-age=${staticHtmlCacheDuration}`,
        keyTransform: (filename) => `static/${filename}`,
    }))
);

/**
 * Deploy the static website to Amazon S3.
 */
gulp.task('deploy', ['deploy:html']);

// By default run the webpack-dev-server
gulp.task('default', ['serve']);
