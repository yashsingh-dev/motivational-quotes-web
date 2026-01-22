const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
    region: env.process.AWS_REGION,
    credentials: {
        accessKeyId: env.process.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.process.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = env.process.AWS_BUCKET_NAME;

const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer,
            ContentType: mimeType,
        };
        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        // Construct public URL
        return `https://${BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${fileName}`;
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw error;
    }
};

const deleteFromS3 = async (fileUrl) => {
    try {
        // Extract Key from URL
        const urlParts = fileUrl.split('/');
        const key = urlParts[urlParts.length - 1];

        const params = {
            Bucket: BUCKET_NAME,
            Key: key
        };
        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error("S3 Delete Error:", error);
        throw error;
    }
};

/**
 * Generates a pre-signed URL for uploading a file to S3 directly from the client.
 * @param {string} fileName - The name of the file to be uploaded.
 * @param {string} mimeType - The MIME type of the file.
 * @returns {Promise<{uploadUrl: string, publicUrl: string}>} - The pre-signed URL and the final public URL.
 */
const generatePresignedUrl = async (fileName, mimeType) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        ContentType: mimeType,
    };

    // Create the command
    const command = new PutObjectCommand(params);

    // Generate the pre-signed URL (valid for 15 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    // Construct the public URL
    const publicUrl = `https://${BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${fileName}`;

    return { uploadUrl, publicUrl };
};

module.exports = { uploadToS3, deleteFromS3, generatePresignedUrl };
