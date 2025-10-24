import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { Exam, ExamBlueprint, Question } from '@/models';

/**
 * GET: Get questions for an exam
 */
export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const url = new URL(request.url);
    const examId = url.searchParams.get('examId');

    if (!examId) {
      return NextResponse.json({ error: 'معرف الامتحان مطلوب' }, { status: 400 });
    }

    await connectDB();

    // Get exam blueprint
    const blueprints = await ExamBlueprint.find({ examId })
      .populate('questionId')
      .sort({ order: 1 })
      .lean();

    const questions = blueprints.map((bp: any, index: number) => {
      const q = bp.questionId;
      return {
        id: q._id.toString(),
        text: q.questionText,
        type: q.questionType,
        points: q.points,
        order: bp.order || index + 1,
      };
    });

    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (error: any) {
    console.error('Error fetching exam questions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Add questions to exam
 */
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { examId, questionIds } = body;

    if (!examId || !questionIds || !Array.isArray(questionIds)) {
      return NextResponse.json(
        { error: 'معرف الامتحان وقائمة الأسئلة مطلوبان' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return NextResponse.json({ error: 'الامتحان غير موجود' }, { status: 404 });
    }

    // Get current max order
    const maxOrderDoc = await ExamBlueprint.findOne({ examId }).sort({ order: -1 });
    let nextOrder = maxOrderDoc ? maxOrderDoc.order + 1 : 1;

    // Add questions to blueprint
    const blueprints = questionIds.map((qId: string) => ({
      examId,
      questionId: qId,
      order: nextOrder++,
    }));

    await ExamBlueprint.insertMany(blueprints);

    // Update exam total marks
    const allBlueprints = await ExamBlueprint.find({ examId }).populate('questionId');
    const totalMarks = allBlueprints.reduce((sum: number, bp: any) => {
      return sum + (bp.questionId?.points || 0);
    }, 0);

    await Exam.findByIdAndUpdate(examId, { totalMarks });

    return NextResponse.json({
      success: true,
      message: `تم إضافة ${questionIds.length} سؤال للامتحان`,
      totalMarks,
    });
  } catch (error: any) {
    console.error('Error adding questions to exam:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Remove a question from exam
 */
export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER', 'MANAGER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const url = new URL(request.url);
    const examId = url.searchParams.get('examId');
    const questionId = url.searchParams.get('questionId');

    if (!examId || !questionId) {
      return NextResponse.json(
        { error: 'معرف الامتحان ومعرف السؤال مطلوبان' },
        { status: 400 }
      );
    }

    await connectDB();

    // Remove from blueprint
    await ExamBlueprint.findOneAndDelete({ examId, questionId });

    // Recalculate total marks
    const allBlueprints = await ExamBlueprint.find({ examId }).populate('questionId');
    const totalMarks = allBlueprints.reduce((sum: number, bp: any) => {
      return sum + (bp.questionId?.points || 0);
    }, 0);

    await Exam.findByIdAndUpdate(examId, { totalMarks });

    return NextResponse.json({
      success: true,
      message: 'تم حذف السؤال من الامتحان',
      totalMarks,
    });
  } catch (error: any) {
    console.error('Error removing question from exam:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

