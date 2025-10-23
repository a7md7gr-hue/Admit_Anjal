import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import { signJwt } from "@/lib/auth";
import User from "@/models/User";
import Role from "@/models/Role";
import PasswordReset from "@/models/PasswordReset";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nationalId, password } = body;

    if (!nationalId || !password) {
      return NextResponse.json(
        { error: "رقم الهوية وكلمة المرور مطلوبان" },
        { status: 400 },
      );
    }

    // Validate national ID format (10 digits)
    if (!/^\d{10}$/.test(nationalId)) {
      return NextResponse.json(
        { error: "رقم الهوية يجب أن يكون 10 أرقام" },
        { status: 400 },
      );
    }

    await connectDB();

    // Ensure Role model is loaded
    await Role.init();

    // Find user with password field
    const user = await User.findOne({ nationalId })
      .select("+password")
      .populate("roleId");

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "رقم الهوية أو كلمة المرور غير صحيحة" },
        { status: 401 },
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "رقم الهوية أو كلمة المرور غير صحيحة" },
        { status: 401 },
      );
    }

    // Check if user must change password
    const passwordReset = await PasswordReset.findOne({ userId: user._id });
    const mustChangePassword = passwordReset?.mustChangePassword || false;

    // Get role code (keep original case from database)
    const role = user.roleId as any;
    const roleCode = role?.code || "STAFF";

    // Generate JWT token
    const token = await signJwt({
      userId: user._id.toString(),
      role: roleCode, // Use actual code from database (e.g., 'SUPER_ADMIN')
      nationalId: user.nationalId!,
      fullName: user.fullName,
    });

    // Set cookie
    const cookieStore = await cookies();

    // Delete any existing student token first
    cookieStore.delete("student_uid");

    // Set staff token
    cookieStore.set("staff_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    console.log("✅ Staff login successful:", {
      userId: user._id.toString(),
      role: roleCode,
      mustChangePassword,
      nationalId: user.nationalId,
    });

    return NextResponse.json({
      success: true,
      mustChangePassword,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        nationalId: user.nationalId,
        role: roleCode, // Return actual role code
      },
    });
  } catch (error: any) {
    console.error("Staff login error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تسجيل الدخول" },
      { status: 500 },
    );
  }
}
