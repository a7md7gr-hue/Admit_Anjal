import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { User, Role, StudentProfile, School, Program, Grade } from "@/models";
import { parseExcelToStudents } from "@/lib/excelParser";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER"].includes(authUser.role.toUpperCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Parse Excel
    const students = await parseExcelToStudents(file);

    console.log('📊 Parsed students from Excel:', students.length);
    if (students.length > 0) {
      console.log('First student:', students[0]);
    }

    if (students.length === 0) {
      return NextResponse.json({ 
        error: "الملف فارغ أو بصيغة غير صحيحة. تأكد من وجود الأعمدة: FullName, NationalID, School, Program, Grade, PIN, Phone1" 
      }, { status: 400 });
    }

    await connectDB();

    const studentRole = await Role.findOne({ code: "STUDENT" });
    if (!studentRole) {
      return NextResponse.json(
        { error: "Student role not found" },
        { status: 500 },
      );
    }

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const s of students) {
      try {
        // Check if student exists
        const existing = await User.findOne({ nationalId: s.nationalId });
        if (existing) {
          skipped++;
          continue;
        }

        // Get reference IDs
        const school = await School.findOne({ name: s.school });
        const program = await Program.findOne({ name: s.program });
        const grade = await Grade.findOne({ name: s.grade });

        if (!school) {
          errors.push(`${s.fullName}: المدرسة "${s.school}" غير موجودة في القاعدة`);
          continue;
        }
        if (!program) {
          errors.push(`${s.fullName}: البرنامج "${s.program}" غير موجود في القاعدة`);
          continue;
        }
        if (!grade) {
          errors.push(`${s.fullName}: الصف "${s.grade}" غير موجود في القاعدة`);
          continue;
        }

        // Create user
        const user = await User.create({
          fullName: s.fullName,
          nationalId: s.nationalId,
          roleId: studentRole._id,
        });

        // Create profile
        await StudentProfile.create({
          userId: user._id,
          schoolId: school._id,
          programId: program._id,
          gradeId: grade._id,
          pin4: s.pin4,
          phone1: s.phone1,
          phone2: s.phone2 || undefined,
        });

        created++;
      } catch (err: any) {
        errors.push(`${s.fullName}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم رفع ${created} طالب، تم تخطي ${skipped} (موجود مسبقاً)`,
      created,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error uploading students:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
