const { S3Client } = require('@aws-sdk/client-s3');

const s3Config = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

const s3Client = new S3Client(s3Config);

const bucketName = process.env.AWS_BUCKET_NAME;

module.exports = {
    s3Client,
    bucketName
};
