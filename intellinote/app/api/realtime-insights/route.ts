import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { TranscriptionProcessor } from "@/lib/TranscriptionProcessor";

/**
 * POST /api/realtime-insights
 * 
 * Generates real-time insights (key points, definitions, recap) from lecture chunks
 * Uses context from previous chunks to avoid repetition
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read environment variables inside handler for serverless compatibility
    const LLM_API_KEY = process.env.LLM_API_KEY;
    const LLM_ENDPOINT = process.env.LLM_ENDPOINT;

    if (!LLM_API_KEY || !LLM_ENDPOINT) {
      return NextResponse.json(
        { error: "LLM API key or endpoint not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { context, currentChunk, previousPoints } = body;

    if (!currentChunk) {
      return NextResponse.json(
        { error: "Current chunk is required" },
        { status: 400 }
      );
    }

    // Use ES6 class to process current chunk
    const processor = new TranscriptionProcessor(currentChunk);
    const cleanedChunk = processor.clean();

    console.log("Generating real-time insights:", {
      contextLength: context?.length || 0,
      currentChunkLength: currentChunk.length,
      previousPointsCount: previousPoints?.length || 0,
    });

    // Build the prompt using the exact format specified
    const prompt = `The student is currently in a live lecture.

Here is some recent context from a few minutes before (may be empty):

[CONTEXT START]

${context || ""}

[CONTEXT END]

Here is the latest part of the lecture that just happened:

[CURRENT CHUNK START]

${cleanedChunk}

[CURRENT CHUNK END]

Here are the last key points we already showed the student, so please avoid repeating them:

[ALREADY SHOWN]

${previousPoints?.join("\n") || "None"}

[END ALREADY SHOWN]

Based on ONLY the CURRENT CHUNK (and using CONTEXT only to understand it better), please return:

1. 3–5 short bullet points of NEW key ideas or steps.

2. Any NEW definitions or formulas mentioned.

3. A one-sentence "If you zoned out, here's what you just missed" recap.

Format your response exactly as:

KEY POINTS:

- ...
- ...

DEFINITIONS / FORMULAS:

- ...

RECAP:

- ...`;

    // Call the LLM API
    const response = await fetch(LLM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai-gpt-oss-120b",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LLM API error:", response.status, errorText);
      return NextResponse.json(
        { error: `LLM API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("LLM response received");

    // Extract the content from the LLM response
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in LLM response");
    }

    // Parse the structured response
    const insights = parseInsightsResponse(content);

    return NextResponse.json(insights);

  } catch (error: any) {
    console.error("Error generating real-time insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Parse the LLM response into structured insights
 */
function parseInsightsResponse(content: string): {
  keyPoints: string[];
  definitions: string[];
  recap: string;
} {
  const insights = {
    keyPoints: [] as string[],
    definitions: [] as string[],
    recap: "",
  };

  // Extract KEY POINTS section
  const keyPointsMatch = content.match(/KEY POINTS:\s*\n((?:- .+\n?)+)/i);
  if (keyPointsMatch) {
    insights.keyPoints = keyPointsMatch[1]
      .split("\n")
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter((line) => line.length > 0);
  }

  // Extract DEFINITIONS / FORMULAS section
  const definitionsMatch = content.match(/DEFINITIONS\s*\/?\s*FORMULAS?:\s*\n((?:- .+\n?)+)/i);
  if (definitionsMatch) {
    insights.definitions = definitionsMatch[1]
      .split("\n")
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter((line) => line.length > 0);
  }

  // Extract RECAP section
  const recapMatch = content.match(/RECAP:\s*\n-?\s*([\s\S]+?)(?:\n\n|\n[A-Z]|$)/i);
  if (recapMatch) {
    insights.recap = recapMatch[1].trim();
  }

  // Fallback: if structured parsing fails, try to extract bullet points
  if (insights.keyPoints.length === 0) {
    const bulletPoints = content.match(/^[-•]\s*(.+)$/gm);
    if (bulletPoints) {
      insights.keyPoints = bulletPoints
        .slice(0, 5)
        .map((bp) => bp.replace(/^[-•]\s*/, "").trim());
    }
  }

  return insights;
}

