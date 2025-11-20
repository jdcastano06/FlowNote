import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Course } from "@/models"; // Import from central models file

const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_ENDPOINT = process.env.LLM_ENDPOINT;

/**
 * POST /api/classify-course
 * 
 * Analyzes transcription to suggest course and lesson title
 */
export async function POST(request: Request) {
  try {
    if (!LLM_API_KEY || !LLM_ENDPOINT) {
      return NextResponse.json(
        { error: "LLM API key or endpoint not configured" },
        { status: 500 }
      );
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { transcription } = body;

    if (!transcription) {
      return NextResponse.json(
        { error: "Transcription text is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get user's existing courses
    const existingCourses = await Course.find({ userId }).select("title description").lean();
    const courseList = existingCourses.map(c => c.title).join(", ");

    // Create prompt for classification
    const prompt = `You are an AI assistant that helps students organize their lecture notes by analyzing transcriptions and suggesting appropriate course names and lesson titles.

Based on the following lecture transcription, suggest:
1. A course name (check if it matches existing courses: ${courseList || "none"})
2. A specific lesson title for this content

Existing courses: ${courseList || "None"}

Format your response as JSON:
{
  "suggestedCourse": "Course Name",
  "suggestedLessonTitle": "Specific Lesson Title",
  "isNewCourse": true/false,
  "reasoning": "Brief explanation of why you chose these names"
}

Transcription (first 500 characters):
${transcription.substring(0, 500)}

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
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error("LLM API error:", response.status);
      // Fallback classification
      return NextResponse.json({
        suggestedCourse: "General Course",
        suggestedLessonTitle: `Lecture ${new Date().toLocaleDateString()}`,
        isNewCourse: existingCourses.length === 0,
        courseId: existingCourses.length > 0 ? existingCourses[0]._id : undefined,
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in LLM response");
    }

    // Parse the JSON response
    let classificationData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        classificationData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing LLM JSON:", parseError);
      // Fallback classification
      return NextResponse.json({
        suggestedCourse: "General Course",
        suggestedLessonTitle: `Lecture ${new Date().toLocaleDateString()}`,
        isNewCourse: existingCourses.length === 0,
        courseId: existingCourses.length > 0 ? existingCourses[0]._id : undefined,
      });
    }

    // Check if suggested course matches existing course
    const matchingCourse = existingCourses.find(course => 
      course.title.toLowerCase().includes(classificationData.suggestedCourse.toLowerCase()) ||
      classificationData.suggestedCourse.toLowerCase().includes(course.title.toLowerCase())
    );

    return NextResponse.json({
      suggestedCourse: classificationData.suggestedCourse,
      suggestedLessonTitle: classificationData.suggestedLessonTitle,
      isNewCourse: !matchingCourse,
      courseId: matchingCourse?._id,
      reasoning: classificationData.reasoning,
    });

  } catch (error: any) {
    console.error("Error classifying course:", error);
    
    // Return fallback response
    return NextResponse.json({
      suggestedCourse: "General Course",
      suggestedLessonTitle: `Lecture ${new Date().toLocaleDateString()}`,
      isNewCourse: true,
    });
  }
}
