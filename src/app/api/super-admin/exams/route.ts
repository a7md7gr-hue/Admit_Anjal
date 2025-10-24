import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { Exam, School, Program, Grade, Subject, ExamBlueprint } from '@/models';

/**
 * GET: List all exams
 */
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    await connectDB();

    const exams = await Exam.find()
      .populate('schoolId', 'name shortCode')
      .populate('subjectId', 'name code')
      .populate('programId', 'name code')
      .populate('gradeId', 'name code')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      exams: exams.map((exam: any) => ({
        id: exam._id.toString(),
        name: exam.name,
        school: exam.schoolId?.name || '',
        schoolCode: exam.schoolId?.shortCode || '',
        subject: exam.subjectId?.name || '',
        program: exam.programId?.name || '',
        grade: exam.gradeId?.name || '',
        startDate: exam.startDate,
        endDate: exam.endDate,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        instructions: exam.instructions,
        isActive: exam.isActive,
        createdBy: exam.createdBy?.fullName || '',
        createdAt: exam.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Create a new exam
 */
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      schoolId,
      subjectId,
      programId,
      gradeId,
      startDate,
      endDate,
      duration,
      totalMarks,
      passingMarks,
      instructions,
    } = body;

    // Validation
    if (!name || !schoolId || !subjectId || !programId || !gradeId) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'تاريخ البدء والانتهاء مطلوبان' },
        { status: 400 }
      );
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء' },
        { status: 400 }
      );
    }

    if (!duration || duration < 1) {
      return NextResponse.json(
        { error: 'مدة الامتحان يجب أن تكون أكبر من 0' },
        { status: 400 }
      );
    }

    if (!totalMarks || totalMarks < 1) {
      return NextResponse.json(
        { error: 'مجموع الدرجات يجب أن يكون أكبر من 0' },
        { status: 400 }
      );
    }

    if (passingMarks < 0 || passingMarks > totalMarks) {
      return NextResponse.json(
        { error: 'درجة النجاح غير صحيحة' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify references exist
    const [school, subject, program, grade] = await Promise.all([
      School.findById(schoolId),
      Subject.findById(subjectId),
      Program.findById(programId),
      Grade.findById(gradeId),
    ]);

    if (!school) {
      return NextResponse.json({ error: 'المدرسة غير موجودة' }, { status: 404 });
    }
    if (!subject) {
      return NextResponse.json({ error: 'المادة غير موجودة' }, { status: 404 });
    }
    if (!program) {
      return NextResponse.json({ error: 'البرنامج غير موجود' }, { status: 404 });
    }
    if (!grade) {
      return NextResponse.json({ error: 'الصف غير موجود' }, { status: 404 });
    }

    // Create exam
    const exam = await Exam.create({
      name,
      schoolId,
      subjectId,
      programId,
      gradeId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      duration: Number(duration),
      totalMarks: Number(totalMarks),
      passingMarks: Number(passingMarks),
      instructions: instructions || '',
      createdBy: authUser.userId,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      exam: {
        id: exam._id.toString(),
        name: exam.name,
      },
      message: 'تم إنشاء الامتحان بنجاح',
    });
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT: Update an exam
 */
export async function PUT(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { examId, ...updates } = body;

    if (!examId) {
      return NextResponse.json({ error: 'معرف الامتحان مطلوب' }, { status: 400 });
    }

    await connectDB();

    const exam = await Exam.findByIdAndUpdate(
      examId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!exam) {
      return NextResponse.json({ error: 'الامتحان غير موجود' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الامتحان بنجاح',
    });
  } catch (error: any) {
    console.error('Error updating exam:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Delete an exam
 */
export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const url = new URL(request.url);
    const examId = url.searchParams.get('id');

    if (!examId) {
      return NextResponse.json({ error: 'معرف الامتحان مطلوب' }, { status: 400 });
    }

    await connectDB();

    // Delete exam and its blueprint
    await Promise.all([
      Exam.findByIdAndDelete(examId),
      ExamBlueprint.deleteMany({ examId }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'تم حذف الامتحان بنجاح',
    });
  } catch (error: any) {
    console.error('Error deleting exam:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

