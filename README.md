## Prerequisities

### Set up AWS credentials

You need to [set up AWS credentials for your development environment](https://serverless.com/framework/docs/providers/aws/guide/credentials/).

### Create a Hosted Zone

NOTE: You need to [create a Hosted Zone for Amazon Route53](http://docs.aws.amazon.com/AmazonS3/latest/dev/website-hosting-custom-domain-walkthrough.html#root-domain-walkthrough-switch-to-route53-as-dnsprovider) first for your custom domain first! Also, if you are using other domain name provider, such as GoDaddy, then you need to set up the DNS records for your domain.

## Setup

Edit the following attributes in the [`serverless.yml`](./serverless.yml) according to your custom domain:

- `service`: A distinct name of your app. Recommended to be in lower case and separate words with dashes.
- `custom.hostedZone`: This must be the apex domain matching the Hosted zone on your AWS Route53.

## Deployment

Deploy the development version:

    npm run deploy:dev

Deploy the production version:

    npm run deploy:prod
