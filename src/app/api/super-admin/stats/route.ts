import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import {
  User,
  Role,
  School,
  Question,
  Exam,
  Attempt,
  AttemptAnswer,
} from "@/models";

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

    // Get all roles
    const studentRole = await Role.findOne({ code: { $regex: /^STUDENT$/i } });
    const teacherRole = await Role.findOne({ code: { $regex: /^TEACHER$/i } });
    const managerRole = await Role.findOne({ code: { $regex: /^MANAGER$/i } });

    // Count stats
    const [
      totalStudents,
      totalTeachers,
      totalManagers,
      totalSchools,
      totalQuestions,
      totalExams,
      totalAttempts,
    ] = await Promise.all([
      studentRole ? User.countDocuments({ roleId: studentRole._id }) : 0,
      teacherRole ? User.countDocuments({ roleId: teacherRole._id }) : 0,
      managerRole ? User.countDocuments({ roleId: managerRole._id }) : 0,
      School.countDocuments(),
      Question.countDocuments(),
      Exam.countDocuments(),
      Attempt.countDocuments(),
    ]);

    // Count pending grading (essay/oral questions without manual_score)
    const pendingGrading = await AttemptAnswer.countDocuments({
      manual_score: null,
    });

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalManagers,
      totalSchools,
      totalQuestions,
      totalExams,
      totalAttempts,
      pendingGrading,
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
