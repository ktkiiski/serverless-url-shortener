'use strict';

// Lambda URL shortener function, called via API Gateway
// Creates an Amazon S3 object with random name and adds metadata for http redirect

const AWS = require('aws-sdk');
const url = require('url');


// configuration to be customized

const domain = process.env['DOMAIN'];
const s3Bucket = process.env['S3_BUCKET'];
const s3Region = process.env['S3_REGION'];
const s3Prefix = 'u/';

function shortId() {
    return 'xxxxxxx'.replace(/x/g, (c) => {
        return (Math.random() * 36 | 0).toString(36);
    });
}

exports.shortenUrl = (event, context, callback) => {

    function respond(statusCode, responseData) {
        const body = JSON.stringify(responseData);
        const headers = {'Content-Type': 'application/json'};
        callback(null, {statusCode, body, headers});
    }

    const headers = event.headers;
    let {longUrl, key} = JSON.parse(event.body);
    if (key) {
        // Remove all non-word characters
        key = key.replace(/[^a-z0-9_\.\-]/ig, '');
    } else {
        key = shortId();
    }
    // check if url is valid
    const urlCheck = url.parse(longUrl);
    if (!((urlCheck) && (urlCheck.host))) {
        return respond(400, {detail: "Invalid URL format"});
    }
    const s3 = new AWS.S3({ region: s3Region });

    s3.putObject(
        {
            Bucket: s3Bucket,
            Key: `${s3Prefix}${key}`,
            Body: "",
            WebsiteRedirectLocation: longUrl,
            ContentType: "text/plain",
        },
        (err, data) => {
            if (err) {
                respond(400, {detail: err.message});
            }
            else {
                const shortUrl = `http://${domain}/${key}`;
                console.log(`Successfully shortened ${longUrl} to ${shortUrl}`);
                respond(200, {longUrl: longUrl, shortUrl: shortUrl});
            }
        }
    );
};
