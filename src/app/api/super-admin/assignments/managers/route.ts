import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import ManagerAssignment from '@/models/ManagerAssignment';

// GET - List all manager assignments
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const assignments = await ManagerAssignment.find()
      .populate('managerId', 'fullName nationalId')
      .populate('schoolId', 'name')
      .sort('-createdAt');

    return NextResponse.json({
      success: true,
      assignments,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create manager assignment
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { managerId, schoolId } = body;

    if (!managerId || !schoolId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const existing = await ManagerAssignment.findOne({ managerId, schoolId });
    if (existing) {
      return NextResponse.json({ error: 'هذا الربط موجود بالفعل!' }, { status: 400 });
    }

    const assignment = await ManagerAssignment.create({ managerId, schoolId });

    return NextResponse.json({
      success: true,
      message: 'تم ربط المدير بنجاح!',
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
    await ManagerAssignment.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'تم حذف الربط!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

