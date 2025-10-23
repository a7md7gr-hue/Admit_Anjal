import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import { signJwt } from "@/lib/auth";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import Role from "@/models/Role";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { national_id, pin_4 } = body;

    if (!national_id || !pin_4) {
      return NextResponse.json(
        { error: "رقم الهوية ورمز PIN مطلوبان" },
        { status: 400 },
      );
    }

    // Validate formats
    if (!/^\d{10}$/.test(national_id)) {
      return NextResponse.json(
        { error: "رقم الهوية يجب أن يكون 10 أرقام" },
        { status: 400 },
      );
    }

    if (!/^\d{4}$/.test(pin_4)) {
      return NextResponse.json(
        { error: "رمز PIN يجب أن يكون 4 أرقام" },
        { status: 400 },
      );
    }

    await connectDB();

    // Ensure Role model is loaded
    await Role.init();

    // Find user
    const user = await User.findOne({ nationalId: national_id }).populate(
      "roleId",
    );

    if (!user) {
      return NextResponse.json(
        { error: "رقم الهوية أو رمز PIN غير صحيح" },
        { status: 401 },
      );
    }

    // Check if user is a student
    const role = user.roleId as any;
    if (role?.code?.toLowerCase() !== "student") {
      return NextResponse.json(
        { error: "هذا الحساب ليس حساب طالب" },
        { status: 403 },
      );
    }

    // Find student profile and verify PIN
    const studentProfile = await StudentProfile.findOne({ userId: user._id });

    if (!studentProfile || studentProfile.pin4 !== pin_4) {
      return NextResponse.json(
        { error: "رقم الهوية أو رمز PIN غير صحيح" },
        { status: 401 },
      );
    }

    // Generate JWT token with actual role code from database
    const token = await signJwt({
      userId: user._id.toString(),
      role: role.code, // Use actual code from database (e.g., 'STUDENT')
      nationalId: user.nationalId!,
      fullName: user.fullName,
    });

    // Set cookie
    const cookieStore = await cookies();

    // Delete any existing staff token first
    cookieStore.delete("staff_token");

    // Set student token
    cookieStore.set("student_uid", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        nationalId: user.nationalId,
        role: role.code,
      },
    });
  } catch (error: any) {
    console.error("Student login error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تسجيل الدخول" },
      { status: 500 },
    );
  }
}
