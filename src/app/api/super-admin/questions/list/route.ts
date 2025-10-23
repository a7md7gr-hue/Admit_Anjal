import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import {
  Question,
  QuestionOption,
  Subject,
  Program,
  Grade,
  QuestionCategory,
} from "@/models";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER"].includes(authUser.role.toUpperCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const subjectFilter = searchParams.get("subject");
    const typeFilter = searchParams.get("type");

    let query: any = {};

    if (subjectFilter) {
      query.subjectId = subjectFilter;
    }

    if (typeFilter) {
      query.questionType = typeFilter;
    }

    // Get questions with populated fields
    const questions = await Question.find(query)
      .populate("subjectId")
      .populate("programId")
      .populate("gradeId")
      .populate("categoryId")
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 questions

    const questionList = [];
    for (const q of questions) {
      const subject = q.subjectId as any;
      const program = q.programId as any;
      const grade = q.gradeId as any;
      const category = q.categoryId as any;

      // Get options count if MCQ
      let optionsCount = 0;
      if (q.questionType === "mcq" || q.questionType === "true_false") {
        optionsCount = await QuestionOption.countDocuments({
          questionId: q._id,
        });
      }

      questionList.push({
        id: q._id.toString(),
        questionText: q.questionText,
        questionType: q.questionType,
        subject: subject?.name || "-",
        program: program?.name || "-",
        grade: grade?.name || "-",
        category: category?.name || "-",
        points: q.points || 1,
        optionsCount,
        isApproved: q.isApproved,
        createdAt: q.createdAt,
      });
    }

    return NextResponse.json({ questions: questionList });
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
