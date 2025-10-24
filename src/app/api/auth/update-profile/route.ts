import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { fullName, email, phone } = body;

    // Validate
    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json(
        { error: 'الاسم يجب أن يكون حرفين على الأقل' },
        { status: 400 }
      );
    }

    // Update user
    const updateData: any = {
      fullName: fullName.trim(),
    };

    if (email) {
      updateData.email = email.trim().toLowerCase();
    }

    if (phone) {
      updateData.phone = phone.trim();
    }

    const user = await User.findByIdAndUpdate(
      authUser.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('fullName email phone nationalId');

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث البيانات بنجاح',
      user: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ في التحديث' },
      { status: 500 }
    );
  }
}

