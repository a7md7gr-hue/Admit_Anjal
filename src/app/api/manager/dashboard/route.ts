import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import {
  User,
  Role,
  School,
  StudentProfile,
  Exam,
  Attempt,
  AttemptAnswer,
  ManagerAssignment,
} from "@/models";

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["MANAGER", "SUPER_ADMIN", "OWNER"].includes(authUser.role.toUpperCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    // Get manager's school
    const manager = await User.findById(authUser.userId);
    if (!manager) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const assignment = await ManagerAssignment.findOne({
      userId: manager._id,
    }).populate("schoolId");
    if (!assignment) {
      return NextResponse.json(
        { error: "School assignment not found" },
        { status: 404 },
      );
    }

    const school = assignment.schoolId as any;

    // Get student role
    const studentRole = await Role.findOne({ code: { $regex: /^STUDENT$/i } });

    // Get students in this school
    const studentProfiles = await StudentProfile.find({ schoolId: school._id })
      .populate({
        path: "userId",
        model: User,
        select: "fullName nationalId",
      })
      .populate("gradeId")
      .populate("programId");

    const students = studentProfiles.map((profile: any) => ({
      fullName: profile.userId?.fullName || "Unknown",
      nationalId: profile.userId?.nationalId || "-",
      grade: profile.gradeId?.name || "-",
      program: profile.programId?.name || "-",
      pin: profile.pin_4 || "-",
    }));

    // Count stats
    const totalStudents = students.length;
    const activeExams = await Exam.countDocuments();
    const completedAttempts = await Attempt.countDocuments({
      is_submitted: true,
    });
    const pendingGrading = await AttemptAnswer.countDocuments({
      manual_score: null,
    });

    return NextResponse.json({
      stats: {
        totalStudents,
        activeExams,
        completedAttempts,
        pendingGrading,
        schoolName: school.name,
      },
      students,
    });
  } catch (error: any) {
    console.error("Error fetching manager dashboard:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
