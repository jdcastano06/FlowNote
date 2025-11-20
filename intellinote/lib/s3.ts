import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Initialize S3 client with environment variables
 * Done inside functions for serverless compatibility
 */
function getS3Client(): S3Client {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || "us-east-1";

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.");
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Generate a presigned URL for direct browser upload to S3
 * This allows users to upload directly to S3 without going through your server
 */
export async function getUploadUrl(
  fileName: string,
  fileType: string,
  userId: string
): Promise<{ uploadUrl: string; key: string }> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME environment variable is not configured");
  }

  const s3Client = getS3Client();

  // Generate unique key for the file
  const key = `lectures/${userId}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
  });

  // Generate presigned URL (valid for 5 minutes)
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return { uploadUrl, key };
}

/**
 * Get the public URL for a file stored in S3
 */
export function getFileUrl(key: string): string {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || "us-east-1";

  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME environment variable is not configured");
  }

  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

