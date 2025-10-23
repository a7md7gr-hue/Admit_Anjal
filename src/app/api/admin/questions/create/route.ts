import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { Question, QuestionOption, Subject, Program, Grade } from "@/models";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    // Allow SUPER_ADMIN, OWNER, and TEACHER to create questions
    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER", "TEACHER", "MANAGER"].includes(
        authUser.role.toUpperCase(),
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      questionText,
      questionType,
      subjectCode,
      programCode,
      gradeCode,
      points,
      options,
      imageUrl,
    } = body;

    // Validate required fields (removed categoryCode)
    if (
      !questionText ||
      !questionType ||
      !subjectCode ||
      !programCode ||
      !gradeCode
    ) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 },
      );
    }

    // Validate questionType
    if (!["mcq", "true_false", "essay", "oral"].includes(questionType)) {
      return NextResponse.json(
        { error: "نوع السؤال غير صحيح" },
        { status: 400 },
      );
    }

    await connectDB();

    // Get reference IDs (removed category)
    const subject = await Subject.findOne({ code: subjectCode });
    const program = await Program.findOne({ code: programCode });
    const grade = await Grade.findOne({ code: gradeCode });

    if (!subject || !program || !grade) {
      return NextResponse.json(
        { error: "بيانات مرجعية غير صحيحة" },
        { status: 400 },
      );
    }

    // Create question (removed categoryId, added imageUrl)
    const question = await Question.create({
      questionText,
      questionType,
      subjectId: subject._id,
      programId: program._id,
      gradeId: grade._id,
      imageUrl: imageUrl || undefined,
      points: points || 1,
      isApproved: true, // Auto-approve for admin/teacher
      createdBy: authUser.userId,
    });

    // Create options for MCQ and True/False questions
    if (
      (questionType === "mcq" || questionType === "true_false") &&
      options &&
      options.length > 0
    ) {
      // For true_false, ensure exactly 2 options
      if (questionType === "true_false" && options.length !== 2) {
        await Question.findByIdAndDelete(question._id);
        return NextResponse.json(
          { error: "أسئلة صح/خطأ يجب أن تحتوي على خيارين فقط" },
          { status: 400 },
        );
      }

      const optionDocs = options
        .filter((opt: any) => opt.text && opt.text.trim())
        .map((opt: any, index: number) => ({
          questionId: question._id,
          optionText: opt.text.trim(),
          isCorrect: opt.isCorrect || false,
          optionOrder: index + 1,
        }));

      if (optionDocs.length > 0) {
        await QuestionOption.insertMany(optionDocs);
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم إضافة السؤال بنجاح",
      questionId: question._id.toString(),
    });
  } catch (error: any) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ في إضافة السؤال" },
      { status: 500 },
    );
  }
}
