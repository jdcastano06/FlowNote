import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUploadUrl } from "@/lib/s3";

/**
 * POST /api/upload - Get presigned URL for file upload
 * 
 * This endpoint generates a secure URL that allows the client
 * to upload files directly to S3 without going through our server
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, fileType } = body;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType are required" },
        { status: 400 }
      );
    }

    // Validate file type (only allow audio files)
    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/m4a",
      "audio/mp4",
      "audio/x-m4a",
    ];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only audio files are allowed." },
        { status: 400 }
      );
    }

    // Generate presigned URL
    const { uploadUrl, key } = await getUploadUrl(fileName, fileType, userId);

    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

