import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { User, Role, StudentProfile, School, Program, Grade } from "@/models";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER", "MANAGER"].includes(authUser.role.toUpperCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      fullName,
      nationalId,
      schoolId,
      programId,
      gradeId,
      phone1,
      phone2,
    } = body;

    // Validation
    if (
      !fullName ||
      !nationalId ||
      !schoolId ||
      !programId ||
      !gradeId ||
      !phone1
    ) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة (رقم الهاتف 1 مطلوب)" },
        { status: 400 },
      );
    }

    // Validate national ID (10 digits)
    if (!/^\d{10}$/.test(nationalId)) {
      return NextResponse.json(
        { error: "رقم الهوية يجب أن يكون 10 أرقام بالضبط" },
        { status: 400 },
      );
    }

    // Generate random 4-digit PIN
    const pin4 = Math.floor(1000 + Math.random() * 9000).toString();

    // Validate phone1 (+966 followed by 9 digits)
    if (!/^\+966\d{9}$/.test(phone1)) {
      return NextResponse.json(
        { error: "رقم الهاتف 1 يجب أن يبدأ بـ +966 ويتبعه 9 أرقام" },
        { status: 400 },
      );
    }

    // Validate phone2 if provided (+966 followed by 9 digits)
    if (phone2 && !/^\+966\d{9}$/.test(phone2)) {
      return NextResponse.json(
        { error: "رقم الهاتف 2 يجب أن يبدأ بـ +966 ويتبعه 9 أرقام" },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if national ID already exists
    const existingUser = await User.findOne({ nationalId });
    if (existingUser) {
      return NextResponse.json(
        { error: "رقم الهوية مسجل مسبقاً" },
        { status: 400 },
      );
    }

    // Get student role
    const studentRole = await Role.findOne({ code: "STUDENT" });
    if (!studentRole) {
      return NextResponse.json(
        { error: "Student role not found" },
        { status: 500 },
      );
    }

    // Create user
    const user = await User.create({
      fullName,
      nationalId,
      roleId: studentRole._id,
    });

    // Create student profile
    await StudentProfile.create({
      userId: user._id,
      schoolId,
      programId,
      gradeId,
      pin4,
      phone1,
      phone2: phone2 || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "تم إضافة الطالب بنجاح",
      student: {
        id: user._id.toString(),
        fullName: user.fullName,
        nationalId: user.nationalId,
        pin4: pin4, // Auto-generated PIN
      },
    });
  } catch (error: any) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
