#!/bin/bash
set -eo pipefail

AWS_REGION=us-east-1

# Get deployment bucket name from CloudFormation
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name blog-dermah-com --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].{V:OutputValue}[0].V' --output text)

# Sync all files from dist/ to the bucket
aws s3 sync --acl public-read ./dist s3://$BUCKET_NAME $@