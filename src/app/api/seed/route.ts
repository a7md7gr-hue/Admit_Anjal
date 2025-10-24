import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
import PasswordReset from '@/models/PasswordReset';

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
      PasswordReset.deleteMany({}),
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

    // Create Grades (من ثالث إلى ثاني ثانوي - 10 صفوف)
    console.log('🎓 Creating grades...');
    const grades = await Grade.insertMany([
      { code: 'G3', name: 'الصف الثالث الابتدائي' },
      { code: 'G4', name: 'الصف الرابع الابتدائي' },
      { code: 'G5', name: 'الصف الخامس الابتدائي' },
      { code: 'G6', name: 'الصف السادس الابتدائي' },
      { code: 'G7', name: 'الصف الأول المتوسط' },
      { code: 'G8', name: 'الصف الثاني المتوسط' },
      { code: 'G9', name: 'الصف الثالث المتوسط' },
      { code: 'G10', name: 'الصف الأول الثانوي' },
      { code: 'G11', name: 'الصف الثاني الثانوي' },
      { code: 'G12', name: 'الصف الثالث الثانوي' },
    ]);
    console.log(`✅ Created ${grades.length} grades`);

    // Create Subjects (4 subjects only - no social studies)
    console.log('📖 Creating subjects...');
    const subjects = await Subject.insertMany([
      { code: 'ARABIC', name: 'لغة عربية' },
      { code: 'ENGLISH', name: 'لغة إنجليزية' },
      { code: 'MATH', name: 'رياضيات' },
      { code: 'SCIENCE', name: 'علوم' },
    ]);
    console.log(`✅ Created ${subjects.length} subjects`);

    // Create Question Categories
    console.log('🏷️  Creating question categories...');
    const categories = await QuestionCategory.insertMany([
      { code: 'EASY', name: 'سهل' },
      { code: 'MEDIUM', name: 'متوسط' },
      { code: 'HARD', name: 'صعب' },
      { code: 'CHALLENGE', name: 'تحدي' },
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

    // Create Super Admin
    console.log('👨‍💼 Creating super admin...');
    const hashedPassword = await bcrypt.hash('Test@1234', 10);
    const superAdmin = await User.create({
      nationalId: '1111111111',
      password: hashedPassword,
      fullName: 'مدير النظام',
      email: 'admin@anjal.edu.sa',
      phone: '+966511111111',
      roleId: superAdminRole._id,
      isActive: true,
    });
    console.log('✅ Super admin created');

    // Create Managers - واحد لكل مدرسة
    console.log('👔 Creating managers...');
    const managers = [];
    const hashedManagerPassword = await bcrypt.hash('Test@1234', 10);
    
    const managerData = [
      { name: 'أحمد محمد - مدير', school: 'ANB', fullName: 'أحمد محمد (مدير - الأهلية بنين)' },
      { name: 'فاطمة أحمد - مديرة', school: 'ANG', fullName: 'فاطمة أحمد (مديرة - الأهلية بنات)' },
      { name: 'خالد سالم - مدير', school: 'AIB', fullName: 'خالد سالم (مدير - الدولية بنين)' },
      { name: 'نورة عبدالله - مديرة', school: 'AIG', fullName: 'نورة عبدالله (مديرة - الدولية بنات)' },
      { name: 'سعد الغامدي - مدير', school: 'AKAC', fullName: 'سعد الغامدي (مدير - مدينة الملك عبدالله)' },
      { name: 'ريم القحطاني - مديرة', school: 'ARC', fullName: 'ريم القحطاني (مديرة - مدينة الرياض)' },
    ];
    
    for (let i = 0; i < managerData.length; i++) {
      const manager = await User.create({
        nationalId: `222222${String(i).padStart(4, '0')}`,
        password: hashedManagerPassword,
        fullName: managerData[i].fullName,
        email: `manager${i}@anjal.edu.sa`,
        phone: `+96652222000${i}`,
        roleId: managerRole._id,
        isActive: true,
      });
      managers.push(manager);
      
      // Set mustChangePassword for first login
      await PasswordReset.create({
        userId: manager._id,
        mustChangePassword: true,
      });
    }
    console.log(`✅ Created ${managers.length} managers`);

    // Create Teachers - معلم واحد لكل مادة
    console.log('👨‍🏫 Creating teachers...');
    const teachers = [];
    const hashedTeacherPassword = await bcrypt.hash('Test@1234', 10);
    
    const teacherData = [
      { name: 'محمد العمري', subject: 'عربي', school: 'ANB', program: 'عربي', grades: 'G3-G6', fullName: 'محمد العمري (عربي - الأهلية بنين - G3-G6)' },
      { name: 'سارة أحمد', subject: 'إنجليزي', school: 'ANG', program: 'عربي', grades: 'G3-G6', fullName: 'سارة أحمد (إنجليزي - الأهلية بنات - G3-G6)' },
      { name: 'عبدالله حسن', subject: 'رياضيات', school: 'AIB', program: 'دولي', grades: 'G7-G9', fullName: 'عبدالله حسن (رياضيات - الدولية بنين - G7-G9)' },
      { name: 'منى خالد', subject: 'علوم', school: 'AIG', program: 'دولي', grades: 'G7-G9', fullName: 'منى خالد (علوم - الدولية بنات - G7-G9)' },
      { name: 'يوسف الدوسري', subject: 'عربي', school: 'AKAC', program: 'عربي', grades: 'G10-G12', fullName: 'يوسف الدوسري (عربي - الملك عبدالله - G10-G12)' },
      { name: 'هند المطيري', subject: 'إنجليزي', school: 'ARC', program: 'عربي', grades: 'G10-G12', fullName: 'هند المطيري (إنجليزي - الرياض - G10-G12)' },
    ];
    
    for (let i = 0; i < teacherData.length; i++) {
      const teacher = await User.create({
        nationalId: `444444${String(i).padStart(4, '0')}`,
        password: hashedTeacherPassword,
        fullName: teacherData[i].fullName,
        email: `teacher${i}@anjal.edu.sa`,
        phone: `+96654444000${i}`,
        roleId: teacherRole._id,
        isActive: true,
      });
      teachers.push(teacher);
      
      // Set mustChangePassword for first login
      await PasswordReset.create({
        userId: teacher._id,
        mustChangePassword: true,
      });
    }
    console.log(`✅ Created ${teachers.length} teachers`);

    // Create Students - طالبين من كل مدرسة وصف
    console.log('👨‍🎓 Creating students...');
    const students = [];
    const arabicProgram = programs.find(p => p.code === 'ARABIC');
    const internationalProgram = programs.find(p => p.code === 'INTERNATIONAL');
    
    const studentData = [
      // الأهلية بنين - عربي
      { name: 'أحمد سعيد', school: 'ANB', program: 'ARABIC', grade: 'G3', pin: '1001' },
      { name: 'خالد محمد', school: 'ANB', program: 'ARABIC', grade: 'G6', pin: '1002' },
      
      // الأهلية بنات - عربي
      { name: 'فاطمة أحمد', school: 'ANG', program: 'ARABIC', grade: 'G4', pin: '1003' },
      { name: 'نورة سالم', school: 'ANG', program: 'ARABIC', grade: 'G5', pin: '1004' },
      
      // الدولية بنين - دولي
      { name: 'عبدالله عمر', school: 'AIB', program: 'INTERNATIONAL', grade: 'G7', pin: '1005' },
      { name: 'سعد يوسف', school: 'AIB', program: 'INTERNATIONAL', grade: 'G8', pin: '1006' },
      
      // الدولية بنات - دولي
      { name: 'سارة علي', school: 'AIG', program: 'INTERNATIONAL', grade: 'G9', pin: '1007' },
      { name: 'منى حسن', school: 'AIG', program: 'INTERNATIONAL', grade: 'G10', pin: '1008' },
      
      // مدينة الملك عبدالله - عربي
      { name: 'يوسف إبراهيم', school: 'AKAC', program: 'ARABIC', grade: 'G11', pin: '1009' },
      { name: 'عمر خالد', school: 'AKAC', program: 'ARABIC', grade: 'G12', pin: '1010' },
      
      // مدينة الرياض - عربي
      { name: 'ريم عبدالله', school: 'ARC', program: 'ARABIC', grade: 'G3', pin: '1011' },
      { name: 'هند محمد', school: 'ARC', program: 'ARABIC', grade: 'G6', pin: '1012' },
    ];

    for (let i = 0; i < studentData.length; i++) {
      const data = studentData[i];
      const hashedStudentPassword = await bcrypt.hash(data.pin, 10);
      
      const school = schools.find(s => s.shortCode === data.school);
      const program = programs.find(p => p.code === data.program);
      const grade = grades.find(g => g.code === data.grade);
      
      const student = await User.create({
        nationalId: `555555${String(i).padStart(4, '0')}`,
        password: hashedStudentPassword,
        fullName: `${data.name} (${grade?.name} - ${school?.name})`,
        email: `student${i}@anjal.edu.sa`,
        phone: `+96655555000${i}`,
        roleId: studentRole._id,
        isActive: true,
      });

      await StudentProfile.create({
        userId: student._id,
        schoolId: school!._id,
        programId: program!._id,
        gradeId: grade!._id,
        pin4: data.pin,
        phone1: `+96650${1000000 + i}`,
        phone2: `+96655${1000000 + i}`,
      });

      students.push(student);
    }
    console.log(`✅ Created ${students.length} students`);

    // Create Questions
    console.log('❓ Creating questions...');
    const mathSubject = subjects.find(s => s.code === 'MATH');
    const sixthGrade = grades.find(g => g.code === 'G6');

    const questions = [];
    for (let i = 0; i < 30; i++) {
      const question = await Question.create({
        questionText: `سؤال رياضيات ${i + 1}: كم يساوي ${i + 1} + ${i + 1}؟`,
        questionType: 'mcq',
        subjectId: mathSubject!._id,
        programId: arabicProgram!._id,
        gradeId: sixthGrade!._id,
        points: 2,
        isApproved: true,
      });
      questions.push(question);
    }
    console.log(`✅ Created ${questions.length} questions`);

    // Create Exams
    console.log('📝 Creating exams...');
    const exams = await Exam.insertMany([
      {
        name: 'اختبار الصف السادس - رياضيات',
        gradeId: sixthGrade!._id,
        subjectId: mathSubject!._id,
        programId: arabicProgram!._id,
        isActive: true,
      },
      {
        name: 'اختبار الصف السادس - لغة عربية',
        gradeId: sixthGrade!._id,
        subjectId: subjects.find(s => s.code === 'ARABIC')!._id,
        programId: arabicProgram!._id,
        isActive: true,
      },
      {
        name: 'اختبار الصف السادس - لغة إنجليزية',
        gradeId: sixthGrade!._id,
        subjectId: subjects.find(s => s.code === 'ENGLISH')!._id,
        programId: arabicProgram!._id,
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
          superAdmin: 1,
          managers: managers.length,
          teachers: teachers.length,
          students: students.length,
        },
        questions: questions.length,
        exams: exams.length,
      },
      credentials: {
        superAdmin: { 
          nationalId: '1111111111', 
          password: 'Test@1234',
          email: 'admin@anjal.edu.sa' 
        },
        managers: [
          { nationalId: '2222220000', password: 'Test@1234', name: 'أحمد محمد (الأهلية بنين)' },
          { nationalId: '2222220001', password: 'Test@1234', name: 'فاطمة أحمد (الأهلية بنات)' },
          { nationalId: '2222220002', password: 'Test@1234', name: 'خالد سالم (الدولية بنين)' },
          { nationalId: '2222220003', password: 'Test@1234', name: 'نورة عبدالله (الدولية بنات)' },
          { nationalId: '2222220004', password: 'Test@1234', name: 'سعد الغامدي (الملك عبدالله)' },
          { nationalId: '2222220005', password: 'Test@1234', name: 'ريم القحطاني (الرياض)' },
        ],
        teachers: [
          { nationalId: '4444440000', password: 'Test@1234', name: 'محمد العمري (عربي - الأهلية بنين - G3-G6)' },
          { nationalId: '4444440001', password: 'Test@1234', name: 'سارة أحمد (إنجليزي - الأهلية بنات - G3-G6)' },
          { nationalId: '4444440002', password: 'Test@1234', name: 'عبدالله حسن (رياضيات - الدولية بنين - G7-G9)' },
          { nationalId: '4444440003', password: 'Test@1234', name: 'منى خالد (علوم - الدولية بنات - G7-G9)' },
          { nationalId: '4444440004', password: 'Test@1234', name: 'يوسف الدوسري (عربي - الملك عبدالله - G10-G12)' },
          { nationalId: '4444440005', password: 'Test@1234', name: 'هند المطيري (إنجليزي - الرياض - G10-G12)' },
        ],
        students: [
          { nationalId: '5555550000', pin: '1001', name: 'أحمد سعيد (G3 - الأهلية بنين)' },
          { nationalId: '5555550001', pin: '1002', name: 'خالد محمد (G6 - الأهلية بنين)' },
          { nationalId: '5555550002', pin: '1003', name: 'فاطمة أحمد (G4 - الأهلية بنات)' },
          { nationalId: '5555550003', pin: '1004', name: 'نورة سالم (G5 - الأهلية بنات)' },
          { nationalId: '5555550004', pin: '1005', name: 'عبدالله عمر (G7 - الدولية بنين)' },
          { nationalId: '5555550005', pin: '1006', name: 'سعد يوسف (G8 - الدولية بنين)' },
          { nationalId: '5555550006', pin: '1007', name: 'سارة علي (G9 - الدولية بنات)' },
          { nationalId: '5555550007', pin: '1008', name: 'منى حسن (G10 - الدولية بنات)' },
          { nationalId: '5555550008', pin: '1009', name: 'يوسف إبراهيم (G11 - الملك عبدالله)' },
          { nationalId: '5555550009', pin: '1010', name: 'عمر خالد (G12 - الملك عبدالله)' },
          { nationalId: '5555550010', pin: '1011', name: 'ريم عبدالله (G3 - الرياض)' },
          { nationalId: '5555550011', pin: '1012', name: 'هند محمد (G6 - الرياض)' },
        ],
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

