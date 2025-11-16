import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lecture from "@/models/Lecture";

/**
 * GET /api/lectures - Fetch lectures for the authenticated user
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    await dbConnect();

  // Fetch lectures and populate course information
  const lectures = await Lecture.find({ userId })
    .populate("courseId", "title icon")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  console.log(`Found ${lectures.length} lectures for user ${userId}`);
  return NextResponse.json({ lectures });
  } catch (error) {
    console.error("Error fetching lectures:", error);
    return NextResponse.json(
      { error: "Failed to fetch lectures" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lectures - Create a new lecture
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, title, audioUrl, transcription, content } = body;

    // Validate required fields
    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "title is required and cannot be empty" },
        { status: 400 }
      );
    }

    await dbConnect();

    const lectureTitle = title.trim();
    console.log("Creating lecture with validated data:", { 
      userId, 
      courseId, 
      title: lectureTitle, 
      audioUrl: audioUrl || "", 
      transcriptionLength: transcription?.length || 0,
      contentLength: content?.length || 0,
      status: "transcribed" 
    });

    // Create the lecture with all content fields
    // For manual notes: content = user's manual content, transcription = empty
    // For audio transcripts: content = will be filled with AI summary, transcription = raw transcription
    const lecture = await Lecture.create({
      userId,
      courseId,
      title: lectureTitle, // This is the lesson title from the form
      audioUrl: audioUrl || "",
      status: "transcribed",
      content: content || transcription || "", // For manual notes, this is the content. For audio, this will be replaced with summary
      transcription: transcription || "", // Store raw transcription separately
    });

    console.log("Lecture created:", { 
      lectureId: lecture._id, 
      lectureTitle: lecture.title, 
      courseId: lecture.courseId,
      contentLength: lecture.content?.length || 0,
      transcriptionLength: lecture.transcription?.length || 0
    });

    // Populate course information for response
    const populatedLecture = await Lecture.findById(lecture._id)
      .populate("courseId", "title icon")
      .lean();

    return NextResponse.json({ 
      lecture: populatedLecture
    });
  } catch (error: any) {
    console.error("Error creating lecture:", error);
    return NextResponse.json(
      { error: "Failed to create lecture", details: error.message },
      { status: 500 }
    );
  }
}
