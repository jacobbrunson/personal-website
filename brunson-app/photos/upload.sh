#!/bin/bash

#################################################
# exiftool: brew install exiftool
# mogrify (ImageMagick): brew install imagemagick
# aws (aws-cli): pip3 install awscli
# jq: brew install jq
#################################################

echo "Verifying dependencies..."

if ! which exiftool > /dev/null; then
  echo "exiftool not found. Try: brew install exiftool"
  exit 1
fi

if ! which mogrify > /dev/null; then
  echo "mogrify not found. Try: brew install imagemagick"
  exit 1
fi

if ! which aws > /dev/null; then
  echo "aws not found. Try: pip3 install awscli"
  exit 1
fi

if ! which jq > /dev/null; then
  echo "jq not found. Try: brew install jq"
  exit 1
fi

echo "Dependencies verified."

echo "Verifying s3 connection..."
if aws s3 ls s3://jacob --endpoint=https://sfo3.digitaloceanspaces.com > /dev/null; then
  echo "s3 connection verified."
else
  echo "\nInvalid s3 connection (try running aws s3 ls s3://jacob --endpoint=https://sfo3.digitaloceanspaces.com)"
  exit 1
fi

################
# BEGIN UPLOAD #
################

echo "Beginning upload process..."

mkdir -p uploaded/original uploaded/thumbs

echo "Rename files"
for f in upload/*.jp*g
do
  name=$(basename "$f")
  mv -n "$f" "upload/$(exiftool -s3 -d "%Y-%m-%d-%H%M%S" -CreateDate -ImageWidth -ImageHeight "$f" | awk 'BEGIN{ RS = "" ; FS = "\n" }{name=$1"_"$2"x"$3; print name}')_$name"
done

echo "Create smaller images"
mogrify -path uploaded -strip -define jpeg:size=2048x2048 -resize 2048x2048 upload/*.jp*g
echo "Create thumbnails"
mogrify -path uploaded/thumbs -strip -define jpeg:size=512x512 -resize 512x512 -quality 90 upload/*.jp*g

echo "Upload"
aws s3 sync uploaded/ s3://jacob --exclude "*" --include "*.jp*g" --exclude "original/*" --acl=public-read --content-disposition "attachment" --endpoint=https://sfo3.digitaloceanspaces.com

echo "Restore original names and move to original archive"
ARRAY="["
for f in upload/*.jp*g
do
  name=$(basename "$f")
  original="${name#*_*_}"
  mv -n "$f" "uploaded/original/$original"
  ARRAY="${ARRAY}\"$name\","
done
ARRAY="${ARRAY%?}]"

echo "Output to photos.json"
jq --argjson ARRAY "$ARRAY" '. + $ARRAY' photos.json > photos.json.tmp && mv photos.json.tmp photos.json