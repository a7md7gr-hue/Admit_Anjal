import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { School } from '@/models';

/**
 * PUT: Update a school's information
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, shortCode } = body;

    if (!name || !shortCode) {
      return NextResponse.json(
        { error: 'الاسم والرمز مطلوبان' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if another school already has this code
    const existing = await School.findOne({ 
      shortCode, 
      _id: { $ne: id } 
    });
    if (existing) {
      return NextResponse.json(
        { error: `مدرسة أخرى تستخدم الرمز "${shortCode}" بالفعل` },
        { status: 400 }
      );
    }

    const school = await School.findByIdAndUpdate(
      id,
      { name, shortCode },
      { new: true, runValidators: true }
    );

    if (!school) {
      return NextResponse.json({ error: 'المدرسة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      school: {
        id: school._id.toString(),
        name: school.name,
        code: school.shortCode,
      },
      message: 'تم تعديل المدرسة بنجاح',
    });
  } catch (error: any) {
    console.error('Error updating school:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

