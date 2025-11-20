import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lecture from "@/models/Lecture";
import Course from "@/models/Course"; // Import Course model for populate()

// PATCH /api/lectures/[id] - Update a lecture
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await dbConnect();

    // Find and update the lecture, ensuring it belongs to the user
    const lecture = await Lecture.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    console.log("Lecture updated successfully:", id, "with data:", body);
    
    // Populate course information for response
    const populatedLecture = await Lecture.findById(lecture._id)
      .populate("courseId", "title icon")
      .lean();

    return NextResponse.json({ lecture: populatedLecture });
  } catch (error: any) {
    console.error("Error updating lecture:", error);
    return NextResponse.json(
      { error: "Failed to update lecture", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/lectures/[id] - Delete a lecture
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const lecture = await Lecture.findOneAndDelete({ _id: id, userId });

    if (!lecture) {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Lecture deleted successfully" });
  } catch (error) {
    console.error("Error deleting lecture:", error);
    return NextResponse.json(
      { error: "Failed to delete lecture" },
      { status: 500 }
    );
  }
}

