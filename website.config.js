/**
 * Configuration for all the HTML web pages
 * that will be generated.
 */
module.exports = {
    // Amazon S3 bucket to which the static website is deployed
    bucket: "broilerplate",
    // Web page configuration
    pages: [{
        title: "Broilerplate",
        file: "src/index.pug",
    }, {
        title: "Page not found!",
        file: "src/error.pug",
    }],
};
