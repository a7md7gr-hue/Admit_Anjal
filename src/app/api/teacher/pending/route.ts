import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import {
  AttemptAnswer,
  Attempt,
  Question,
  User,
  TeacherAssignment,
} from "@/models";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser || authUser.role.toUpperCase() !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const exam_id = searchParams.get("exam_id");

    await connectDB();

    // Get teacher's assigned subjects
    const teacherAssignments = await TeacherAssignment.find({
      teacherId: authUser.userId,
    });
    const teacherSubjectIds = teacherAssignments.map((ta) =>
      ta.subjectId.toString(),
    );

    if (teacherSubjectIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Find attempt answers that need manual grading (essay/oral without manual_score)
    const query: any = {
      manual_score: null,
    };

    // Get attempt answers with populated data
    let attemptAnswers = await AttemptAnswer.find(query)
      .populate({
        path: "attemptId",
        model: Attempt,
        populate: {
          path: "studentId",
          model: User,
          select: "fullName nationalId",
        },
      })
      .populate({
        path: "questionId",
        model: Question,
      })
      .sort({ attemptId: 1 });

    // Filter by exam_id if provided
    if (exam_id) {
      attemptAnswers = attemptAnswers.filter((aa: any) => {
        const attempt = aa.attemptId as any;
        return (
          attempt && attempt.examId && attempt.examId.toString() === exam_id
        );
      });
    }

    // Filter only essay/oral questions AND only teacher's subjects
    // For oral questions, only show if student marked as ready
    attemptAnswers = attemptAnswers.filter((aa: any) => {
      const question = aa.questionId as any;
      const isTeacherSubject = teacherSubjectIds.includes(
        question.subjectId.toString(),
      );

      if (question.questionType === "essay") {
        return isTeacherSubject;
      } else if (question.questionType === "oral") {
        return isTeacherSubject && aa.isOralReady === true;
      }

      return false;
    });

    // Build items array
    const items = attemptAnswers.map((aa: any) => {
      const attempt = aa.attemptId as any;
      const student = attempt.studentId as any;
      const question = aa.questionId as any;

      return {
        row_id: aa._id.toString(),
        attempt_id: attempt._id.toString(),
        exam_id: attempt.examId?.toString() || null,
        student: {
          name: student?.fullName || "Unknown",
          nid: student?.nationalId || "-",
        },
        question: {
          id: question._id.toString(),
          text: question.questionText,
          type: question.questionType,
          points: question.points || 1,
        },
        answer_text: aa.freeText || "",
        auto_score: aa.autoScore || 0,
        manual_score: aa.manual_score,
        comment: aa.comment || "",
      };
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Error fetching pending items:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
