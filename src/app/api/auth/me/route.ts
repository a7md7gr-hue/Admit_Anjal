import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { User, StudentProfile } from "@/models";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get full user details
    const user = await User.findById(authUser.userId).populate("roleId");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = user.roleId as any;
    const roleCode = role?.code || "";

    const response: any = {
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        nationalId: user.nationalId,
        email: user.email,
        phone: user.phone,
        role: roleCode,
        roleName: role?.name || "",
        createdAt: user.createdAt,
      },
    };

    // If student, get profile details
    if (roleCode === 'STUDENT') {
      const studentProfile = await StudentProfile.findOne({ userId: user._id })
        .populate('schoolId')
        .populate('programId')
        .populate('gradeId');

      if (studentProfile) {
        const school = studentProfile.schoolId as any;
        const program = studentProfile.programId as any;
        const grade = studentProfile.gradeId as any;

        response.profile = {
          school: {
            id: school?._id?.toString(),
            name: school?.name,
            code: school?.shortCode,
          },
          program: {
            id: program?._id?.toString(),
            name: program?.name,
            code: program?.code,
          },
          grade: {
            id: grade?._id?.toString(),
            name: grade?.name,
            code: grade?.code,
          },
          pin4: studentProfile.pin4,
          phone1: studentProfile.phone1,
          phone2: studentProfile.phone2,
        };
      }
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
