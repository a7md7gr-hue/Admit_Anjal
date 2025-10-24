import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { Grade, StudentProfile, Attempt } from "@/models";

// Stage Report (all grades summary)
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

    await connectDB();

    const grades = await Grade.find({});

    const gradeReports = await Promise.all(
      grades.map(async (grade: any) => {
        const profiles = await StudentProfile.find({ gradeId: grade._id });
        const studentIds = profiles.map((p) => p.userId);

        const attempts = await Attempt.find({
          studentId: { $in: studentIds },
          isCompleted: true,
        });

        const totalStudents = profiles.length;
        const totalAttempts = attempts.length;
        const avgPercentage =
          attempts.length > 0
            ? attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
              attempts.length
            : 0;

        return {
          gradeName: grade.name,
          gradeCode: grade.code,
          totalStudents,
          totalAttempts,
          averagePercentage: avgPercentage.toFixed(2),
        };
      }),
    );

    return NextResponse.json({
      totalGrades: gradeReports.length,
      grades: gradeReports,
    });
  } catch (error: any) {
    console.error("Error generating stage report:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

