import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { AttemptAnswer } from "@/models";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userRole = authUser.role.toUpperCase();
    if (userRole !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { attemptAnswerId } = body;

    if (!attemptAnswerId) {
      return NextResponse.json(
        { error: "Attempt answer ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Update the attempt answer to mark as ready
    const attemptAnswer = await AttemptAnswer.findByIdAndUpdate(
      attemptAnswerId,
      { isOralReady: true },
      { new: true },
    );

    if (!attemptAnswer) {
      return NextResponse.json(
        { error: "Attempt answer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم التسجيل. يرجى التوجه للمعلم لإجراء الاختبار الشفوي.",
    });
  } catch (error: any) {
    console.error("Error marking oral ready:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
