import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import {
  User,
  Role,
  StudentProfile,
  School,
  Program,
  Grade,
  ManagerAssignment,
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

    // Get student role
    const studentRole = await Role.findOne({ code: "STUDENT" });
    if (!studentRole) {
      return NextResponse.json({ students: [] });
    }

    let query: any = { roleId: studentRole._id };

    // If manager, only show students from their school
    if (authUser.role.toUpperCase() === "MANAGER") {
      const assignment = await ManagerAssignment.findOne({
        userId: authUser.userId,
      });
      if (!assignment) {
        return NextResponse.json({ students: [] });
      }

      // Get student profiles from this school
      const profiles = await StudentProfile.find({
        schoolId: assignment.schoolId,
      });
      const userIds = profiles.map((p) => p.userId);
      query._id = { $in: userIds };
    }

    // Get students with populated profiles
    const students = await User.find(query)
      .select("fullName nationalId createdAt")
      .sort({ createdAt: -1 });

    const studentList = [];
    for (const student of students) {
      const profile = await StudentProfile.findOne({ userId: student._id })
        .populate("schoolId")
        .populate("programId")
        .populate("gradeId");

      if (profile) {
        const school = profile.schoolId as any;
        const program = profile.programId as any;
        const grade = profile.gradeId as any;

        studentList.push({
          id: student._id.toString(),
          fullName: student.fullName,
          nationalId: student.nationalId,
          school: school?.name || "-",
          program: program?.name || "-",
          grade: grade?.name || "-",
          pin4: profile.pin4,
          createdAt: student.createdAt,
        });
      }
    }

    return NextResponse.json({ students: studentList });
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
