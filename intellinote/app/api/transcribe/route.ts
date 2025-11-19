import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;
const AZURE_SPEECH_ENDPOINT = process.env.AZURE_SPEECH_ENDPOINT;

/**
 * POST /api/transcribe
 * 
 * Transcribes an audio file using Azure Speech-to-Text Fast Transcription API
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const locale = formData.get("locale") as string || "en-US";

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_ENDPOINT) {
      return NextResponse.json(
        { error: "Azure Speech configuration not found" },
        { status: 500 }
      );
    }

    console.log("Starting transcription for file:", audioFile.name, "Size:", audioFile.size);

    // Convert file to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Prepare multipart form data for Azure API
    const azureFormData = new FormData();
    
    // Add audio file
    const blob = new Blob([audioBuffer], { type: audioFile.type });
    azureFormData.append('audio', blob, audioFile.name);
    
    // Add definition
    const definition = {
      locales: [locale],
      profanityFilterMode: "Masked",
      channels: [0, 1]
    };
    azureFormData.append('definition', JSON.stringify(definition));

    // Call Azure Speech-to-Text API
    const response = await fetch(AZURE_SPEECH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
      },
      body: azureFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Azure API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("Transcription successful");

    // Extract the transcription text from the response
    // Azure Fast Transcription returns combinedPhrases with text
    let transcriptionText = "";
    let duration = 0;
    let phrases: any[] = [];

    if (result.combinedPhrases && result.combinedPhrases.length > 0) {
      transcriptionText = result.combinedPhrases[0].text || "";
    }

    if (result.phrases && result.phrases.length > 0) {
      phrases = result.phrases.map((phrase: any) => ({
        channel: phrase.channel,
        text: phrase.text,
        offsetMilliseconds: phrase.offsetMilliseconds,
        durationMilliseconds: phrase.durationMilliseconds,
      }));
      
      // Calculate total duration
      const lastPhrase = result.phrases[result.phrases.length - 1];
      if (lastPhrase) {
        duration = (lastPhrase.offsetMilliseconds + lastPhrase.durationMilliseconds) / 1000;
      }
    }

    return NextResponse.json({
      success: true,
      transcription: transcriptionText,
      duration: duration,
      phrases: phrases,
      locale: result.locale || locale,
    });

  } catch (error: any) {
    console.error("Error during transcription:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio", details: error.message },
      { status: 500 }
    );
  }
}
