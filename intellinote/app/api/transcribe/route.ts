import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
    const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;
    const AZURE_SPEECH_ENDPOINT = process.env.AZURE_SPEECH_ENDPOINT;

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const locale = formData.get("locale") as string || "en-US";

    if (!audioFile) {
      console.error("[transcribe] No audio file provided in request");
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    console.log("[transcribe] Received file:", audioFile.name, "Type:", audioFile.type, "Size:", audioFile.size, "bytes");
    if (!AZURE_SPEECH_KEY) {
      console.error("[transcribe] AZURE_SPEECH_KEY is not configured");
      return NextResponse.json(
        { error: "Azure Speech Key not configured" },
        { status: 500 }
      );
    }

    if (!AZURE_SPEECH_REGION) {
      console.error("[transcribe] AZURE_SPEECH_REGION is not configured");
      return NextResponse.json(
        { error: "Azure Speech Region not configured" },
        { status: 500 }
      );
    }

    if (!AZURE_SPEECH_ENDPOINT) {
      console.error("[transcribe] AZURE_SPEECH_ENDPOINT is not configured");
      return NextResponse.json(
        { error: "Azure Speech Endpoint not configured" },
        { status: 500 }
      );
    }

    console.log("[transcribe] Using endpoint:", AZURE_SPEECH_ENDPOINT);
    console.log("[transcribe] Starting transcription for file:", audioFile.name, "Size:", audioFile.size);

    console.log("[transcribe] Converting file to buffer...");
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    console.log("[transcribe] Buffer created, size:", audioBuffer.length, "bytes");

    const azureFormData = new FormData();
    
    const mimeType = audioFile.type || "audio/wav";
    console.log("[transcribe] Creating blob with MIME type:", mimeType);
    const blob = new Blob([audioBuffer], { type: mimeType });
    azureFormData.append('audio', blob, audioFile.name);
    
    const definition = {
      locales: [locale],
      profanityFilterMode: "Masked",
      channels: [0, 1]
    };
    console.log("[transcribe] Definition:", JSON.stringify(definition));
    azureFormData.append('definition', JSON.stringify(definition));

    console.log("[transcribe] Sending request to Azure...");
    const startTime = Date.now();
    
    const response = await fetch(AZURE_SPEECH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
      },
      body: azureFormData,
    });

    const requestDuration = Date.now() - startTime;
    console.log(`[transcribe] Azure response received in ${requestDuration}ms, status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[transcribe] Azure API error:", response.status, errorText);
      console.error("[transcribe] Endpoint used:", AZURE_SPEECH_ENDPOINT);
      return NextResponse.json(
        { 
          error: `Azure transcription failed: ${response.status}`, 
          details: errorText,
          endpoint: AZURE_SPEECH_ENDPOINT.replace(AZURE_SPEECH_KEY, '***')
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("[transcribe] Transcription successful, result:", JSON.stringify(result).substring(0, 200));

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
    console.error("[transcribe] Error during transcription:", error);
    console.error("[transcribe] Error name:", error.name);
    console.error("[transcribe] Error message:", error.message);
    console.error("[transcribe] Error stack:", error.stack);
    
    return NextResponse.json(
      { 
        error: "Failed to transcribe audio", 
        details: error.message,
        errorType: error.name,
        errorCode: error.code
      },
      { status: 500 }
    );
  }
}
