import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { Attempt, User, Exam, SupervisorAssignment, Subject } from "@/models";

// GET all attempts pending supervisor approval
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER", "SUPERVISOR"].includes(
        authUser.role.toUpperCase(),
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const subjectCode = searchParams.get("subjectCode");

    await connectDB();

    let query: any = { isCompleted: true }; // Only completed attempts

    // If SUPERVISOR, filter by assigned subjects
    if (authUser.role.toUpperCase() === "SUPERVISOR") {
      const assignment = await SupervisorAssignment.findOne({
        userId: authUser.userId,
      });
      if (!assignment) {
        return NextResponse.json({ attempts: [] });
      }
      query["examId.subjectId"] = { $in: assignment.subjectIds };
    }

    if (subjectCode) {
      const subject = await Subject.findOne({ code: subjectCode });
      if (subject) {
        query["examId.subjectId"] = subject._id;
      }
    }

    const attempts = await Attempt.find(query)
      .populate({
        path: "studentId",
        select: "fullName nationalId",
        populate: {
          path: "studentProfileId",
          select: "schoolId gradeId",
          populate: [
            { path: "schoolId", select: "name" },
            { path: "gradeId", select: "name code" },
          ],
        },
      })
      .populate({
        path: "examId",
        select: "name subjectId",
        populate: { path: "subjectId", select: "name code" },
      })
      .sort({ submittedAt: -1 });

    const attemptList = attempts.map((a: any) => ({
      id: a._id.toString(),
      student: a.studentId?.fullName,
      nationalId: a.studentId?.nationalId,
      school: a.studentId?.studentProfileId?.schoolId?.name,
      grade: a.studentId?.studentProfileId?.gradeId?.name,
      exam: a.examId?.name,
      subject: a.examId?.subjectId?.name,
      subjectCode: a.examId?.subjectId?.code,
      score: a.totalScore,
      percentage: a.percentage,
      submittedAt: a.submittedAt,
      supervisorApproved: a.supervisorApproved || false,
    }));

    return NextResponse.json({ attempts: attemptList });
  } catch (error: any) {
    console.error("Error fetching attempts:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST approve attempt (mark as passed for subject)
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER", "SUPERVISOR"].includes(
        authUser.role.toUpperCase(),
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { attemptId, approved, notes } = body;

    if (!attemptId || approved === undefined) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 },
      );
    }

    await connectDB();

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return NextResponse.json(
        { error: "المحاولة غير موجودة" },
        { status: 404 },
      );
    }

    attempt.supervisorApproved = approved;
    attempt.supervisorNotes = notes || "";
    await attempt.save();

    return NextResponse.json({
      success: true,
      message: approved ? "تم اعتماد النسبة بنجاح" : "تم رفض الاعتماد",
      attemptId: attempt._id.toString(),
    });
  } catch (error: any) {
    console.error("Error updating approval:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


