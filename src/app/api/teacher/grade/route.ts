import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { AttemptAnswer, Attempt, Question } from "@/models";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser || authUser.role.toUpperCase() !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { attempt_answer_id, manual_score, comment } = body;

    if (!attempt_answer_id || manual_score == null) {
      return NextResponse.json(
        { error: "Attempt answer ID and manual score are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Find and update attempt answer
    const attemptAnswer =
      await AttemptAnswer.findById(attempt_answer_id).populate("questionId");

    if (!attemptAnswer) {
      return NextResponse.json(
        { error: "Attempt answer not found" },
        { status: 404 },
      );
    }

    const question = attemptAnswer.questionId as any;

    // Validate oral exam score (0-5)
    if (question?.questionType === "oral") {
      if (manual_score < 0 || manual_score > 5) {
        return NextResponse.json(
          { error: "الدرجة للاختبار الشفوي يجب أن تكون من 0 إلى 5" },
          { status: 400 },
        );
      }
      attemptAnswer.oralGradedAt = new Date();
    }

    // Update manual score and comment
    attemptAnswer.manual_score = manual_score;
    attemptAnswer.comment = comment || "";
    await attemptAnswer.save();

    // Check if all essay/oral questions for this attempt are now graded
    const attemptId = attemptAnswer.attemptId;
    const pendingCount = await AttemptAnswer.countDocuments({
      attemptId,
      manual_score: null,
    });

    // If no more pending items, you could update attempt status here if needed
    if (pendingCount === 0) {
      await Attempt.findByIdAndUpdate(attemptId, {
        status: "graded",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error grading answer:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
