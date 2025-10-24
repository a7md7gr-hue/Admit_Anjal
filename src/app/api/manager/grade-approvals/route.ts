import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { GradeApproval, User, Exam, ManagerAssignment } from "@/models";

// GET all grade approvals for manager
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER", "MANAGER"].includes(authUser.role.toUpperCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending, approved, rejected, conditional_approved

    await connectDB();

    let query: any = {};

    // If MANAGER, only show students in their school
    if (authUser.role.toUpperCase() === "MANAGER") {
      const assignment = await ManagerAssignment.findOne({
        userId: authUser.userId,
      });
      if (!assignment) {
        return NextResponse.json({ approvals: [] });
      }

      // Get students from this school
      const students = await User.find({
        "studentProfileId.schoolId": assignment.schoolId,
      });
      const studentIds = students.map((s) => s._id);
      query.studentId = { $in: studentIds };
    }

    if (status) {
      query.status = status;
    }

    const approvals = await GradeApproval.find(query)
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
      .populate("examId", "name")
      .populate("managerId", "fullName")
      .sort({ createdAt: -1 });

    const approvalList = approvals.map((a: any) => ({
      id: a._id.toString(),
      student: a.studentId?.fullName,
      nationalId: a.studentId?.nationalId,
      school: a.studentId?.studentProfileId?.schoolId?.name,
      grade: a.studentId?.studentProfileId?.gradeId?.name,
      exam: a.examId?.name,
      status: a.status,
      notes: a.notes,
      approvedAt: a.approvedAt,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({ approvals: approvalList });
  } catch (error: any) {
    console.error("Error fetching approvals:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST approve/reject grade
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (
      !authUser ||
      !["SUPER_ADMIN", "OWNER", "MANAGER"].includes(authUser.role.toUpperCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, examId, status, notes } = body;

    if (!studentId || !examId || !status) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 },
      );
    }

    if (!["approved", "rejected", "conditional_approved"].includes(status)) {
      return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
    }

    await connectDB();

    // Upsert approval
    const result = await GradeApproval.findOneAndUpdate(
      { studentId, examId },
      {
        managerId: authUser.userId,
        status,
        notes: notes || "",
        approvedAt: status !== "pending" ? new Date() : undefined,
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({
      success: true,
      message: "تم تحديث الاعتماد بنجاح",
      approvalId: result._id.toString(),
    });
  } catch (error: any) {
    console.error("Error updating approval:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



