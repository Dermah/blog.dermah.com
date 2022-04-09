#!/bin/sh

echo Authenticated as $(aws sts get-caller-identity --query Arn --output text)
echo Starting server...

npx "github:Dermah/node-git-lfs#fix-batch-schema"