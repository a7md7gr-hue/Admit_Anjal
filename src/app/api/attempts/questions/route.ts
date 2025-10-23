import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { Attempt, AttemptAnswer, Question, QuestionOption } from "@/models";

export async function GET(request: Request) {
  try {
    // Check authentication
    const authUser = await getAuthUser();
    if (!authUser || authUser.role.toUpperCase() !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const attempt_id = searchParams.get("attempt_id");

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

    // Get attempt answers with questions
    const attemptAnswers = await AttemptAnswer.find({
      attemptId: attempt._id,
    }).populate("questionId");

    if (attemptAnswers.length === 0) {
      return NextResponse.json(
        { error: "No questions found for this attempt" },
        { status: 404 },
      );
    }

    // Get question IDs
    const questionIds = attemptAnswers.map((aa) => aa.questionId);

    // Get options for all questions
    const options = await QuestionOption.find({
      questionId: { $in: questionIds },
    });

    // Group options by question
    const optionsByQuestion: Record<string, any[]> = {};
    options.forEach((opt) => {
      const qid = opt.questionId.toString();
      if (!optionsByQuestion[qid]) {
        optionsByQuestion[qid] = [];
      }
      optionsByQuestion[qid].push({
        id: opt._id.toString(),
        text: opt.optionText,
      });
    });

    // Build items array
    const items = attemptAnswers.map((aa) => {
      const question = aa.questionId as any;
      const qid = question._id.toString();

      return {
        question_id: qid,
        text: question.questionText,
        qtype: question.questionType,
        points: question.points || 1,
        selected_option_id: aa.selectedOptionId?.toString() || null,
        free_text: aa.freeText || "",
        options: optionsByQuestion[qid] || [],
      };
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
