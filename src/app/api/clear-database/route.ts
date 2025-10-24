import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Role from '@/models/Role';
import User from '@/models/User';
import StudentProfile from '@/models/StudentProfile';
import School from '@/models/School';
import Program from '@/models/Program';
import Grade from '@/models/Grade';
import Subject from '@/models/Subject';
import QuestionCategory from '@/models/QuestionCategory';
import Question from '@/models/Question';
import Exam from '@/models/Exam';
import StudentExam from '@/models/StudentExam';

export async function POST() {
  try {
    await connectDB();

    console.log('🗑️ Starting database cleanup...');

    // Delete in correct order (respect foreign keys)
    await StudentExam.deleteMany({});
    console.log('✅ Deleted StudentExams');

    await Exam.deleteMany({});
    console.log('✅ Deleted Exams');

    await Question.deleteMany({});
    console.log('✅ Deleted Questions');

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

    await User.deleteMany({});
    console.log('✅ Deleted Users');

    await Role.deleteMany({});
    console.log('✅ Deleted Roles');

    console.log('🎉 Database cleared successfully!');

    return NextResponse.json({
      success: true,
      message: 'تم مسح قاعدة البيانات بنجاح! يمكنك الآن البدء من الصفر.',
      deletedCollections: [
        'StudentExams',
        'Exams',
        'Questions',
        'QuestionCategories',
        'Subjects',
        'Grades',
        'Programs',
        'Schools',
        'StudentProfiles',
        'Users',
        'Roles',
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

