import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import Role from '@/models/Role';
import User from '@/models/User';
import StudentProfile from '@/models/StudentProfile';
import School from '@/models/School';
import Program from '@/models/Program';
import Grade from '@/models/Grade';
import Subject from '@/models/Subject';
import QuestionCategory from '@/models/QuestionCategory';
import Question from '@/models/Question';
import QuestionOption from '@/models/QuestionOption';
import Exam from '@/models/Exam';
import Attempt from '@/models/Attempt';
import AttemptAnswer from '@/models/AttemptAnswer';
import TeacherAssignment from '@/models/TeacherAssignment';
import ManagerAssignment from '@/models/ManagerAssignment';
import SupervisorAssignment from '@/models/SupervisorAssignment';
import SubjectWeight from '@/models/SubjectWeight';

/**
 * مسح كامل لقاعدة البيانات (مستوى عالي فقط!)
 * يمسح كل شيء ماعدا حسابات الإدارة
 */
export async function POST() {
  try {
    const authUser = await getAuthUser();
    
    // Only high-level admins can clear EVERYTHING
    if (!authUser || !['OWNER', 'SUPER_ADMIN'].includes(authUser.role.toUpperCase())) {
      return NextResponse.json({ 
        error: 'غير مصرح لك! هذا الإجراء للمسؤولين فقط.' 
      }, { status: 403 });
    }

    await connectDB();

    console.log('🗑️ Starting FULL database cleanup...');

    // Get admin role IDs BEFORE deleting anything
    const ownerRole = await Role.findOne({ code: 'OWNER' });
    const superAdminRole = await Role.findOne({ code: 'SUPER_ADMIN' });
    
    const protectedRoleIds = [ownerRole?._id, superAdminRole?._id].filter(Boolean);
    console.log('🛡️ Protected roles:', protectedRoleIds.length);

    // Get admin users BEFORE deleting
    const protectedUsers = await User.find({ roleId: { $in: protectedRoleIds } }).select('_id nationalId fullName');
    const protectedUserIds = protectedUsers.map(u => u._id);
    console.log('🛡️ Protected users:', protectedUsers.map(u => `${u.fullName} (${u.nationalId})`));

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

    await SubjectWeight.deleteMany({});
    console.log('✅ Deleted SubjectWeights');

    await QuestionCategory.deleteMany({});
    console.log('✅ Deleted QuestionCategories');

    await Subject.deleteMany({});
    console.log('✅ Deleted Subjects');

    await Grade.deleteMany({});
    console.log('✅ Deleted Grades');

    await Program.deleteMany({});
    console.log('✅ Deleted Programs');

    await School.deleteMany({});
    console.log('✅ Deleted Schools');

    await StudentProfile.deleteMany({});
    console.log('✅ Deleted StudentProfiles');

    // Delete only non-protected users
    const deletedUsers = await User.deleteMany({ _id: { $nin: protectedUserIds } });
    console.log(`✅ Deleted ${deletedUsers.deletedCount} Users (kept ${protectedUserIds.length} protected)`);

    // Don't delete any roles - keep all roles intact
    console.log('🛡️ Kept all Roles intact');

    console.log('🎉 Database FULLY cleared successfully!');

    return NextResponse.json({
      success: true,
      message: 'تم مسح قاعدة البيانات بنجاح! (تم الاحتفاظ بحسابات Owner و Super Admin)',
      protected: {
        users: protectedUsers.map(u => ({ fullName: u.fullName, nationalId: u.nationalId })),
        count: protectedUserIds.length,
      },
      deletedCollections: [
        'AttemptAnswers',
        'Attempts',
        'Exams',
        'QuestionOptions',
        'Questions',
        'QuestionCategories',
        'Subjects',
        'Grades',
        'Programs',
        'Schools',
        'StudentProfiles',
        `Users (${deletedUsers.deletedCount} deleted, ${protectedUserIds.length} protected)`,
      ],
    });
  } catch (error: any) {
    console.error('❌ Clear database failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

