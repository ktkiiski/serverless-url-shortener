# Serverless URL shortener

Quickly set up your private URL shortener for your custom domain!
The app is completely hosted on [Amazon Web Services](https://aws.amazon.com/).
It is implemented with a low-cost "serverless" architecture.

You can quickly deploy your own URL shortener with a single command! See the instructions below!

The implementation is based on [the solution described in a blog by Stephan Hadinger](https://aws.amazon.com/blogs/compute/build-a-serverless-private-url-shortener/).

The app is orchestrated with Amazon CloudFormation, composed by the [Serverless utility](https://serverless.com/). It utilizes the following web components:

- **Amazon CloudFormation**: controls the orchestration of all the other services
- **Amazon S3**: hosts the resources for redirection URLs
- **Amazon Lambda**: executes the code for API calls, managing the resources on S3
- **Amazon API Gateway**: forwards the API HTTP requests for Amazon Lambda for execution
- **Amazon CloudFront**: acts as a front end for the API gateway and S3 buckets
- **Amazon Certificate Manager**: provides the certificates for secure connections to your custom domain
- **Amazon Route 53**: DNS management for your custom domain

## Prerequisities

### Set up AWS credentials

You need to [set up AWS credentials for your development environment](https://serverless.com/framework/docs/providers/aws/guide/credentials/).

### Create a Hosted Zone

NOTE: You need to [create a Hosted Zone for Amazon Route53](http://docs.aws.amazon.com/AmazonS3/latest/dev/website-hosting-custom-domain-walkthrough.html#root-domain-walkthrough-switch-to-route53-as-dnsprovider) first for your custom domain first! Also, if you are using other domain name provider, such as GoDaddy, then you need to set up the DNS records for your domain.

## Setup

Edit the following attributes in the [`serverless.yml`](./serverless.yml) according to your custom domain:

- `service`: A distinct name of your app. Recommended to be in lower case and separate words with dashes.
- `custom.hostedZone`: This must be the apex domain matching the Hosted zone on your AWS Route53.

You also need to install the node packages to your local development environment:

    npm install

## Deployment

Deploy the development version:

    npm run deploy:dev

Deploy the production version:

    npm run deploy:prod

**IMPORTANT:** When deploying for the first time, you will receive email for confirming the certificate for the domain names!
The deployment continues only after you approve the certificate!
