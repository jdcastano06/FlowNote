import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

/**
 * GET /api/speech-token
 * 
 * Generates an Azure Speech Service token for client-side use
 * This endpoint securely provides a token without exposing the API key to the client
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
      return NextResponse.json(
        { error: "Azure Speech configuration not found" },
        { status: 500 }
      );
    }

    // Request a token from Azure Speech Service
    const tokenUrl = `https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
    
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure token error:", response.status, errorText);
      return NextResponse.json(
        { error: `Failed to get token: ${response.status}` },
        { status: response.status }
      );
    }

    const token = await response.text();

    return NextResponse.json({
      token,
      region: AZURE_SPEECH_REGION,
    });
  } catch (error: any) {
    console.error("Error generating speech token:", error);
    return NextResponse.json(
      { error: "Failed to generate speech token", details: error.message },
      { status: 500 }
    );
  }
}

