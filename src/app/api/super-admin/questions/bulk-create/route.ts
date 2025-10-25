import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { Question, QuestionOption } from "@/models";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER", "MANAGER", "TEACHER"].includes(
        authUser.role.toUpperCase()
      )
    ) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await request.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "يجب إرسال مصفوفة أسئلة" },
        { status: 400 }
      );
    }

    await connectDB();

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      try {
        // Validate required fields
        if (!q.questionText || !q.questionText.trim()) {
          errors.push(`الصف ${i + 1}: نص السؤال مطلوب`);
          errorCount++;
          continue;
        }

        if (!q.subjectId || !q.programId || !q.gradeId) {
          errors.push(`الصف ${i + 1}: المادة، البرنامج، والصف مطلوبة`);
          errorCount++;
          continue;
        }

        // Create question
        const newQuestion = await Question.create({
          questionText: q.questionText.trim(),
          questionType: q.questionType || "mcq",
          points: parseInt(q.points) || 1,
          subjectId: q.subjectId,
          programId: q.programId,
          gradeId: q.gradeId,
          imageUrl: q.imageUrl || undefined,
          isApproved: true, // Auto-approve from bulk creation
          createdBy: authUser.userId,
        });

        // If MCQ, create options
        if (q.questionType === "mcq") {
          const options = [];
          const correctOptionIndex = parseInt(q.correctOption) || 1;

          if (q.option1 && q.option1.trim()) {
            options.push({
              questionId: newQuestion._id,
              optionText: q.option1.trim(),
              isCorrect: correctOptionIndex === 1,
              optionOrder: 1,
            });
          }

          if (q.option2 && q.option2.trim()) {
            options.push({
              questionId: newQuestion._id,
              optionText: q.option2.trim(),
              isCorrect: correctOptionIndex === 2,
              optionOrder: 2,
            });
          }

          if (q.option3 && q.option3.trim()) {
            options.push({
              questionId: newQuestion._id,
              optionText: q.option3.trim(),
              isCorrect: correctOptionIndex === 3,
              optionOrder: 3,
            });
          }

          if (q.option4 && q.option4.trim()) {
            options.push({
              questionId: newQuestion._id,
              optionText: q.option4.trim(),
              isCorrect: correctOptionIndex === 4,
              optionOrder: 4,
            });
          }

          if (options.length < 2) {
            errors.push(`الصف ${i + 1}: يجب إدخال خيارين على الأقل للأسئلة الاختيارية`);
            // Delete the question since it's incomplete
            await Question.findByIdAndDelete(newQuestion._id);
            errorCount++;
            continue;
          }

          await QuestionOption.insertMany(options);
        }

        successCount++;
      } catch (error: any) {
        console.error(`Error creating question ${i + 1}:`, error);
        errors.push(`الصف ${i + 1}: ${error.message}`);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم إضافة ${successCount} سؤال بنجاح${errorCount > 0 ? ` (${errorCount} فشلت)` : ""}`,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error in bulk question creation:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

