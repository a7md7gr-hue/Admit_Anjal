import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import {
  User,
  StudentProfile,
  PasswordReset,
  ManagerAssignment,
  TeacherAssignment,
  SupervisorAssignment,
} from "@/models";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER"].includes(authUser.role.toUpperCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Find user
    const user = await User.findById(userId).populate("roleId");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ALWAYS prevent deleting owner account - NOBODY can delete it
    const role = user.roleId as any;
    if (role?.code === "OWNER") {
      return NextResponse.json(
        { error: "Cannot delete owner account" },
        { status: 403 },
      );
    }

    // Delete related records
    await StudentProfile.deleteOne({ userId: user._id });
    await PasswordReset.deleteOne({ userId: user._id });
    await ManagerAssignment.deleteOne({ managerId: user._id });
    await TeacherAssignment.deleteMany({ teacherId: user._id });
    await SupervisorAssignment.deleteMany({ supervisorId: user._id });

    // Delete user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: "تم حذف المستخدم بنجاح",
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
