import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Import all models
import Role from '@/models/Role';
import School from '@/models/School';
import Program from '@/models/Program';
import Grade from '@/models/Grade';
import Subject from '@/models/Subject';
import QuestionCategory from '@/models/QuestionCategory';
import User from '@/models/User';
import StudentProfile from '@/models/StudentProfile';
import Question from '@/models/Question';
import Exam from '@/models/Exam';
import ExamBlueprint from '@/models/ExamBlueprint';
import TeacherAssignment from '@/models/TeacherAssignment';

export async function GET(request: Request) {
  try {
    console.log('🌱 Starting database seeding via API...');

    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Role.deleteMany({}),
      School.deleteMany({}),
      Program.deleteMany({}),
      Grade.deleteMany({}),
      Subject.deleteMany({}),
      QuestionCategory.deleteMany({}),
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      Question.deleteMany({}),
      Exam.deleteMany({}),
      ExamBlueprint.deleteMany({}),
      TeacherAssignment.deleteMany({}),
    ]);
    console.log('✅ Data cleared');

    // Create Roles
    console.log('📋 Creating roles...');
    const roles = await Role.insertMany([
      { code: 'OWNER', name: 'Owner' },
      { code: 'SUPER_ADMIN', name: 'Super Admin' },
      { code: 'MANAGER', name: 'Manager' },
      { code: 'SUPERVISOR', name: 'Supervisor' },
      { code: 'TEACHER', name: 'Teacher' },
      { code: 'STUDENT', name: 'Student' },
    ]);
    console.log(`✅ Created ${roles.length} roles`);

    // Create Schools
    console.log('🏫 Creating schools...');
    const schools = await School.insertMany([
      { shortCode: 'ANB', name: 'مدارس الأنجال الأهلية - بنين' },
      { shortCode: 'ANG', name: 'مدارس الأنجال الأهلية - بنات' },
      { shortCode: 'AIB', name: 'مدارس الأنجال الدولية - بنين' },
      { shortCode: 'AIG', name: 'مدارس الأنجال الدولية - بنات' },
      { shortCode: 'AKAC', name: 'مدارس الأنجال - مدينة الملك عبدالله' },
      { shortCode: 'ARC', name: 'مدارس الأنجال - مدينة الرياض' },
    ]);
    console.log(`✅ Created ${schools.length} schools`);

    // Create Programs
    console.log('📚 Creating programs...');
    const programs = await Program.insertMany([
      { code: 'ARABIC', name: 'البرنامج العربي' },
      { code: 'INTERNATIONAL', name: 'البرنامج الدولي' },
    ]);
    console.log(`✅ Created ${programs.length} programs`);

    // Create Grades
    console.log('🎓 Creating grades...');
    const grades = await Grade.insertMany([
      { nameAr: 'الصف الأول الابتدائي', nameEn: 'Grade 1', level: 1, stage: 'elementary' },
      { nameAr: 'الصف الثاني الابتدائي', nameEn: 'Grade 2', level: 2, stage: 'elementary' },
      { nameAr: 'الصف الثالث الابتدائي', nameEn: 'Grade 3', level: 3, stage: 'elementary' },
      { nameAr: 'الصف الرابع الابتدائي', nameEn: 'Grade 4', level: 4, stage: 'elementary' },
      { nameAr: 'الصف الخامس الابتدائي', nameEn: 'Grade 5', level: 5, stage: 'elementary' },
      { nameAr: 'الصف السادس الابتدائي', nameEn: 'Grade 6', level: 6, stage: 'elementary' },
    ]);
    console.log(`✅ Created ${grades.length} grades`);

    // Create Subjects
    console.log('📖 Creating subjects...');
    const subjects = await Subject.insertMany([
      { nameAr: 'رياضيات', nameEn: 'Mathematics', code: 'math' },
      { nameAr: 'لغة عربية', nameEn: 'Arabic Language', code: 'arabic' },
      { nameAr: 'لغة إنجليزية', nameEn: 'English Language', code: 'english' },
      { nameAr: 'علوم', nameEn: 'Science', code: 'science' },
      { nameAr: 'دراسات اجتماعية', nameEn: 'Social Studies', code: 'social' },
    ]);
    console.log(`✅ Created ${subjects.length} subjects`);

    // Create Question Categories
    console.log('🏷️  Creating question categories...');
    const categories = await QuestionCategory.insertMany([
      { nameAr: 'سهل', nameEn: 'Easy', difficulty: 'easy' },
      { nameAr: 'متوسط', nameEn: 'Medium', difficulty: 'medium' },
      { nameAr: 'صعب', nameEn: 'Hard', difficulty: 'hard' },
      { nameAr: 'تحدي', nameEn: 'Challenge', difficulty: 'hard' },
    ]);
    console.log(`✅ Created ${categories.length} categories`);

    // Get role IDs
    const ownerRole = roles.find(r => r.code === 'OWNER');
    const superAdminRole = roles.find(r => r.code === 'SUPER_ADMIN');
    const managerRole = roles.find(r => r.code === 'MANAGER');
    const teacherRole = roles.find(r => r.code === 'TEACHER');
    const studentRole = roles.find(r => r.code === 'STUDENT');

    if (!ownerRole || !superAdminRole || !managerRole || !teacherRole || !studentRole) {
      throw new Error('Required roles not found');
    }

    // Create Owner
    console.log('👑 Creating owner...');
    const owner = await User.create({
      nationalId: '0000000000',
      password: 'Owner@2025!Ahmed',
      fullName: 'أحمد حجر',
      email: 'ahmed.hagr@anjal.edu.sa',
      phone: '+966500000000',
      roleId: ownerRole._id,
      isActive: true,
    });
    console.log('✅ Owner created');

    // Create Super Admin
    console.log('👨‍💼 Creating super admin...');
    const superAdmin = await User.create({
      nationalId: '1111111111',
      password: 'Test@1234',
      fullName: 'مدير النظام',
      email: 'admin@anjal.edu.sa',
      phone: '+966511111111',
      roleId: superAdminRole._id,
      isActive: true,
    });
    console.log('✅ Super admin created');

    // Create Managers
    console.log('👔 Creating managers...');
    const managers = [];
    for (let i = 0; i < 6; i++) {
      const manager = await User.create({
        nationalId: `222222000${i}`,
        password: 'Test@1234',
        fullName: `مدير ${i + 1}`,
        email: `manager${i}@anjal.edu.sa`,
        phone: `+96652222000${i}`,
        roleId: managerRole._id,
        isActive: true,
      });
      managers.push(manager);
    }
    console.log(`✅ Created ${managers.length} managers`);

    // Create Teachers
    console.log('👨‍🏫 Creating teachers...');
    const teachers = [];
    for (let i = 0; i < 10; i++) {
      const teacher = await User.create({
        nationalId: `444444000${i}`,
        password: 'Test@1234',
        fullName: `معلم ${i + 1}`,
        email: `teacher${i}@anjal.edu.sa`,
        phone: `+96654444000${i}`,
        roleId: teacherRole._id,
        isActive: true,
      });
      teachers.push(teacher);
    }
    console.log(`✅ Created ${teachers.length} teachers`);

    // Create Students
    console.log('👨‍🎓 Creating students...');
    const students = [];
    const arabicProgram = programs.find(p => p.code === 'ARABIC');
    const sixthGrade = grades.find(g => g.level === 6);

    for (let i = 0; i < 15; i++) {
      const student = await User.create({
        nationalId: `555555000${i}`,
        password: `100${i}`,
        fullName: `طالب ${i + 1}`,
        email: `student${i}@anjal.edu.sa`,
        phone: `+96655555000${i}`,
        roleId: studentRole._id,
        isActive: true,
      });

      const schoolIndex = i % schools.length;
      const pin4 = `100${i}`;

      await StudentProfile.create({
        userId: student._id,
        schoolId: schools[schoolIndex]._id,
        programId: arabicProgram!._id,
        gradeId: sixthGrade!._id,
        pin4,
        phone1: `+96650${1000000 + i}`,
        phone2: `+96655${1000000 + i}`,
      });

      students.push(student);
    }
    console.log(`✅ Created ${students.length} students`);

    // Create Questions
    console.log('❓ Creating questions...');
    const mathSubject = subjects.find(s => s.code === 'math');
    const easyCategory = categories.find(c => c.difficulty === 'easy');

    const questions = [];
    for (let i = 0; i < 30; i++) {
      const question = await Question.create({
        questionText: `سؤال رياضيات ${i + 1}`,
        questionType: 'mcq',
        subjectId: mathSubject!._id,
        categoryId: easyCategory!._id,
        marks: 2,
        correctAnswer: 'A',
        isActive: true,
      });
      questions.push(question);
    }
    console.log(`✅ Created ${questions.length} questions`);

    // Create Exams
    console.log('📝 Creating exams...');
    const exams = await Exam.insertMany([
      {
        nameAr: 'اختبار الصف السادس - رياضيات',
        nameEn: 'Grade 6 - Mathematics',
        gradeId: sixthGrade!._id,
        subjectId: mathSubject!._id,
        programId: arabicProgram!._id,
        totalMarks: 60,
        passingMarks: 36,
        duration: 60,
        isActive: true,
      },
      {
        nameAr: 'اختبار الصف السادس - لغة عربية',
        nameEn: 'Grade 6 - Arabic',
        gradeId: sixthGrade!._id,
        subjectId: subjects.find(s => s.code === 'arabic')!._id,
        programId: arabicProgram!._id,
        totalMarks: 50,
        passingMarks: 30,
        duration: 45,
        isActive: true,
      },
      {
        nameAr: 'اختبار الصف السادس - لغة إنجليزية',
        nameEn: 'Grade 6 - English',
        gradeId: sixthGrade!._id,
        subjectId: subjects.find(s => s.code === 'english')!._id,
        programId: arabicProgram!._id,
        totalMarks: 40,
        passingMarks: 24,
        duration: 40,
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${exams.length} exams`);

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      summary: {
        roles: roles.length,
        schools: schools.length,
        programs: programs.length,
        grades: grades.length,
        subjects: subjects.length,
        categories: categories.length,
        users: {
          owner: 1,
          superAdmin: 1,
          managers: managers.length,
          teachers: teachers.length,
          students: students.length,
        },
        questions: questions.length,
        exams: exams.length,
      },
      credentials: {
        owner: { nationalId: '0000000000', password: 'Owner@2025!Ahmed' },
        superAdmin: { nationalId: '1111111111', password: 'Test@1234' },
        manager1: { nationalId: '2222220000', password: 'Test@1234' },
        teacher1: { nationalId: '4444440000', password: 'Test@1234' },
        student1: { nationalId: '5555550000', pin: '1000' },
      },
    });
  } catch (error: any) {
    console.error('❌ Seeding error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

