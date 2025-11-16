import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const LLM_API_KEY = "sk-do-yML_G46v1_1B_WSO0JS0swV8TzS0v7XbahiQlKAGz73CpVBwRM9dOzG0dP";
const LLM_ENDPOINT = "https://inference.do-ai.run/v1/chat/completions";

/**
 * POST /api/generate-summary
 * 
 * Generates a summary and key points from a transcription using LLM
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { transcription, courseTitle, lessonTitle } = body;

    if (!transcription) {
      return NextResponse.json(
        { error: "Transcription text is required" },
        { status: 400 }
      );
    }

    console.log("Generating summary for transcription:", {
      transcriptionLength: transcription.length,
      courseTitle: courseTitle || "Not provided",
      lessonTitle: lessonTitle || "Not provided"
    });

    // Create prompt for the LLM with course/lesson context
    const contextInfo = courseTitle || lessonTitle 
      ? `\n\nContext:\nCourse: ${courseTitle || "Not specified"}\nLesson: ${lessonTitle || "Not specified"}`
      : "";

    const prompt = `You are an AI assistant that helps students create clear, concise study notes from lecture transcriptions.

Please analyze the following lecture transcription and provide:
1. A comprehensive summary (2-3 paragraphs)
2. A list of 5-7 key points or takeaways

${contextInfo ? `The lecture is from the course "${courseTitle || "Unknown"}" and the lesson is titled "${lessonTitle || "Unknown"}". Use this context to make the summary more relevant and focused.` : ""}

Format your response as JSON with the following structure:
{
  "summary": "Your comprehensive summary here...",
  "keyPoints": [
    "First key point",
    "Second key point",
    ...
  ]
}

Transcription:
${transcription}

Provide only the JSON response, no additional text.`;

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
        max_tokens: 1000,
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

    // Parse the JSON response from the LLM
    let summaryData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summaryData = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, create a structured response from the text
        summaryData = {
          summary: content,
          keyPoints: [],
        };
      }
    } catch (parseError) {
      console.error("Error parsing LLM JSON:", parseError);
      // Fallback: use the content as summary
      summaryData = {
        summary: content,
        keyPoints: [],
      };
    }

    // Ensure keyPoints is an array
    if (!Array.isArray(summaryData.keyPoints)) {
      summaryData.keyPoints = [];
    }

    return NextResponse.json({
      summary: summaryData.summary || content,
      keyPoints: summaryData.keyPoints,
    });

  } catch (error: any) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary", details: error.message },
      { status: 500 }
    );
  }
}

