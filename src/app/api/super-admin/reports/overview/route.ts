import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import {
  User,
  Role,
  StudentProfile,
  Question,
  Exam,
  Attempt,
  AttemptAnswer,
  School,
} from "@/models";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER", "MANAGER"].includes(authUser.role.toUpperCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    // Get roles
    const studentRole = await Role.findOne({ code: "STUDENT" });
    const teacherRole = await Role.findOne({ code: "TEACHER" });
    const managerRole = await Role.findOne({ code: "MANAGER" });

    // Count users by role
    const totalStudents = await User.countDocuments({
      roleId: studentRole?._id,
    });
    const totalTeachers = await User.countDocuments({
      roleId: teacherRole?._id,
    });
    const totalManagers = await User.countDocuments({
      roleId: managerRole?._id,
    });

    // Count questions by type
    const totalQuestions = await Question.countDocuments({});
    const mcqQuestions = await Question.countDocuments({ questionType: "mcq" });
    const essayQuestions = await Question.countDocuments({
      questionType: "essay",
    });
    const oralQuestions = await Question.countDocuments({
      questionType: "oral",
    });

    // Count exams
    const totalExams = await Exam.countDocuments({});

    // Count attempts
    const totalAttempts = await Attempt.countDocuments({});
    const completedAttempts = await Attempt.countDocuments({
      is_submitted: true,
    });
    const pendingAttempts = totalAttempts - completedAttempts;

    // Count pending grading (essay/oral without manual_score)
    const pendingGrading = await AttemptAnswer.countDocuments({
      manual_score: null,
    });

    // Get schools count
    const totalSchools = await School.countDocuments({});

    // Get students by school
    const studentsBySchool = await StudentProfile.aggregate([
      {
        $lookup: {
          from: "schools",
          localField: "schoolId",
          foreignField: "_id",
          as: "school",
        },
      },
      { $unwind: "$school" },
      {
        $group: {
          _id: "$school.name",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get questions by subject
    const questionsBySubject = await Question.aggregate([
      {
        $lookup: {
          from: "subjects",
          localField: "subjectId",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: "$subject" },
      {
        $group: {
          _id: "$subject.name",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      overview: {
        totalStudents,
        totalTeachers,
        totalManagers,
        totalSchools,
        totalQuestions,
        totalExams,
        totalAttempts,
        completedAttempts,
        pendingAttempts,
        pendingGrading,
      },
      questionsByType: {
        mcq: mcqQuestions,
        essay: essayQuestions,
        oral: oralQuestions,
      },
      studentsBySchool,
      questionsBySubject,
    });
  } catch (error: any) {
    console.error("Error fetching overview:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
