# Uploading photos

1. Put full-size photos in `upload` directory
2. `sh upload.sh`
3. Smaller "full-size" images and thumbnails are uploaded to S3
4. Original photos are stored in the `uploaded` directory

**Note:** Currently only jpeg files have been tested / are supported

# Troubleshooting

## Invalid AWS credentials

Possible error: `An error occurred (InvalidAccessKeyId) when calling the ListObjectsV2 operation:`

Make sure you have the aws cli installed. Then configure the credentials by running `aws configure`.

If you need credentials and you're using Digital Ocean Spaces, you can go to Digital Ocean API settings and get a Spaces access key.

If in doubt, specify us-east-1 as the region. (Digital ocean determines region based on endpoint)
