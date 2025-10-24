import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import Role from '@/models/Role';
import User from '@/models/User';

/**
 * Initialize Super Admin only
 * This endpoint creates only Super Admin account and required roles
 */
export async function POST() {
  try {
    console.log('🌱 Initializing Super Admin...');

    await connectDB();
    console.log('✅ MongoDB connected');

    // Check if Super Admin already exists
    const superAdminRole = await Role.findOne({ code: 'SUPER_ADMIN' });
    if (superAdminRole) {
      const existingSuperAdmin = await User.findOne({ roleId: superAdminRole._id });
      if (existingSuperAdmin) {
        return NextResponse.json({
          success: false,
          error: 'Super Admin already exists! Use the Clear Database button first if you want to recreate.',
          existing: {
            fullName: existingSuperAdmin.fullName,
            nationalId: existingSuperAdmin.nationalId,
          }
        }, { status: 400 });
      }
    }

    // Create Roles if they don't exist
    console.log('📋 Ensuring roles exist...');
    const rolesCodes = ['OWNER', 'SUPER_ADMIN', 'MANAGER', 'SUPERVISOR', 'TEACHER', 'STUDENT'];
    const rolesNames = ['Owner', 'Super Admin', 'Manager', 'Supervisor', 'Teacher', 'Student'];
    
    for (let i = 0; i < rolesCodes.length; i++) {
      const exists = await Role.findOne({ code: rolesCodes[i] });
      if (!exists) {
        await Role.create({ code: rolesCodes[i], name: rolesNames[i] });
        console.log(`✅ Created role: ${rolesNames[i]}`);
      }
    }

    // Get Super Admin role
    const superAdminRole2 = await Role.findOne({ code: 'SUPER_ADMIN' });
    if (!superAdminRole2) {
      throw new Error('Failed to create Super Admin role');
    }

    // Create Super Admin user
    console.log('👨‍💼 Creating Super Admin...');
    const hashedPassword = await bcrypt.hash('Test@1234', 10);
    
    const superAdmin = await User.create({
      nationalId: '1111111111',
      password: hashedPassword,
      fullName: 'مدير النظام',
      roleId: superAdminRole2._id,
    });

    console.log('✅ Super Admin created successfully!');

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء حساب Super Admin بنجاح!',
      superAdmin: {
        nationalId: '1111111111',
        password: 'Test@1234',
        fullName: superAdmin.fullName,
      },
    });
  } catch (error: any) {
    console.error('❌ Init Admin failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'فشل إنشاء Super Admin: ' + error.message,
      },
      { status: 500 }
    );
  }
}

