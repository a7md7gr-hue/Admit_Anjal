// Simple seed script for production MongoDB
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://a7md7gr_db_user:cV3sXCyMMz3Lbmb3@ahmeddb.ipeioqo.mongodb.net/admission_tests?retryWrites=true&w=majority&appName=AhmedDB';

async function seedProduction() {
  try {
    console.log('🌱 Connecting to Production MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected!');

    // Define inline schemas
    const RoleSchema = new mongoose.Schema({ code: String, name: String });
    const SchoolSchema = new mongoose.Schema({ nameAr: String, nameEn: String, gender: String, programType: String });
    const ProgramSchema = new mongoose.Schema({ nameAr: String, nameEn: String, code: String });
    const GradeSchema = new mongoose.Schema({ nameAr: String, nameEn: String, level: Number, stage: String });
    const SubjectSchema = new mongoose.Schema({ nameAr: String, nameEn: String, code: String });
    const CategorySchema = new mongoose.Schema({ nameAr: String, nameEn: String, difficulty: String });
    const UserSchema = new mongoose.Schema({
      nationalId: String,
      password: String,
      fullName: String,
      email: String,
      phone: String,
      roleId: mongoose.Schema.Types.ObjectId,
      isActive: Boolean,
    });
    const StudentProfileSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      schoolId: mongoose.Schema.Types.ObjectId,
      programId: mongoose.Schema.Types.ObjectId,
      gradeId: mongoose.Schema.Types.ObjectId,
      pin4: String,
      phone1: String,
      phone2: String,
    });

    const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
    const School = mongoose.models.School || mongoose.model('School', SchoolSchema);
    const Program = mongoose.models.Program || mongoose.model('Program', ProgramSchema);
    const Grade = mongoose.models.Grade || mongoose.model('Grade', GradeSchema);
    const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
    const QuestionCategory = mongoose.models.QuestionCategory || mongoose.model('QuestionCategory', CategorySchema);
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const StudentProfile = mongoose.models.StudentProfile || mongoose.model('StudentProfile', StudentProfileSchema);

    // Clear existing data
    console.log('🗑️  Clearing old data...');
    await Promise.all([
      Role.deleteMany({}),
      School.deleteMany({}),
      Program.deleteMany({}),
      Grade.deleteMany({}),
      Subject.deleteMany({}),
      QuestionCategory.deleteMany({}),
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
    ]);
    console.log('✅ Cleared!');

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

    // Create Schools
    console.log('🏫 Creating schools...');
    const schools = await School.insertMany([
      { nameAr: 'مدارس الأنجال الأهلية - بنين', nameEn: 'Al-Anjal National - Boys', gender: 'male', programType: 'national' },
      { nameAr: 'مدارس الأنجال الأهلية - بنات', nameEn: 'Al-Anjal National - Girls', gender: 'female', programType: 'national' },
      { nameAr: 'مدارس الأنجال الدولية - بنين', nameEn: 'Al-Anjal International - Boys', gender: 'male', programType: 'international' },
      { nameAr: 'مدارس الأنجال الدولية - بنات', nameEn: 'Al-Anjal International - Girls', gender: 'female', programType: 'international' },
    ]);

    // Create Programs
    console.log('📚 Creating programs...');
    const programs = await Program.insertMany([
      { nameAr: 'عربي', nameEn: 'Arabic Program', code: 'arabic' },
      { nameAr: 'دولي', nameEn: 'International Program', code: 'international' },
    ]);

    // Create Grades
    console.log('🎓 Creating grades...');
    const grades = await Grade.insertMany([
      { nameAr: 'الصف السادس الابتدائي', nameEn: 'Grade 6', level: 6, stage: 'elementary' },
    ]);

    // Create Subjects
    console.log('📖 Creating subjects...');
    const subjects = await Subject.insertMany([
      { nameAr: 'رياضيات', nameEn: 'Mathematics', code: 'math' },
      { nameAr: 'لغة عربية', nameEn: 'Arabic Language', code: 'arabic' },
      { nameAr: 'لغة إنجليزية', nameEn: 'English Language', code: 'english' },
    ]);

    // Get role IDs
    const studentRole = roles.find(r => r.code === 'STUDENT');
    const superAdminRole = roles.find(r => r.code === 'SUPER_ADMIN');
    const managerRole = roles.find(r => r.code === 'MANAGER');
    const teacherRole = roles.find(r => r.code === 'TEACHER');

    // Create Super Admin
    console.log('👨‍💼 Creating Super Admin...');
    await User.create({
      nationalId: '1111111111',
      password: 'Test@1234',
      fullName: 'مدير النظام',
      email: 'admin@anjal.edu.sa',
      phone: '+966511111111',
      roleId: superAdminRole._id,
      isActive: true,
    });

    // Create Managers
    console.log('👔 Creating managers...');
    for (let i = 0; i < 6; i++) {
      await User.create({
        nationalId: `222222000${i}`,
        password: 'Test@1234',
        fullName: `مدير ${i + 1}`,
        email: `manager${i}@anjal.edu.sa`,
        phone: `+96652222000${i}`,
        roleId: managerRole._id,
        isActive: true,
      });
    }

    // Create Teachers
    console.log('👨‍🏫 Creating teachers...');
    for (let i = 0; i < 10; i++) {
      await User.create({
        nationalId: `444444000${i}`,
        password: 'Test@1234',
        fullName: `معلم ${i + 1}`,
        email: `teacher${i}@anjal.edu.sa`,
        phone: `+96654444000${i}`,
        roleId: teacherRole._id,
        isActive: true,
      });
    }

    // Create Students
    console.log('👨‍🎓 Creating students...');
    const arabicProgram = programs.find(p => p.code === 'arabic');
    const sixthGrade = grades[0];

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
        programId: arabicProgram._id,
        gradeId: sixthGrade._id,
        pin4,
        phone1: `+96650${1000000 + i}`,
        phone2: `+96655${1000000 + i}`,
      });
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n🔐 Login Credentials:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ SUPER ADMIN                             │');
    console.log('│ National ID: 1111111111                 │');
    console.log('│ Password: Test@1234                     │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ STUDENT 1                               │');
    console.log('│ National ID: 5555550000                 │');
    console.log('│ PIN: 1000                               │');
    console.log('└─────────────────────────────────────────┘\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
  }
}

seedProduction();


