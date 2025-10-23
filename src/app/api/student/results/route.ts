import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import Attempt from "@/models/Attempt";
import Exam from "@/models/Exam";
import AttemptAnswer from "@/models/AttemptAnswer";
import Question from "@/models/Question";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Verify token and get user
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // Get student
    const user = await User.findOne({ nationalId: payload.nationalId });
    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 },
      );
    }

    const studentProfile = await StudentProfile.findOne({ userId: user._id });
    if (!studentProfile) {
      return NextResponse.json(
        { error: "الملف الشخصي للطالب غير موجود" },
        { status: 404 },
      );
    }

    // Get all completed attempts for this student
    const attempts = await Attempt.find({
      studentId: user._id,
      isCompleted: true,
    })
      .populate("examId")
      .sort({ submittedAt: -1 });

    // Format results with approval status
    const results = await Promise.all(
      attempts.map(async (attempt: any) => {
        // Check if all questions are graded
        const answers = await AttemptAnswer.find({
          attemptId: attempt._id,
        }).populate("questionId");

        let isPending = false;
        let pendingCount = 0;

        for (const answer of answers) {
          const question = answer.questionId as any;

          // Check if question needs manual grading
          if (
            question &&
            (question.type === "Essay" ||
              question.type === "Oral Arabic" ||
              question.type === "Oral International")
          ) {
            // If manual_score is null or undefined, it's pending
            if (
              answer.manual_score === null ||
              answer.manual_score === undefined
            ) {
              isPending = true;
              pendingCount++;
            }
          }
        }

        return {
          exam_name: attempt.examId?.name || "اختبار غير معروف",
          total_score: attempt.score || 0,
          max_score: attempt.totalScore || 0,
          percent: attempt.percentage || 0,
          submitted_at: attempt.submittedAt,
          is_approved: !isPending,
          pending_count: pendingCount,
          status: isPending ? "قيد المراجعة" : "معتمدة",
        };
      }),
    );

    return NextResponse.json({
      name: user.full_name,
      results,
    });
  } catch (error: any) {
    console.error("Error fetching student results:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
