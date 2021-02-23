#!/bin/bash
set -eo pipefail

AWS_REGION=us-east-1

# Get deployment bucket name from CloudFormation
CLOUDFRONT_DIST=$(aws cloudformation describe-stacks --stack-name blog-dermah-com --query 'Stacks[0].Outputs[?OutputKey==`DistributionID`].{V:OutputValue}[0].V' --output text)

# Create an Invalidation for the CloudFront DIstribution
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DIST --paths '/*' '/index.html' '/css/index.css'