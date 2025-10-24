import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { School } from '@/models';

/**
 * POST: Add a new school
 */
export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { name, shortCode } = body;

    if (!name || !shortCode) {
      return NextResponse.json(
        { error: 'الاسم والرمز مطلوبان' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if school code already exists
    const existing = await School.findOne({ shortCode });
    if (existing) {
      return NextResponse.json(
        { error: `المدرسة برمز "${shortCode}" موجودة بالفعل` },
        { status: 400 }
      );
    }

    const school = await School.create({ name, shortCode });

    return NextResponse.json({
      success: true,
      school: {
        id: school._id.toString(),
        name: school.name,
        code: school.shortCode,
      },
    });
  } catch (error: any) {
    console.error('Error creating school:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Remove a school
 */
export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const url = new URL(request.url);
    const schoolId = url.searchParams.get('id');

    if (!schoolId) {
      return NextResponse.json({ error: 'معرف المدرسة مطلوب' }, { status: 400 });
    }

    await connectDB();

    const school = await School.findByIdAndDelete(schoolId);
    if (!school) {
      return NextResponse.json({ error: 'المدرسة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `تم حذف المدرسة: ${school.name}`,
    });
  } catch (error: any) {
    console.error('Error deleting school:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

