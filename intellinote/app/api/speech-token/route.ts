import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
      console.error("[speech-token] Unauthorized request - no userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read environment variables inside the handler for better serverless compatibility
    const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
    const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

    // Enhanced validation and logging
    if (!AZURE_SPEECH_KEY) {
      console.error("[speech-token] AZURE_SPEECH_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "Azure Speech Key not configured" },
        { status: 500 }
      );
    }

    if (!AZURE_SPEECH_REGION) {
      console.error("[speech-token] AZURE_SPEECH_REGION is not set in environment variables");
      return NextResponse.json(
        { error: "Azure Speech Region not configured" },
        { status: 500 }
      );
    }

    // Validate region format (should not have protocol or trailing slashes)
    const cleanRegion = AZURE_SPEECH_REGION.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    console.log(`[speech-token] Requesting token for region: ${cleanRegion}`);

    // Request a token from Azure Speech Service
    const tokenUrl = `https://${cleanRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
    
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[speech-token] Azure API error: Status ${response.status}`, errorText);
      console.error(`[speech-token] Token URL attempted: ${tokenUrl}`);
      return NextResponse.json(
        { 
          error: `Failed to get token from Azure: ${response.status}`,
          details: errorText,
          region: cleanRegion
        },
        { status: response.status }
      );
    }

    const token = await response.text();
    console.log(`[speech-token] Successfully obtained token for user ${userId}`);

    return NextResponse.json({
      token,
      region: cleanRegion,
    });
  } catch (error: any) {
    console.error("[speech-token] Unexpected error:", error);
    console.error("[speech-token] Error stack:", error.stack);
    return NextResponse.json(
      { 
        error: "Failed to generate speech token", 
        details: error.message,
        type: error.name
      },
      { status: 500 }
    );
  }
}

