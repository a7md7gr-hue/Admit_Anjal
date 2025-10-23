import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { SubjectWeight, Subject, Grade } from "@/models";

// GET all subject weights for a grade
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER", "MANAGER"].includes(authUser.role.toUpperCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const gradeCode = searchParams.get("gradeCode");

    await connectDB();

    let query: any = {};
    if (gradeCode) {
      const grade = await Grade.findOne({ code: gradeCode });
      if (grade) {
        query.gradeId = grade._id;
      }
    }

    const weights = await SubjectWeight.find(query)
      .populate("subjectId")
      .populate("gradeId");

    const weightList = weights.map((w: any) => ({
      id: w._id.toString(),
      subject: w.subjectId?.name,
      subjectCode: w.subjectId?.code,
      grade: w.gradeId?.name,
      gradeCode: w.gradeId?.code,
      weight: w.weight,
    }));

    return NextResponse.json({ weights: weightList });
  } catch (error: any) {
    console.error("Error fetching weights:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST/UPDATE subject weight
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
    const { gradeCode, subjectCode, weight } = body;

    if (!gradeCode || !subjectCode || weight === undefined) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 },
      );
    }

    if (weight < 0 || weight > 100) {
      return NextResponse.json(
        { error: "الوزن يجب أن يكون بين 0 و 100" },
        { status: 400 },
      );
    }

    await connectDB();

    const subject = await Subject.findOne({ code: subjectCode });
    const grade = await Grade.findOne({ code: gradeCode });

    if (!subject || !grade) {
      return NextResponse.json(
        { error: "بيانات مرجعية غير صحيحة" },
        { status: 400 },
      );
    }

    // Upsert (update or create)
    const result = await SubjectWeight.findOneAndUpdate(
      { gradeId: grade._id, subjectId: subject._id },
      { weight },
      { upsert: true, new: true },
    );

    return NextResponse.json({
      success: true,
      message: "تم تحديث الوزن بنجاح",
      weightId: result._id.toString(),
    });
  } catch (error: any) {
    console.error("Error updating weight:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
