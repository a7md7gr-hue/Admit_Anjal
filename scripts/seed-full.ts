import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../src/lib/mongodb";
import {
  Role,
  School,
  Program,
  Grade,
  Subject,
  QuestionCategory,
  User,
  StudentProfile,
  PasswordReset,
  Question,
  QuestionOption,
  Exam,
  ExamBlueprint,
  Application,
  ManagerAssignment,
  TeacherAssignment,
} from "../src/models";

const DEFAULT_PASSWORD = "Test@1234";

async function seed() {
  try {
    console.log("🌱 Starting comprehensive database seeding...");

    await connectDB();

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      Role.deleteMany({}),
      School.deleteMany({}),
      Program.deleteMany({}),
      Grade.deleteMany({}),
      Subject.deleteMany({}),
      QuestionCategory.deleteMany({}),
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      PasswordReset.deleteMany({}),
      Question.deleteMany({}),
      QuestionOption.deleteMany({}),
      Exam.deleteMany({}),
      ExamBlueprint.deleteMany({}),
      Application.deleteMany({}),
      ManagerAssignment.deleteMany({}),
      TeacherAssignment.deleteMany({}),
    ]);

    // 1. Roles
    console.log("📋 Creating roles...");
    const roles = await Role.insertMany([
      { code: "STUDENT", name: "طالب" },
      { code: "TEACHER", name: "معلم" },
      { code: "SUPERVISOR", name: "مشرف" },
      { code: "MANAGER", name: "مدير مدرسة" },
      { code: "SUPER_ADMIN", name: "مدير النظام" },
      { code: "OWNER", name: "المالك" },
    ]);

    const studentRole = roles.find((r) => r.code === "STUDENT");
    const teacherRole = roles.find((r) => r.code === "TEACHER");
    const supervisorRole = roles.find((r) => r.code === "SUPERVISOR");
    const managerRole = roles.find((r) => r.code === "MANAGER");
    const superAdminRole = roles.find((r) => r.code === "SUPER_ADMIN");
    const ownerRole = roles.find((r) => r.code === "OWNER");

    // 2. Schools
    console.log("🏫 Creating schools...");
    const schools = await School.insertMany([
      { shortCode: "ANJ_AR_B", name: "الأنجال الأهلية - عربي بنين" },
      { shortCode: "ANJ_AR_G", name: "الأنجال الأهلية - عربي بنات" },
      { shortCode: "ANJ_INT_B", name: "الأنجال الدولية - دولي بنين" },
      { shortCode: "ANJ_INT_G", name: "الأنجال الدولية - دولي بنات" },
      { shortCode: "ANJ_PRIM", name: "الأنجال - ابتدائي" },
      { shortCode: "ANJ_SEC", name: "الأنجال - ثانوي" },
    ]);

    // 3. Programs
    console.log("📚 Creating programs...");
    const programs = await Program.insertMany([
      { code: "ARABIC", name: "المسار العربي" },
      { code: "INTERNATIONAL", name: "المسار الدولي" },
    ]);

    const arabicProgram = programs.find((p) => p.code === "ARABIC");
    const intProgram = programs.find((p) => p.code === "INTERNATIONAL");

    // 4. Grades
    console.log("🎓 Creating grades...");
    const grades = await Grade.insertMany([
      { code: "G1", name: "الصف الأول" },
      { code: "G2", name: "الصف الثاني" },
      { code: "G3", name: "الصف الثالث" },
      { code: "G4", name: "الصف الرابع" },
      { code: "G5", name: "الصف الخامس" },
      { code: "G6", name: "الصف السادس" },
    ]);

    // 5. Subjects
    console.log("📖 Creating subjects...");
    const subjects = await Subject.insertMany([
      { code: "ARABIC", name: "اللغة العربية" },
      { code: "MATH", name: "الرياضيات" },
      { code: "SCIENCE", name: "العلوم" },
      { code: "ENGLISH", name: "اللغة الإنجليزية" },
      { code: "SOCIAL", name: "الدراسات الاجتماعية" },
    ]);

    const arabicSubject = subjects.find((s) => s.code === "ARABIC");
    const mathSubject = subjects.find((s) => s.code === "MATH");
    const scienceSubject = subjects.find((s) => s.code === "SCIENCE");

    // 6. Question Categories
    console.log("🏷️  Creating question categories...");
    const categories = await QuestionCategory.insertMany([
      { code: "COMPREHENSION", name: "فهم واستيعاب" },
      { code: "APPLICATION", name: "تطبيق" },
      { code: "ANALYSIS", name: "تحليل" },
      { code: "MEMORY", name: "تذكر" },
    ]);

    const comprehensionCat = categories.find((c) => c.code === "COMPREHENSION");
    const applicationCat = categories.find((c) => c.code === "APPLICATION");

    // 7. Owner User (Secret)
    console.log("👑 Creating owner account...");
    const ownerPassword = await bcrypt.hash("Owner@2025!Ahmed", 10);
    const ownerUser = await User.create({
      fullName: "أحمد حجر - المالك",
      nationalId: "0000000000",
      password: ownerPassword,
      roleId: ownerRole!._id,
    });

    // 8. Admin Users
    console.log("👨‍💼 Creating admin users...");
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 8);

    const superAdmin = await User.create({
      fullName: "مدير النظام الرئيسي",
      nationalId: "1111111111",
      password: hashedPassword,
      roleId: superAdminRole!._id,
    });

    await PasswordReset.create({
      userId: superAdmin._id,
      mustChangePassword: true,
    });

    // 9. Managers (6 managers, one per school)
    console.log("👔 Creating managers...");
    const managerUsers = [];
    const managerNames = [
      "مدير مدرسة عربي بنين",
      "مديرة مدرسة عربي بنات",
      "مدير مدرسة دولي بنين",
      "مديرة مدرسة دولي بنات",
      "مدير المرحلة الابتدائية",
      "مدير المرحلة الثانوية",
    ];

    for (let i = 0; i < schools.length; i++) {
      const nationalId = `222222${i.toString().padStart(4, "0")}`;
      const manager = await User.create({
        fullName: managerNames[i],
        nationalId,
        password: hashedPassword,
        roleId: managerRole!._id,
      });

      await PasswordReset.create({
        userId: manager._id,
        mustChangePassword: true,
      });

      await ManagerAssignment.create({
        managerId: manager._id,
        schoolId: schools[i]._id,
      });

      managerUsers.push(manager);
    }

    // 10. Teachers (10 teachers)
    console.log("👨‍🏫 Creating teachers...");
    const teacherUsers = [];
    const teacherSubjects = [
      { name: "أ. محمد - لغة عربية", subjectId: arabicSubject!._id },
      { name: "أ. فاطمة - لغة عربية", subjectId: arabicSubject!._id },
      { name: "أ. علي - رياضيات", subjectId: mathSubject!._id },
      { name: "أ. نور - رياضيات", subjectId: mathSubject!._id },
      { name: "أ. سارة - علوم", subjectId: scienceSubject!._id },
      { name: "أ. خالد - علوم", subjectId: scienceSubject!._id },
      { name: "أ. ليلى - لغة عربية", subjectId: arabicSubject!._id },
      { name: "أ. أحمد - رياضيات", subjectId: mathSubject!._id },
      { name: "أ. منى - علوم", subjectId: scienceSubject!._id },
      { name: "أ. يوسف - لغة عربية", subjectId: arabicSubject!._id },
    ];

    for (let i = 0; i < teacherSubjects.length; i++) {
      const nationalId = `444444${i.toString().padStart(4, "0")}`;
      const teacher = await User.create({
        fullName: teacherSubjects[i].name,
        nationalId,
        password: hashedPassword,
        roleId: teacherRole!._id,
      });

      await PasswordReset.create({
        userId: teacher._id,
        mustChangePassword: true,
      });

      teacherUsers.push({
        user: teacher,
        subjectId: teacherSubjects[i].subjectId,
      });
    }

    // 11. Questions (30+ questions)
    console.log("❓ Creating questions...");
    const questions = [];

    // Arabic MCQ Questions
    for (let i = 1; i <= 10; i++) {
      const question = await Question.create({
        subjectId: arabicSubject!._id,
        programId: arabicProgram!._id,
        gradeId: grades[2]._id, // G3
        categoryId: comprehensionCat!._id,
        questionType: "mcq",
        questionText: `سؤال لغة عربية رقم ${i}: ما معنى كلمة "التعاون"؟`,
      });

      await QuestionOption.insertMany([
        {
          questionId: question._id,
          optionText: "العمل الجماعي",
          isCorrect: true,
        },
        {
          questionId: question._id,
          optionText: "العمل الفردي",
          isCorrect: false,
        },
        { questionId: question._id, optionText: "اللعب", isCorrect: false },
        { questionId: question._id, optionText: "النوم", isCorrect: false },
      ]);

      questions.push(question);
    }

    // Math MCQ Questions
    for (let i = 1; i <= 10; i++) {
      const question = await Question.create({
        subjectId: mathSubject!._id,
        programId: arabicProgram!._id,
        gradeId: grades[2]._id,
        categoryId: applicationCat!._id,
        questionType: "mcq",
        questionText: `سؤال رياضيات رقم ${i}: كم ناتج ${i} + ${i}؟`,
      });

      await QuestionOption.insertMany([
        { questionId: question._id, optionText: `${i * 2}`, isCorrect: true },
        {
          questionId: question._id,
          optionText: `${i * 2 + 1}`,
          isCorrect: false,
        },
        {
          questionId: question._id,
          optionText: `${i * 2 - 1}`,
          isCorrect: false,
        },
        { questionId: question._id, optionText: `${i * 3}`, isCorrect: false },
      ]);

      questions.push(question);
    }

    // Science MCQ Questions
    for (let i = 1; i <= 10; i++) {
      const question = await Question.create({
        subjectId: scienceSubject!._id,
        programId: arabicProgram!._id,
        gradeId: grades[2]._id,
        categoryId: comprehensionCat!._id,
        questionType: "mcq",
        questionText: `سؤال علوم رقم ${i}: ما هو مصدر الضوء الرئيسي للأرض؟`,
      });

      await QuestionOption.insertMany([
        { questionId: question._id, optionText: "الشمس", isCorrect: true },
        { questionId: question._id, optionText: "القمر", isCorrect: false },
        { questionId: question._id, optionText: "النجوم", isCorrect: false },
        { questionId: question._id, optionText: "الكواكب", isCorrect: false },
      ]);

      questions.push(question);
    }

    // 12. Exams (5 exams)
    console.log("📝 Creating exams...");
    const exams = [];

    const exam1 = await Exam.create({
      name: "اختبار اللغة العربية - الصف الثالث",
      subjectId: arabicSubject!._id,
      programId: arabicProgram!._id,
      gradeId: grades[2]._id,
      isActive: true,
    });
    exams.push(exam1);

    const exam2 = await Exam.create({
      name: "اختبار الرياضيات - الصف الثالث",
      subjectId: mathSubject!._id,
      programId: arabicProgram!._id,
      gradeId: grades[2]._id,
      isActive: true,
    });
    exams.push(exam2);

    const exam3 = await Exam.create({
      name: "اختبار العلوم - الصف الثالث",
      subjectId: scienceSubject!._id,
      programId: arabicProgram!._id,
      gradeId: grades[2]._id,
      isActive: true,
    });
    exams.push(exam3);

    // 13. Exam Blueprints (assign questions to exams)
    console.log("🗺️  Creating exam blueprints...");

    // Exam 1: 10 Arabic questions
    for (let i = 0; i < 10; i++) {
      await ExamBlueprint.create({
        examId: exam1._id,
        questionId: questions[i]._id,
        order: i + 1,
      });
    }

    // Exam 2: 10 Math questions
    for (let i = 10; i < 20; i++) {
      await ExamBlueprint.create({
        examId: exam2._id,
        questionId: questions[i]._id,
        order: i - 9,
      });
    }

    // Exam 3: 10 Science questions
    for (let i = 20; i < 30; i++) {
      await ExamBlueprint.create({
        examId: exam3._id,
        questionId: questions[i]._id,
        order: i - 19,
      });
    }

    // 14. Assign teachers to exams
    console.log("📌 Assigning teachers to exams...");
    await TeacherAssignment.create({
      teacherId: teacherUsers[0].user._id,
      examId: exam1._id,
      subjectId: arabicSubject!._id,
    });

    await TeacherAssignment.create({
      teacherId: teacherUsers[2].user._id,
      examId: exam2._id,
      subjectId: mathSubject!._id,
    });

    await TeacherAssignment.create({
      teacherId: teacherUsers[4].user._id,
      examId: exam3._id,
      subjectId: scienceSubject!._id,
    });

    // 15. Students (15 students)
    console.log("👨‍🎓 Creating students...");
    const studentNames = [
      "أحمد محمد علي",
      "فاطمة حسن أحمد",
      "محمد عبدالله سالم",
      "نور خالد محمود",
      "علي يوسف إبراهيم",
      "سارة أحمد حسن",
      "خالد محمد عبدالله",
      "ليلى حسن علي",
      "يوسف إبراهيم محمد",
      "منى سالم أحمد",
      "عبدالله علي حسن",
      "هدى محمود خالد",
      "إبراهيم أحمد سالم",
      "ريم حسن محمد",
      "سالم علي عبدالله",
    ];

    for (let i = 0; i < studentNames.length; i++) {
      const nationalId = `555555${i.toString().padStart(4, "0")}`;
      const pin4 = (1000 + i).toString();

      const student = await User.create({
        fullName: studentNames[i],
        nationalId,
        roleId: studentRole!._id,
      });

      const schoolIndex = i % schools.length;

      await StudentProfile.create({
        userId: student._id,
        schoolId: schools[schoolIndex]._id,
        programId: arabicProgram!._id,
        gradeId: grades[2]._id,
        pin4,
        phone1: `+96650${1000000 + i}`,
        phone2: `+96655${1000000 + i}`,
      });

      await Application.create({
        studentId: student._id,
        schoolId: schools[schoolIndex]._id,
        programId: arabicProgram!._id,
        gradeId: grades[2]._id,
        academicYear: "2024-2025",
        status: "APPROVED",
      });
    }

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${roles.length} roles`);
    console.log(`   - ${schools.length} schools`);
    console.log(`   - ${programs.length} programs`);
    console.log(`   - ${grades.length} grades`);
    console.log(`   - ${subjects.length} subjects`);
    console.log(`   - ${categories.length} question categories`);
    console.log(`   - 1 owner (أحمد حجر)`);
    console.log(`   - 1 super admin`);
    console.log(`   - ${managerUsers.length} managers`);
    console.log(`   - ${teacherUsers.length} teachers`);
    console.log(`   - ${questions.length} questions`);
    console.log(`   - ${exams.length} exams`);
    console.log(`   - 15 students`);

    console.log("\n🔐 Login Credentials:");
    console.log("┌─────────────────────────────────────────────────┐");
    console.log("│ OWNER (Secret - Ahmed Hagr)                    │");
    console.log("│ National ID: 0000000000                         │");
    console.log("│ Password: Owner@2025!Ahmed                      │");
    console.log("├─────────────────────────────────────────────────┤");
    console.log("│ SUPER ADMIN                                     │");
    console.log("│ National ID: 1111111111                         │");
    console.log("│ Password: Test@1234                             │");
    console.log("├─────────────────────────────────────────────────┤");
    console.log("│ MANAGERS (6 users)                              │");
    console.log("│ National IDs: 2222220000 to 2222220005          │");
    console.log("│ Password: Test@1234                             │");
    console.log("├─────────────────────────────────────────────────┤");
    console.log("│ TEACHERS (10 users)                             │");
    console.log("│ National IDs: 4444440000 to 4444440009          │");
    console.log("│ Password: Test@1234                             │");
    console.log("├─────────────────────────────────────────────────┤");
    console.log("│ STUDENTS (15 users)                             │");
    console.log("│ National IDs: 5555550000 to 5555550014          │");
    console.log("│ PINs: 1000 to 1014                              │");
    console.log("└─────────────────────────────────────────────────┘");

    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
