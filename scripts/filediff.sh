#!/bin/bash
set -eo pipefail

AWS_REGION=us-east-1

# Get deployment bucket name from CloudFormation
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name blog-dermah-com --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].{V:OutputValue}[0].V' --output text)

# List all files and filesizes in bucket to file
aws s3 ls --recursive s3://$BUCKET_NAME | tr -s ' ' | awk '{print $4 " " $3}' | sort > ./tmp/s3.list

# List all files and filesized in `dist/` to file
(find dist -type f -ls) | tr -s ' ' | awk '{system("ls -l " $11)}' | awk '{print $9 " " $5}' | sed 's&dist/&&' | sort > ./tmp/dist.list

# Word diff the two lists
# * S3 differences are red
# * Local differences are green
git diff --word-diff --no-index tmp/s3.list tmp/dist.list || true