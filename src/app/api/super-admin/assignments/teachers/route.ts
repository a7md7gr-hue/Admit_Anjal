import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import TeacherAssignment from '@/models/TeacherAssignment';
import User from '@/models/User';
import Subject from '@/models/Subject';
import Grade from '@/models/Grade';
import School from '@/models/School';
import Program from '@/models/Program';

// GET - List all teacher assignments
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const assignments = await TeacherAssignment.find()
      .populate('teacherId', 'fullName nationalId')
      .populate('subjectId', 'name code')
      .populate('gradeIds', 'name code')
      .populate('schoolId', 'name')
      .populate('programId', 'name')
      .sort('-createdAt');

    return NextResponse.json({
      success: true,
      assignments: assignments.map(a => ({
        _id: a._id.toString(),
        teacher: a.teacherId,
        subject: a.subjectId,
        grades: a.gradeIds,
        school: a.schoolId,
        program: a.programId,
        isActive: a.isActive,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching teacher assignments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create teacher assignment
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { teacherId, subjectId, gradeIds, schoolId, programId } = body;

    if (!teacherId || !subjectId || !schoolId || !programId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Check if assignment already exists
    const existing = await TeacherAssignment.findOne({
      teacherId,
      subjectId,
      schoolId,
      programId,
    });

    if (existing) {
      return NextResponse.json({ 
        error: 'هذا الربط موجود بالفعل! يمكنك تعديله أو حذفه أولاً.'
      }, { status: 400 });
    }

    const assignment = await TeacherAssignment.create({
      teacherId,
      subjectId,
      gradeIds: gradeIds || [],
      schoolId,
      programId,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'تم ربط المعلم بنجاح!',
      assignment,
    });
  } catch (error: any) {
    console.error('Error creating teacher assignment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove teacher assignment
export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    await connectDB();

    await TeacherAssignment.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'تم حذف الربط بنجاح!',
    });
  } catch (error: any) {
    console.error('Error deleting teacher assignment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

