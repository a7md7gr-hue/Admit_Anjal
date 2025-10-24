import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import SubjectWeight from '@/models/SubjectWeight';

// GET
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const weights = await SubjectWeight.find()
      .populate('gradeId', 'name code')
      .populate('subjectId', 'name code')
      .sort('gradeId subjectId');

    return NextResponse.json({ success: true, weights });
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
    const { gradeId, subjectId, weight } = body;

    if (!gradeId || !subjectId || weight === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Update or create
    const existing = await SubjectWeight.findOne({ gradeId, subjectId });
    if (existing) {
      existing.weight = weight;
      await existing.save();
      return NextResponse.json({
        success: true,
        message: 'تم تحديث الوزن بنجاح!',
        weight: existing,
      });
    }

    const newWeight = await SubjectWeight.create({ gradeId, subjectId, weight });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الوزن بنجاح!',
      weight: newWeight,
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
    await SubjectWeight.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'تم حذف الوزن!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

