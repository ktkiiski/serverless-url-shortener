/**
 * Configuration for all the HTML web pages
 * that will be generated.
 */
module.exports = {
    // Amazon S3 bucket to which the static website is deployed
    bucket: 'broilerplate',
    // The source folder
    sourceDir: 'src',
    // Web page configuration
    pages: [{
        title: 'Broilerplate',
        file: 'index.pug',
        scripts: ['index.ts'],
    }, {
        title: 'Page not found!',
        file: 'error.pug',
        scripts: ['index.ts'],
    }],
};
