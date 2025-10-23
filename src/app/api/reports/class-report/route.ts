import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { User, StudentProfile, Attempt, Grade } from "@/models";

// Class Report (all students in a specific grade/class)
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
    const gradeCode = searchParams.get("gradeCode");

    if (!gradeCode) {
      return NextResponse.json({ error: "Grade code مطلوب" }, { status: 400 });
    }

    await connectDB();

    const grade = await Grade.findOne({ code: gradeCode });
    if (!grade) {
      return NextResponse.json({ error: "الصف غير موجود" }, { status: 404 });
    }

    // Get all students in this grade
    const profiles = await StudentProfile.find({ gradeId: grade._id })
      .populate("userId", "fullName nationalId")
      .populate("schoolId", "name")
      .populate("programId", "name");

    const studentReports = await Promise.all(
      profiles.map(async (profile: any) => {
        const attempts = await Attempt.find({
          studentId: profile.userId._id,
          isCompleted: true,
        });

        const totalScore = attempts.reduce(
          (sum, a) => sum + (a.totalScore || 0),
          0,
        );
        const avgPercentage =
          attempts.length > 0
            ? attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
              attempts.length
            : 0;

        return {
          fullName: profile.userId?.fullName,
          nationalId: profile.userId?.nationalId,
          school: profile.schoolId?.name,
          program: profile.programId?.name,
          totalAttempts: attempts.length,
          totalScore,
          averagePercentage: avgPercentage.toFixed(2),
        };
      }),
    );

    return NextResponse.json({
      grade: grade.name,
      gradeCode: grade.code,
      totalStudents: studentReports.length,
      students: studentReports,
    });
  } catch (error: any) {
    console.error("Error generating class report:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
