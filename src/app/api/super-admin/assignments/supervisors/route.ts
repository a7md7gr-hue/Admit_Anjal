import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import SupervisorAssignment from '@/models/SupervisorAssignment';

// GET
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const assignments = await SupervisorAssignment.find()
      .populate('supervisorId', 'fullName nationalId')
      .populate('teacherId', 'fullName nationalId')
      .sort('-createdAt');

    return NextResponse.json({ success: true, assignments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { supervisorId, teacherId } = body;

    if (!supervisorId || !teacherId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const existing = await SupervisorAssignment.findOne({ supervisorId, teacherId });
    if (existing) {
      return NextResponse.json({ error: 'هذا الربط موجود بالفعل!' }, { status: 400 });
    }

    const assignment = await SupervisorAssignment.create({ supervisorId, teacherId });

    return NextResponse.json({
      success: true,
      message: 'تم ربط المشرف بالمعلم بنجاح!',
      assignment,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await connectDB();
    await SupervisorAssignment.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'تم حذف الربط!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

