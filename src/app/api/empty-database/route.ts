import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import User from '@/models/User';
import StudentProfile from '@/models/StudentProfile';
import Question from '@/models/Question';
import QuestionOption from '@/models/QuestionOption';
import Exam from '@/models/Exam';
import Attempt from '@/models/Attempt';
import AttemptAnswer from '@/models/AttemptAnswer';
import TeacherAssignment from '@/models/TeacherAssignment';
import ManagerAssignment from '@/models/ManagerAssignment';
import SupervisorAssignment from '@/models/SupervisorAssignment';

/**
 * تفريغ قاعدة البيانات (للـ Super Admin)
 * يمسح: الطلاب، المعلمين، المديرين، المشرفين، الأسئلة، الامتحانات
 * يحتفظ بـ: Owner، Super Admin، المدارس، البرامج، الصفوف، المواد
 */
export async function POST() {
  try {
    const authUser = await getAuthUser();
    
    // Only Super Admin and Owner can empty database
    if (!authUser || !['SUPER_ADMIN', 'OWNER'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    await connectDB();

    console.log('🗑️ Starting database emptying (keeping system data)...');

    // Delete in correct order (respect foreign keys)
    await AttemptAnswer.deleteMany({});
    console.log('✅ Deleted AttemptAnswers');

    await Attempt.deleteMany({});
    console.log('✅ Deleted Attempts');

    await Exam.deleteMany({});
    console.log('✅ Deleted Exams');

    await QuestionOption.deleteMany({});
    console.log('✅ Deleted QuestionOptions');

    await Question.deleteMany({});
    console.log('✅ Deleted Questions');

    await TeacherAssignment.deleteMany({});
    console.log('✅ Deleted TeacherAssignments');

    await ManagerAssignment.deleteMany({});
    console.log('✅ Deleted ManagerAssignments');

    await SupervisorAssignment.deleteMany({});
    console.log('✅ Deleted SupervisorAssignments');

    await StudentProfile.deleteMany({});
    console.log('✅ Deleted StudentProfiles');

    // Delete only Staff users (keep Owner & Super Admin)
    const ownerRole = await User.findOne({ roleId: { $exists: true } }).populate('roleId');
    const protectedRoles = ['OWNER', 'SUPER_ADMIN'];
    
    const deletedUsers = await User.deleteMany({
      roleId: { $exists: true },
      $expr: {
        $not: {
          $in: [
            { $getField: { field: 'code', input: '$roleId' } },
            protectedRoles
          ]
        }
      }
    });

    // Simple approach: Get all users with their roles and delete manually
    const allUsers = await User.find().populate('roleId');
    let deletedCount = 0;
    
    for (const user of allUsers) {
      const roleCode = (user.roleId as any)?.code;
      if (!protectedRoles.includes(roleCode)) {
        await User.findByIdAndDelete(user._id);
        deletedCount++;
      }
    }

    console.log(`✅ Deleted ${deletedCount} Staff Users (kept Owner & Super Admin)`);

    console.log('🎉 Database emptied successfully!');

    return NextResponse.json({
      success: true,
      message: 'تم تفريغ قاعدة البيانات بنجاح! (تم الاحتفاظ بالبيانات الأساسية)',
      deletedCollections: [
        'AttemptAnswers',
        'Attempts',
        'Exams',
        'QuestionOptions',
        'Questions',
        'TeacherAssignments',
        'ManagerAssignments',
        'SupervisorAssignments',
        'StudentProfiles',
        `Users (${deletedCount} deleted)`,
      ],
      kept: [
        'Roles',
        'Schools',
        'Programs',
        'Grades',
        'Subjects',
        'QuestionCategories',
        'SubjectWeights',
        'Owner & Super Admin Users',
      ],
    });
  } catch (error: any) {
    console.error('❌ Empty database failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

