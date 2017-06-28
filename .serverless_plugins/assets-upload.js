// tslint:disable:no-console
const BbPromise = require('bluebird');
const del = require('del');
const gulp = require('gulp');
const s3Upload = require('gulp-s3-upload');
const webpack = require('webpack');
const createWebpackConfig = require('../webpack.config.js');

// Static assets are cached for a year
const staticAssetsCacheDuration = 31556926;
// HTML pages are cached for an hour
const staticHtmlCacheDuration = 3600;

class AssetsUploadPlugin {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;
        this.hooks = {
            'before:package:cleanup': this.beforeCleanup.bind(this),
            'before:package:createDeploymentArtifacts': this.beforePackage.bind(this),
            'after:deploy:deploy': this.afterDeploy.bind(this),
        };
        this.s3 = s3Upload(
            { signatureVersion: 'v4' },
            { region: this.getRegion() }
        );
    }

    getRegion() {
        return this.serverless.service.provider.region;
    }

    getAssetBucketName() {
        return this.serverless.service.custom.bucketName;
    }

    beforeCleanup() {
        return BbPromise.resolve(del(['dist/**/*']))
            .tap(() => console.log('Cleaned the contents of the \'dist\' directory'))
        ;
    }

    beforePackage() {
        const webpackConfig = createWebpackConfig(process.env);
        const webpackRunner = webpack(webpackConfig);
        return BbPromise.fromCallback(cb => webpackRunner.run(cb))
            .tap(stats => console.log(stats.toString({ colors: true })))
        ;
    }

    afterDeploy() {
        return this.uploadFiles(['dist/**/*', '!dist/**/*.html'], {
            Bucket: this.getAssetBucketName(),
            ACL: 'public-read',
            CacheControl: `max-age=${staticAssetsCacheDuration}`,
            keyTransform: (filename) => `static/${filename}`,
        })
        .tap(() => console.log('Successfully uploaded static assets'))
        .then(() => this.uploadFiles(['dist/**/*.html'], {
            Bucket: this.getAssetBucketName(),
            ACL: 'public-read',
            CacheControl: `max-age=${staticHtmlCacheDuration}`,
            keyTransform: (filename) => `static/${filename}`,
        }))
        .tap(() => console.log('Successfully uploaded HTML files'))
        ;
    }

    uploadFiles(src, s3Options) {
        return new BbPromise((resolve, reject) => {
            const stream = gulp.src(['dist/**/*', '!dist/**/*.html']).pipe(this.s3(s3Options));
            stream.on('end', resolve);
            stream.on('error', reject);
        });
    }
}

module.exports = AssetsUploadPlugin;
