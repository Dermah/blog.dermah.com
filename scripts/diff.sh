#!/bin/bash
set -eo pipefail

if [ "$1" != "--show-only" ]; then

  AWS_REGION=us-east-1

  # Get deployment bucket name from CloudFormation
  BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name blog-dermah-com --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].{V:OutputValue}[0].V' --output text)

  # Dump all files in bucket to disk
  # rm -rf ./tmp/s3
  aws s3 sync s3://$BUCKET_NAME ./tmp/s3

fi

# Diff the two sets of files
# * S3 differences are red
# * Local differences are green
git diff --no-index tmp/s3 dist/ || true