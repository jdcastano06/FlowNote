import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Client(): S3Client {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || "us-east-1";

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials not configured");
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export async function getUploadUrl(
  fileName: string,
  fileType: string,
  userId: string
): Promise<{ uploadUrl: string; key: string }> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("S3 bucket name not configured");
  }

  const s3Client = getS3Client();
  const key = `lectures/${userId}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return { uploadUrl, key };
}

export function getFileUrl(key: string): string {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || "us-east-1";

  if (!bucketName) {
    throw new Error("S3 bucket name not configured");
  }

  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

