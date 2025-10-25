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
  Program,
  Grade,
  Subject,
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
      schools,
      programs,
      grades,
      subjects,
    ] = await Promise.all([
      studentRole ? User.countDocuments({ roleId: studentRole._id }) : 0,
      teacherRole ? User.countDocuments({ roleId: teacherRole._id }) : 0,
      managerRole ? User.countDocuments({ roleId: managerRole._id }) : 0,
      School.countDocuments(),
      Question.countDocuments(),
      Exam.countDocuments(),
      Attempt.countDocuments(),
      School.find({}).select('_id name shortCode').lean(),
      Program.find({}).select('_id name code').lean(),
      Grade.find({}).select('_id name code').lean(),
      Subject.find({}).select('_id name code').lean(),
    ]);

    // Count pending grading (essay/oral questions without manual_score)
    const pendingGrading = await AttemptAnswer.countDocuments({
      manual_score: null,
    });

    console.log(`📊 Stats: ${totalQuestions} questions, ${totalSchools} schools`);

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalManagers,
      totalSchools,
      totalQuestions,
      totalExams,
      totalAttempts,
      pendingGrading,
      // Add lists for reference
      schools: schools.map((s: any) => ({
        id: s._id.toString(),
        name: s.name,
        code: s.shortCode,
      })),
      programs: programs.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        code: p.code,
      })),
      grades: grades.map((g: any) => ({
        id: g._id.toString(),
        name: g.name,
        code: g.code,
      })),
      subjects: subjects.map((s: any) => ({
        id: s._id.toString(),
        name: s.name,
        code: s.code,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
