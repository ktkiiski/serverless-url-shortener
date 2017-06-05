/**
 * Configuration for all the HTML web pages
 * that will be generated.
 */
module.exports = {
    // The source folder
    sourceDir: 'src',
    // Web page configuration
    pages: [{
        title: 'URL shortener',
        file: 'admin.pug',
        scripts: ['admin.tsx'],
    }, {
        title: 'Page not found!',
        file: 'error.pug',
        scripts: [],
    }],
};
