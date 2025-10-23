import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { User, StudentProfile, Attempt, Exam } from "@/models";

// Student Full Report (all data)
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER", "MANAGER", "SUPERVISOR"].includes(
        authUser.role.toUpperCase(),
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "Student ID مطلوب" }, { status: 400 });
    }

    await connectDB();

    const student = await User.findById(studentId)
      .populate("roleId")
      .populate({
        path: "studentProfileId",
        populate: [
          { path: "schoolId", select: "name code" },
          { path: "programId", select: "name code" },
          { path: "gradeId", select: "name code" },
        ],
      });

    if (!student) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    const profile = student.studentProfileId as any;

    // Get all attempts for this student
    const attempts = await Attempt.find({
      studentId: student._id,
      isCompleted: true,
    })
      .populate({
        path: "examId",
        select: "name subjectId",
        populate: { path: "subjectId", select: "name code" },
      })
      .sort({ submittedAt: -1 });

    const attemptList = attempts.map((a: any) => ({
      exam: a.examId?.name,
      subject: a.examId?.subjectId?.name,
      score: a.totalScore,
      percentage: a.percentage,
      submittedAt: a.submittedAt,
      supervisorApproved: a.supervisorApproved || false,
    }));

    const report = {
      fullName: student.fullName,
      nationalId: student.nationalId,
      school: profile?.schoolId?.name,
      program: profile?.programId?.name,
      grade: profile?.gradeId?.name,
      phone1: profile?.phone1,
      phone2: profile?.phone2,
      academicYear: profile?.academicYear,
      attempts: attemptList,
      totalAttempts: attemptList.length,
      averagePercentage:
        attemptList.length > 0
          ? (
              attemptList.reduce(
                (sum: number, a: any) => sum + (a.percentage || 0),
                0,
              ) / attemptList.length
            ).toFixed(2)
          : 0,
    };

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
