import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import {
  User,
  Exam,
  ExamBlueprint,
  Question,
  Attempt,
  AttemptAnswer,
} from "@/models";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check role (case insensitive)
    const userRole = authUser.role.toUpperCase();
    if (userRole !== "STUDENT") {
      console.log("❌ Role mismatch in start:", {
        expected: "STUDENT",
        actual: userRole,
        userId: authUser.userId,
      });
      return NextResponse.json(
        { error: `Unauthorized - Role: ${authUser.role}` },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { exam_id } = body;

    if (!exam_id) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Get student
    const student = await User.findById(authUser.userId).populate("roleId");
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get exam
    const exam = await Exam.findById(exam_id).populate("subjectId");
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Check if student already has an attempt for this exam
    const existingAttempt = await Attempt.findOne({
      studentId: student._id,
      examId: exam._id,
    });

    if (existingAttempt) {
      // Return existing attempt
      return NextResponse.json({
        ok: true,
        attempt_id: existingAttempt._id.toString(),
        message: "Returning existing attempt",
      });
    }

    // Create new attempt
    const attempt = await Attempt.create({
      studentId: student._id,
      examId: exam._id,
      startedAt: new Date(),
      is_submitted: false,
    });

    // Get exam blueprint to determine which questions to include
    const blueprint = await ExamBlueprint.findOne({ examId: exam._id });

    let selectedQuestions;
    if (blueprint) {
      // Use blueprint rules (future enhancement)
      // For now, just get random questions
      selectedQuestions = await Question.find({
        subjectId: exam.subjectId,
        isApproved: true,
      }).limit(10);
    } else {
      // Get random questions for this exam's subject
      selectedQuestions = await Question.find({
        subjectId: exam.subjectId,
        isApproved: true,
      }).limit(10);
    }

    if (selectedQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions available for this exam" },
        { status: 404 },
      );
    }

    // Create attempt answers
    const attemptAnswers = selectedQuestions.map((question) => ({
      attemptId: attempt._id,
      questionId: question._id,
    }));

    await AttemptAnswer.insertMany(attemptAnswers);

    return NextResponse.json({
      ok: true,
      attempt_id: attempt._id.toString(),
      question_ids: selectedQuestions.map((q) => q._id.toString()),
    });
  } catch (error: any) {
    console.error("Error starting attempt:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
