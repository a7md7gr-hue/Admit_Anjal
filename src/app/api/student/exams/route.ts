import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { Exam, Subject, Attempt } from "@/models";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check role (case insensitive)
    const userRole = authUser.role.toUpperCase();
    if (userRole !== "STUDENT") {
      console.log("❌ Role mismatch:", {
        expected: "STUDENT",
        actual: userRole,
      });
      return NextResponse.json(
        { error: `Unauthorized - Role: ${authUser.role}` },
        { status: 403 },
      );
    }

    await connectDB();

    // Get all exams ordered by subject
    // Order: عربي، رياضيات، علوم، إنجليزي
    const subjectOrder = ["عربي", "رياضيات", "علوم", "إنجليزي"];

    const exams = await Exam.find({ isActive: true })
      .populate("subjectId")
      .sort({ createdAt: 1 });

    // Filter out exams without valid subjectId and sort by custom subject order
    const validExams = exams.filter(
      (e) => e.subjectId && (e.subjectId as any).name,
    );

    const sortedExams = validExams.sort((a, b) => {
      const aSubject = (a.subjectId as any)?.name || "";
      const bSubject = (b.subjectId as any)?.name || "";
      const aIndex = subjectOrder.indexOf(aSubject);
      const bIndex = subjectOrder.indexOf(bSubject);

      // If subject not in order list, put at end
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });

    // Check which exams the student has completed
    const examsWithStatus = [];
    for (const exam of sortedExams) {
      const attempt = await Attempt.findOne({
        studentId: authUser.userId,
        examId: exam._id,
      });

      examsWithStatus.push({
        id: exam._id.toString(),
        name: exam.name,
        subject: (exam.subjectId as any)?.name || "غير محدد",
        isCompleted: attempt?.is_submitted || false,
        attemptId: attempt?._id.toString(),
      });
    }

    return NextResponse.json({ exams: examsWithStatus });
  } catch (error: any) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
