import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { User, Role } from '@/models';

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    // Only Owner and Super Admin can change roles
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { nationalId, newRole } = body;

    if (!nationalId || !newRole) {
      return NextResponse.json(
        { error: 'رقم الهوية والدور الجديد مطلوبان' },
        { status: 400 }
      );
    }

    // Validate new role
    const validRoles = ['SUPER_ADMIN', 'MANAGER', 'TEACHER', 'SUPERVISOR', 'STUDENT'];
    if (!validRoles.includes(newRole.toUpperCase())) {
      return NextResponse.json(
        { error: 'الدور غير صحيح' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user
    const user = await User.findOne({ nationalId });
    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // Get new role
    const roleDoc = await Role.findOne({ 
      code: { $regex: new RegExp(`^${newRole}$`, 'i') } 
    });
    
    if (!roleDoc) {
      return NextResponse.json(
        { error: 'الدور غير موجود في قاعدة البيانات' },
        { status: 404 }
      );
    }

    // Prevent changing Owner role (security)
    const oldRole = await User.findById(user._id).populate('roleId');
    const currentRoleCode = (oldRole?.roleId as any)?.code?.toUpperCase();
    if (currentRoleCode === 'OWNER') {
      return NextResponse.json(
        { error: 'لا يمكن تغيير دور المالك' },
        { status: 403 }
      );
    }

    // Update role
    await User.findByIdAndUpdate(user._id, {
      roleId: roleDoc._id,
    });

    return NextResponse.json({
      success: true,
      message: `✅ تم تغيير دور المستخدم ${user.fullName} إلى ${roleDoc.name}`,
      user: {
        nationalId: user.nationalId,
        fullName: user.fullName,
        newRole: roleDoc.name,
      },
    });
  } catch (error: any) {
    console.error('Change role error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ' },
      { status: 500 }
    );
  }
}

