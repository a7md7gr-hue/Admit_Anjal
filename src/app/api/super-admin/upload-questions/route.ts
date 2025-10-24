import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { Question, QuestionOption, Subject, Program, Grade } from "@/models";
import { parseExcelToQuestions } from "@/lib/excelParser";

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
    const questions = await parseExcelToQuestions(file);

    console.log('📊 Parsed questions from Excel:', questions.length);
    if (questions.length > 0) {
      console.log('First question:', {
        text: questions[0].questionText.substring(0, 50),
        type: questions[0].questionType,
        subject: questions[0].subject,
        program: questions[0].program,
        grade: questions[0].grade,
      });
    }

    if (questions.length === 0) {
      return NextResponse.json({ 
        error: "الملف فارغ أو بصيغة غير صحيحة. تأكد من وجود الأعمدة: QuestionText, Type, Points, Subject, Program, Grade" 
      }, { status: 400 });
    }

    await connectDB();

    let created = 0;
    const errors: string[] = [];

    for (const q of questions) {
      try {
        // Get reference IDs
        const subject = await Subject.findOne({ name: q.subject });
        const program = await Program.findOne({ name: q.program });
        const grade = await Grade.findOne({ name: q.grade });

        if (!subject) {
          errors.push(`السؤال "${q.questionText.substring(0, 30)}...": المادة "${q.subject}" غير موجودة`);
          continue;
        }
        if (!program) {
          errors.push(`السؤال "${q.questionText.substring(0, 30)}...": البرنامج "${q.program}" غير موجود`);
          continue;
        }
        if (!grade) {
          errors.push(`السؤال "${q.questionText.substring(0, 30)}...": الصف "${q.grade}" غير موجود`);
          continue;
        }

        // Create question
        const question = await Question.create({
          questionText: q.questionText,
          questionType: q.questionType,
          subjectId: subject._id,
          programId: program._id,
          gradeId: grade._id,
          imageUrl: q.imageUrl || undefined,
          points: q.points || 1,
          isApproved: true,
          createdBy: authUser.userId,
        });

        // Create options if MCQ or True/False
        if (
          (q.questionType === "mcq" || q.questionType === "true_false") &&
          q.options &&
          q.options.length > 0
        ) {
          const optionDocs = q.options.map((opt: any, index: number) => ({
            questionId: question._id,
            optionText: opt.text,
            isCorrect: opt.isCorrect,
            optionOrder: index + 1,
          }));
          await QuestionOption.insertMany(optionDocs);
        }

        created++;
      } catch (err: any) {
        errors.push(
          `السؤال "${q.questionText.substring(0, 30)}...": ${err.message}`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم رفع ${created} سؤال`,
      created,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error uploading questions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
