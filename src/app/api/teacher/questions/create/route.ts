import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { Question, QuestionOption } from "@/models";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser || authUser.role.toUpperCase() !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();

    const questionText = formData.get("questionText") as string;
    const questionType = formData.get("questionType") as string;
    const subjectId = formData.get("subjectId") as string;
    const programId = formData.get("programId") as string;
    const gradeId = formData.get("gradeId") as string;
    const points = parseInt(formData.get("points") as string);
    const image = formData.get("image") as File | null;
    const optionsString = formData.get("options") as string;

    if (
      !questionText ||
      !questionType ||
      !subjectId ||
      !programId ||
      !gradeId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectDB();

    // Handle image upload if present
    let imagePath = null;
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const ext = image.name.split(".").pop();
      const filename = `question_${timestamp}.${ext}`;
      const filepath = join(process.cwd(), "public", "questions", filename);

      await writeFile(filepath, buffer);
      imagePath = `/questions/${filename}`;
    }

    // Create question
    const question = await Question.create({
      questionText,
      questionType,
      subjectId,
      programId,
      gradeId,
      points: points || 1,
      imagePath,
      isApproved: true, // Auto-approve teacher questions
      createdBy: authUser.userId,
    });

    // If MCQ or True/False, create options
    if (
      (questionType === "mcq" || questionType === "true_false") &&
      optionsString
    ) {
      const options = JSON.parse(optionsString);

      const optionDocs = options.map((opt: any) => ({
        questionId: question._id,
        optionText: opt.text,
        isCorrect: opt.isCorrect,
      }));

      await QuestionOption.insertMany(optionDocs);
    }

    return NextResponse.json({
      success: true,
      message: "Question created successfully",
      questionId: question._id.toString(),
    });
  } catch (error: any) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
