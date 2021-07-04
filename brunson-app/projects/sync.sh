#!/bin/bash

# aws (aws-cli): pip3 install awscli

aws s3 sync media/ s3://jacob/projects/media --exclude ".*" --acl=public-read --content-disposition "attachment" --endpoint=https://sfo3.digitaloceanspaces.com