import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { AttemptAnswer } from "@/models";

export async function POST(request: Request) {
  try {
    // Check authentication
    const authUser = await getAuthUser();
    if (!authUser || authUser.role.toUpperCase() !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { attempt_id, question_id, selected_option_id, free_text } = body;

    if (!attempt_id || !question_id) {
      return NextResponse.json(
        { error: "Attempt ID and Question ID are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Find and update attempt answer
    const attemptAnswer = await AttemptAnswer.findOne({
      attemptId: attempt_id,
      questionId: question_id,
    });

    if (!attemptAnswer) {
      return NextResponse.json(
        { error: "Attempt answer not found" },
        { status: 404 },
      );
    }

    // Update the answer
    if (selected_option_id) {
      attemptAnswer.selectedOptionId = selected_option_id;
    }

    if (free_text !== undefined) {
      attemptAnswer.freeText = free_text;
    }

    attemptAnswer.answeredAt = new Date();
    await attemptAnswer.save();

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
