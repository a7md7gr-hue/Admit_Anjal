import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { Attempt, AttemptAnswer, QuestionOption } from "@/models";

export async function POST(request: Request) {
  try {
    // Check authentication
    const authUser = await getAuthUser();
    if (!authUser || authUser.role.toUpperCase() !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { attempt_id } = body;

    if (!attempt_id) {
      return NextResponse.json(
        { error: "Attempt ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Get attempt
    const attempt = await Attempt.findById(attempt_id);
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Check if already submitted
    if (attempt.is_submitted) {
      return NextResponse.json(
        { error: "Attempt already submitted" },
        { status: 400 },
      );
    }

    // Get all attempt answers
    const attemptAnswers = await AttemptAnswer.find({
      attemptId: attempt._id,
    }).populate("questionId");

    // Auto-grade MCQ and True/False questions
    for (const aa of attemptAnswers) {
      const question = aa.questionId as any;

      if (
        (question.questionType === "mcq" ||
          question.questionType === "true_false") &&
        aa.selectedOptionId
      ) {
        // Get the selected option
        const option = await QuestionOption.findById(aa.selectedOptionId);

        if (option) {
          // If correct, give full points; otherwise 0
          aa.autoScore = option.isCorrect ? question.points || 1 : 0;
          await aa.save();
        }
      }
    }

    // Mark attempt as submitted
    attempt.is_submitted = true;
    attempt.submittedAt = new Date();
    await attempt.save();

    return NextResponse.json({
      ok: true,
      message: "Attempt submitted successfully",
    });
  } catch (error: any) {
    console.error("Error submitting attempt:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
