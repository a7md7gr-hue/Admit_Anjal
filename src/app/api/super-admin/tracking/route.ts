import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { Exam, Attempt, AttemptAnswer } from "@/models";

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER"].includes(authUser.role.toUpperCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    // Get all exams with populated data
    const exams = await Exam.find({})
      .populate("subjectId", "name")
      .populate("gradeId", "name")
      .populate("programId", "name")
      .lean();

    const examStats = [];

    for (const exam of exams) {
      const subject = exam.subjectId as any;
      const grade = exam.gradeId as any;
      const program = exam.programId as any;

      // Count attempts for this exam
      const totalAttempts = await Attempt.countDocuments({ examId: exam._id });
      const completedAttempts = await Attempt.countDocuments({
        examId: exam._id,
        isSubmitted: true,
      });
      const inProgressAttempts = await Attempt.countDocuments({
        examId: exam._id,
        isSubmitted: false,
      });

      // Count pending grading
      const pendingGrading = await AttemptAnswer.countDocuments({
        attemptId: { $in: await Attempt.find({ examId: exam._id }).distinct("_id") },
        manual_score: null,
        $or: [{ question_type: "essay" }, { question_type: "oral" }],
      });

      examStats.push({
        id: (exam._id as any).toString(),
        name: exam.name,
        subject: subject?.name || "-",
        grade: grade?.name || "-",
        program: program?.name || "-",
        totalAttempts,
        completedCount: completedAttempts,
        inProgressCount: inProgressAttempts,
        pendingGradingCount: pendingGrading,
      });
    }

    // Calculate totals
    const totalExams = exams.length;
    const completedExams = examStats.filter((e) => e.completedCount > 0 && e.pendingGradingCount === 0).length;
    const inProgressExams = examStats.filter((e) => e.inProgressCount > 0 || e.pendingGradingCount > 0).length;
    const totalPendingGrading = examStats.reduce((sum, e) => sum + e.pendingGradingCount, 0);

    return NextResponse.json({
      totalExams,
      completedExams,
      inProgressExams,
      pendingGrading: totalPendingGrading,
      exams: examStats,
    });
  } catch (error: any) {
    console.error("Error fetching tracking data:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

