import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { User, PasswordReset } from "@/models";
import bcrypt from "bcryptjs";

const DEFAULT_PASSWORD = "Test@1234";

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

    // Prevent resetting owner password (only owner can do that)
    const role = user.roleId as any;
    if (role?.code === "OWNER" && authUser.role !== "owner") {
      return NextResponse.json(
        { error: "Cannot reset owner password" },
        { status: 403 },
      );
    }

    // Hash default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 8);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Set password reset flag
    await PasswordReset.findOneAndUpdate(
      { userId: user._id },
      { mustChangePassword: true },
      { upsert: true },
    );

    return NextResponse.json({
      success: true,
      message: `تم إعادة تعيين كلمة المرور إلى: ${DEFAULT_PASSWORD}`,
    });
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
