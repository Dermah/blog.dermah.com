#!/bin/sh


AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id --profile dermah) \
AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key --profile dermah) \
npx node-git-lfs