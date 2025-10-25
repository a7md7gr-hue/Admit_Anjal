import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import {
  Attempt,
  AttemptAnswer,
  User,
  Exam,
  Subject,
  Grade,
  Program,
  School,
  StudentProfile,
} from "@/models";

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER"].includes(authUser.role.toUpperCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    // Get all pending answers (essay/oral without manual_score)
    const pendingAnswers = await AttemptAnswer.find({
      manual_score: null,
      $or: [
        { question_type: "essay" },
        { question_type: "oral" }
      ]
    })
      .populate({
        path: "attemptId",
        populate: [
          {
            path: "studentId",
            select: "fullName nationalId",
            populate: {
              path: "studentProfile",
              select: "schoolId programId gradeId",
              populate: [
                { path: "schoolId", select: "name shortCode" },
                { path: "programId", select: "name code" },
                { path: "gradeId", select: "name code" }
              ]
            }
          },
          {
            path: "examId",
            select: "name subjectId",
            populate: {
              path: "subjectId",
              select: "name code"
            }
          }
        ]
      })
      .lean();

    console.log(`📊 Found ${pendingAnswers.length} pending answers`);

    // Group by exam and student
    const examMap = new Map();
    const teacherMap = new Map();

    for (const answer of pendingAnswers) {
      const attempt = answer.attemptId as any;
      if (!attempt) continue;

      const exam = attempt.examId as any;
      const student = attempt.studentId as any;
      
      if (!exam || !student) continue;

      const examId = exam._id.toString();
      const studentId = student._id.toString();
      const subject = exam.subjectId as any;

      // Get student profile
      const studentProfile: any = await StudentProfile.findOne({ studentId: student._id })
        .populate("schoolId programId gradeId")
        .lean();

      // Find teacher assigned to this subject, school, program, grade
      if (studentProfile) {
        const TeacherAssignment = (await import("@/models")).TeacherAssignment;
        
        const assignment: any = await TeacherAssignment.findOne({
          subjectId: subject?._id,
          schoolId: studentProfile.schoolId?._id || studentProfile.schoolId,
          programId: studentProfile.programId?._id || studentProfile.programId,
          gradeIds: studentProfile.gradeId?._id || studentProfile.gradeId,
          isActive: true,
        })
          .populate("teacherId", "fullName nationalId email")
          .lean();

        if (assignment) {
          const teacher = assignment.teacherId as any;
          const teacherId = teacher._id.toString();

          if (!teacherMap.has(teacherId)) {
            teacherMap.set(teacherId, {
              id: teacherId,
              fullName: teacher.fullName,
              nationalId: teacher.nationalId,
              email: teacher.email,
              pendingCount: 0,
              students: new Set(),
              exams: new Set(),
            });
          }

          const teacherData = teacherMap.get(teacherId);
          teacherData.pendingCount++;
          teacherData.students.add(studentId);
          teacherData.exams.add(examId);
        }
      }

      // Group by exam
      if (!examMap.has(examId)) {
        examMap.set(examId, {
          id: examId,
          name: exam.name,
          subject: subject?.name || "-",
          students: new Map(),
        });
      }

      const examData = examMap.get(examId);
      
      if (!examData.students.has(studentId)) {
        const schoolData = studentProfile?.schoolId as any;
        const programData = studentProfile?.programId as any;
        const gradeData = studentProfile?.gradeId as any;
        
        examData.students.set(studentId, {
          id: studentId,
          fullName: student.fullName,
          nationalId: student.nationalId,
          school: schoolData?.name || "-",
          program: programData?.name || "-",
          grade: gradeData?.name || "-",
          pendingAnswers: 0,
        });
      }

      examData.students.get(studentId).pendingAnswers++;
    }

    // Convert maps to arrays
    const exams = Array.from(examMap.values()).map((exam) => ({
      ...exam,
      students: Array.from(exam.students.values()),
      totalPending: Array.from(exam.students.values()).reduce(
        (sum: number, s: any) => sum + s.pendingAnswers,
        0
      ),
    }));

    const teachers = Array.from(teacherMap.values()).map((teacher) => ({
      ...teacher,
      students: Array.from(teacher.students).length,
      exams: Array.from(teacher.exams).length,
    }));

    // Sort teachers by pending count (descending)
    teachers.sort((a, b) => b.pendingCount - a.pendingCount);

    console.log(`✅ Grouped into ${exams.length} exams, ${teachers.length} teachers`);

    return NextResponse.json({
      totalPending: pendingAnswers.length,
      exams,
      teachers,
    });
  } catch (error: any) {
    console.error("Error fetching pending grading details:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

