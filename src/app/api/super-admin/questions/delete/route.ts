import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { Question, QuestionOption } from "@/models";

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
    const { questionId } = body;

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Delete question options first
    await QuestionOption.deleteMany({ questionId });

    // Delete question
    await Question.findByIdAndDelete(questionId);

    return NextResponse.json({
      success: true,
      message: "تم حذف السؤال بنجاح",
    });
  } catch (error: any) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
