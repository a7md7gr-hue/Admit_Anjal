import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { User, Role } from '@/models';

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { nationalId } = body;

    if (!nationalId) {
      return NextResponse.json({ error: 'رقم الهوية مطلوب' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ nationalId }).populate('roleId');
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const role = user.roleId as any;

    return NextResponse.json({
      nationalId: user.nationalId,
      fullName: user.fullName,
      currentRole: {
        id: role._id,
        name: role.name,
        code: role.code,
      },
    });
  } catch (error: any) {
    console.error('Check role error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

