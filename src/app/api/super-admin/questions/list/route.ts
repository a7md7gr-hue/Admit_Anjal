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

    // Get questions WITHOUT populate first to ensure we get results
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    console.log(`📊 Found ${questions.length} questions in database`);

    if (questions.length === 0) {
      console.log("⚠️ No questions found! Query:", JSON.stringify(query));
      return NextResponse.json({ 
        questions: [],
        total: 0,
        filtered: 0,
        debug: { query, message: "No questions in database" }
      });
    }

    // Now populate names separately
    const questionList = [];
    for (const q of questions) {
      try {
        let subjectName = "-";
        let programName = "-";
        let gradeName = "-";
        let categoryName = "-";

        // Safely get related data
        if (q.subjectId) {
          const subject = await Subject.findById(q.subjectId).lean();
          subjectName = subject?.name || "-";
        }
        
        if (q.programId) {
          const program = await Program.findById(q.programId).lean();
          programName = program?.name || "-";
        }
        
        if (q.gradeId) {
          const grade = await Grade.findById(q.gradeId).lean();
          gradeName = grade?.name || "-";
        }

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
          subject: subjectName,
          program: programName,
          grade: gradeName,
          category: categoryName,
          points: q.points || 1,
          optionsCount,
          isApproved: q.isApproved,
          createdAt: q.createdAt,
        });
      } catch (err) {
        console.error(`❌ Error processing question ${q._id}:`, err);
        // Still add the question even if populate failed
        questionList.push({
          id: (q._id as any).toString(),
          questionText: q.questionText || "N/A",
          questionType: q.questionType || "unknown",
          subject: "-",
          program: "-",
          grade: "-",
          category: "-",
          points: q.points || 1,
          optionsCount: 0,
          isApproved: q.isApproved || false,
          createdAt: q.createdAt,
        });
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
