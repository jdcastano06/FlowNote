import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { TranscriptionProcessor } from "@/lib/TranscriptionProcessor";
import { NoteFormatter } from "@/lib/NoteFormatter";

/**
 * POST /api/generate-summary
 * 
 * Generates comprehensive, structured lecture notes with sections, formulas, and detailed explanations
 * from a transcription using LLM. Returns HTML-formatted notes suitable for studying.
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

    // Use ES6 class to process transcription
    const processor = new TranscriptionProcessor(transcription);
    const cleanedTranscription = processor.clean();
    const wordCount = processor.getWordCount();
    console.log(`Processed transcription: ${wordCount} words, ${processor.getCharacterCount()} characters`);

    // Create prompt for the LLM with course/lesson context
    const contextInfo = courseTitle || lessonTitle 
      ? `\n\nContext:\nCourse: ${courseTitle || "Not specified"}\nLesson: ${lessonTitle || "Not specified"}`
      : "";

    const prompt = `You are an expert note-taking assistant that transforms lecture transcriptions into comprehensive, well-structured study notes.

${contextInfo ? `The lecture is from the course "${courseTitle || "Unknown"}" and the lesson is titled "${lessonTitle || "Unknown"}". Use this context to organize the notes appropriately.` : ""}

Analyze the following lecture transcription and create detailed, structured notes in HTML format. The notes should be comprehensive and study-ready, similar to what a diligent student would take.

**Requirements:**
1. Organize content into clear sections with HTML headings (h2, h3)
2. Include detailed explanations, not just summaries
3. Highlight all formulas, equations, and definitions prominently
4. Include key concepts with clear explanations
5. Add examples if mentioned in the lecture
6. Use proper HTML formatting: headings, paragraphs, lists, code blocks for formulas
7. Make it easy to study from - include context and connections between concepts

**Format Guidelines:**
- Use <h2> for main topics/sections
- Use <h3> for subtopics
- Use <p> for explanations
- Use <ul> or <ol> for lists
- Use <strong> or <em> for emphasis
- Use <code> or <pre> for formulas and code
- Use <blockquote> for important definitions or quotes
- Create clear visual hierarchy

**Structure your notes as:**
- Introduction/Overview (if applicable)
- Main Topics (each as a section)
- Key Concepts (with detailed explanations)
- Formulas/Equations (clearly highlighted)
- Examples (if provided)
- Important Takeaways

**IMPORTANT: Respond ONLY with valid JSON. Do not include any reasoning or explanation outside the JSON.**

Format your response as JSON:
{
  "summary": "HTML-formatted comprehensive notes with proper structure, sections, formulas, and detailed explanations",
  "keyPoints": [
    "Key takeaway 1",
    "Key takeaway 2",
    ...
  ]
}

Transcription:
${cleanedTranscription}

Generate detailed, structured notes that a student can use for studying. Include all important information, formulas, definitions, and explanations. Use proper HTML formatting for readability. Respond with ONLY the JSON object, no additional text.`;

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
        max_tokens: 3000,
        temperature: 0.5,
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
    
    // Check for error in response
    if (result.error) {
      console.error("LLM API returned error:", result.error);
      return NextResponse.json(
        { error: "LLM API error", details: result.error.message || result.error },
        { status: 500 }
      );
    }

    console.log("LLM response received. Structure:", {
      hasChoices: !!result.choices,
      choicesLength: result.choices?.length,
      resultKeys: Object.keys(result),
      firstChoice: result.choices?.[0] ? Object.keys(result.choices[0]) : null
    });

    // Extract the content from the LLM response
    // Handle different response formats
    let content = null;
    
    if (result.choices && result.choices.length > 0) {
      // Standard OpenAI format: result.choices[0].message.content
      const choice = result.choices[0];
      if (choice.message) {
        // Some models use reasoning_content for thinking, content for final answer
        // If content is null but reasoning_content exists, try to extract JSON from reasoning_content
        if (choice.message.content) {
          content = choice.message.content;
        } else if (choice.message.reasoning_content) {
          // Model hit token limit - try to extract JSON from reasoning_content
          console.warn("Model hit token limit. Attempting to extract JSON from reasoning_content.");
          const reasoning = choice.message.reasoning_content;
          // Try to find JSON in the reasoning content
          const jsonMatch = reasoning.match(/\{[\s\S]*"summary"[\s\S]*\}/);
          if (jsonMatch) {
            content = jsonMatch[0];
          } else {
            // Fallback: use reasoning_content as content (might contain useful info)
            content = reasoning;
          }
        }
        
        // Warn if hit token limit
        if (choice.finish_reason === 'length') {
          console.warn("LLM response hit token limit. Consider increasing max_tokens or shortening transcription.");
        }
      } else if (choice.text) {
        content = choice.text;
      } else if (choice.content) {
        content = choice.content;
      } else if (typeof choice === 'string') {
        content = choice;
      }
    } else if (result.content) {
      // Alternative format
      content = result.content;
    } else if (result.text) {
      // Another alternative format
      content = result.text;
    } else if (result.message) {
      // Direct message format
      content = result.message;
    } else if (typeof result === 'string') {
      // Response is directly a string
      content = result;
    }
    
    if (!content) {
      console.error("LLM response structure (full):", JSON.stringify(result, null, 2));
      return NextResponse.json(
        { 
          error: "No content in LLM response", 
          details: "The LLM API returned a response but no content was found in the expected format.",
          responseStructure: Object.keys(result),
          debug: result
        },
        { status: 500 }
      );
    }

    // Parse the JSON response from the LLM
    let summaryData;
    try {
      // Try to extract JSON from the response
      // Look for JSON object pattern - match the most complete JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
        summaryData = JSON.parse(jsonMatch[0]);
        } catch (jsonError) {
          // If JSON parsing fails, try to find a better match
          // Sometimes the JSON might be incomplete or have extra text
          const betterMatch = content.match(/\{[\s\S]*"summary"[\s\S]*\}/);
          if (betterMatch) {
            summaryData = JSON.parse(betterMatch[0]);
          } else {
            throw jsonError;
          }
        }
      } else {
        // If no JSON found, check if content looks like HTML (might be direct HTML response)
        if (content.includes('<h2>') || content.includes('<h3>') || content.includes('<p>')) {
          // Content is already HTML formatted
        summaryData = {
          summary: content,
          keyPoints: [],
        };
        } else {
          // Create a structured response from the text
          summaryData = {
            summary: `<div class="prose"><p>${content.replace(/\n/g, '</p><p>')}</p></div>`,
            keyPoints: [],
          };
        }
      }
    } catch (parseError) {
      console.error("Error parsing LLM JSON:", parseError);
      // Fallback: use the content as summary, wrap in HTML if needed
      const htmlContent = content.includes('<') ? content : `<div class="prose"><p>${content}</p></div>`;
      summaryData = {
        summary: htmlContent,
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

