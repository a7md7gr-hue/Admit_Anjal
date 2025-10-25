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
    const limitParam = searchParams.get("limit");

    let query: any = {};

    if (subjectFilter) {
      query.subjectId = subjectFilter;
    }

    if (typeFilter) {
      query.questionType = typeFilter;
    }

    // Parse limit parameter (default: 1000, max: 1000)
    const limit = limitParam ? Math.min(parseInt(limitParam), 1000) : 1000;

    // Get questions with populated fields
    const questions = await Question.find(query)
      .populate("subjectId")
      .populate("programId")
      .populate("gradeId")
      .populate("categoryId")
      .sort({ createdAt: -1 })
      .limit(limit);

    console.log(`📊 Found ${questions.length} questions in database`);

    const questionList = [];
    for (const q of questions) {
      try {
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
      } catch (err) {
        console.error(`❌ Error processing question ${q._id}:`, err);
        // Skip this question and continue
      }
    }

    console.log(`✅ Returning ${questionList.length} questions to client`);

    return NextResponse.json({ 
      questions: questionList,
      total: questions.length,
      filtered: questionList.length
    });
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
