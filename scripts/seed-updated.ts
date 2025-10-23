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
  TeacherAssignment,
  ManagerAssignment,
  SchoolGrade,
  SubjectWeight,
} from "../src/models";

const DEFAULT_PASSWORD = "Test@1234";

async function seed() {
  try {
    console.log("🌱 Starting updated database seeding...\n");

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
      TeacherAssignment.deleteMany({}),
      ManagerAssignment.deleteMany({}),
      SchoolGrade.deleteMany({}),
      SubjectWeight.deleteMany({}),
    ]);

    // 1. Create Roles
    console.log("📋 Creating roles...");
    const roles = await Role.insertMany([
      { code: "OWNER", name: "System Owner" },
      { code: "SUPER_ADMIN", name: "Super Admin" },
      { code: "MANAGER", name: "School Manager" },
      { code: "SUPERVISOR", name: "Supervisor" },
      { code: "TEACHER", name: "Teacher" },
      { code: "STUDENT", name: "Student" },
    ]);

    const ownerRole = roles.find((r) => r.code === "OWNER");
    const superAdminRole = roles.find((r) => r.code === "SUPER_ADMIN");
    const managerRole = roles.find((r) => r.code === "MANAGER");
    const supervisorRole = roles.find((r) => r.code === "SUPERVISOR");
    const teacherRole = roles.find((r) => r.code === "TEACHER");
    const studentRole = roles.find((r) => r.code === "STUDENT");

    // 2. Create Schools (6 schools)
    console.log("🏫 Creating schools...");
    const schools = await School.insertMany([
      { shortCode: "GP_E", name: "بنات ابتدائي" },
      { shortCode: "BP_E", name: "بنين ابتدائي" },
      { shortCode: "GP_M", name: "بنات متوسط" },
      { shortCode: "BP_M", name: "بنين متوسط" },
      { shortCode: "GP_H", name: "بنات ثانوي" },
      { shortCode: "BP_H", name: "بنين ثانوي" },
    ]);

    const girlsPrimary = schools.find((s) => s.shortCode === "GP_E");
    const boysPrimary = schools.find((s) => s.shortCode === "BP_E");
    const girlsMiddle = schools.find((s) => s.shortCode === "GP_M");
    const boysMiddle = schools.find((s) => s.shortCode === "BP_M");
    const girlsHigh = schools.find((s) => s.shortCode === "GP_H");
    const boysHigh = schools.find((s) => s.shortCode === "BP_H");

    // 3. Create Programs
    console.log("📚 Creating programs...");
    const programs = await Program.insertMany([
      { code: "ARABIC", name: "عربي" },
      { code: "INTERNATIONAL", name: "دولي" },
    ]);

    // 4. Create Grades (G3-G12)
    console.log("🎓 Creating grades...");
    const grades = await Grade.insertMany([
      { code: "G3", name: "الصف الثالث" },
      { code: "G4", name: "الصف الرابع" },
      { code: "G5", name: "الصف الخامس" },
      { code: "G6", name: "الصف السادس" },
      { code: "G7", name: "الصف السابع" },
      { code: "G8", name: "الصف الثامن" },
      { code: "G9", name: "الصف التاسع" },
      { code: "G10", name: "الصف العاشر" },
      { code: "G11", name: "الصف الحادي عشر" },
      { code: "G12", name: "الصف الثاني عشر" },
    ]);

    const g3 = grades.find((g) => g.code === "G3");
    const g4 = grades.find((g) => g.code === "G4");
    const g5 = grades.find((g) => g.code === "G5");
    const g6 = grades.find((g) => g.code === "G6");
    const g7 = grades.find((g) => g.code === "G7");
    const g8 = grades.find((g) => g.code === "G8");
    const g9 = grades.find((g) => g.code === "G9");
    const g10 = grades.find((g) => g.code === "G10");
    const g11 = grades.find((g) => g.code === "G11");
    const g12 = grades.find((g) => g.code === "G12");

    // 5. Create School-Grade Mappings
    console.log("🔗 Creating school-grade mappings...");
    const schoolGradeMappings = [];

    // بنات ابتدائي: G3,4,5,6
    if (girlsPrimary && g3 && g4 && g5 && g6) {
      schoolGradeMappings.push(
        { schoolId: girlsPrimary._id, gradeId: g3._id },
        { schoolId: girlsPrimary._id, gradeId: g4._id },
        { schoolId: girlsPrimary._id, gradeId: g5._id },
        { schoolId: girlsPrimary._id, gradeId: g6._id },
      );
    }

    // بنين ابتدائي: G4,5,6 (no G3)
    if (boysPrimary && g4 && g5 && g6) {
      schoolGradeMappings.push(
        { schoolId: boysPrimary._id, gradeId: g4._id },
        { schoolId: boysPrimary._id, gradeId: g5._id },
        { schoolId: boysPrimary._id, gradeId: g6._id },
      );
    }

    // متوسط (بنين وبنات): G7,8,9
    if (girlsMiddle && boysMiddle && g7 && g8 && g9) {
      schoolGradeMappings.push(
        { schoolId: girlsMiddle._id, gradeId: g7._id },
        { schoolId: girlsMiddle._id, gradeId: g8._id },
        { schoolId: girlsMiddle._id, gradeId: g9._id },
        { schoolId: boysMiddle._id, gradeId: g7._id },
        { schoolId: boysMiddle._id, gradeId: g8._id },
        { schoolId: boysMiddle._id, gradeId: g9._id },
      );
    }

    // ثانوي (بنين وبنات): G10,11,12
    if (girlsHigh && boysHigh && g10 && g11 && g12) {
      schoolGradeMappings.push(
        { schoolId: girlsHigh._id, gradeId: g10._id },
        { schoolId: girlsHigh._id, gradeId: g11._id },
        { schoolId: girlsHigh._id, gradeId: g12._id },
        { schoolId: boysHigh._id, gradeId: g10._id },
        { schoolId: boysHigh._id, gradeId: g11._id },
        { schoolId: boysHigh._id, gradeId: g12._id },
      );
    }

    await SchoolGrade.insertMany(schoolGradeMappings);

    // 6. Create Subjects (4 subjects only)
    console.log("📖 Creating subjects...");
    const subjects = await Subject.insertMany([
      { code: "AR", name: "عربي" },
      { code: "MATH", name: "رياضيات" },
      { code: "SCI", name: "علوم" },
      { code: "EN", name: "إنجليزي" },
    ]);

    const arabic = subjects.find((s) => s.code === "AR");
    const math = subjects.find((s) => s.code === "MATH");
    const science = subjects.find((s) => s.code === "SCI");
    const english = subjects.find((s) => s.code === "EN");

    // 7. Create Subject Weights (25% for each subject by default)
    console.log("⚖️  Creating subject weights...");
    const weightMappings = [];
    for (const school of schools) {
      for (const subject of subjects) {
        weightMappings.push({
          schoolId: school._id,
          subjectId: subject._id,
          weight: 25, // 25% default
        });
      }
    }
    await SubjectWeight.insertMany(weightMappings);

    // 8. Create Question Categories
    console.log("🏷️  Creating question categories...");
    const categories = await QuestionCategory.insertMany([
      { code: "MCQ", name: "اختيار من متعدد" },
      { code: "TRUE_FALSE", name: "صح/خطأ" },
      { code: "ESSAY", name: "مقالي" },
      { code: "ORAL", name: "شفوي" },
    ]);

    const mcqCat = categories.find((c) => c.code === "MCQ");
    const essayCat = categories.find((c) => c.code === "ESSAY");
    const oralCat = categories.find((c) => c.code === "ORAL");

    // 9. Create Owner
    console.log("👑 Creating owner account...");
    const ownerPassword = await bcrypt.hash("Owner@2025!Ahmed", 10);
    const owner = await User.create({
      fullName: "أحمد حجر",
      nationalId: "0000000000",
      password: ownerPassword,
      roleId: ownerRole!._id,
    });

    // 10. Create Super Admin
    console.log("👨‍💼 Creating admin users...");
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 8);
    const superAdmin = await User.create({
      fullName: "مدير النظام",
      nationalId: "1111111111",
      password: hashedPassword,
      roleId: superAdminRole!._id,
    });

    await PasswordReset.create({
      userId: superAdmin._id,
      mustChangePassword: true,
    });

    // 11. Create Managers (one per school)
    console.log("👔 Creating managers...");
    const managers = [];
    for (let i = 0; i < schools.length; i++) {
      const manager = await User.create({
        fullName: `مدير ${schools[i].name}`,
        nationalId: `222222000${i}`,
        password: hashedPassword,
        roleId: managerRole!._id,
      });
      managers.push(manager);
      await PasswordReset.create({
        userId: manager._id,
        mustChangePassword: true,
      });
      await ManagerAssignment.create({
        managerId: manager._id,
        schoolId: schools[i]._id,
      });
    }

    // 12. Create Teachers
    console.log("👨‍🏫 Creating teachers...");
    const teachers = [];
    const teacherSubjects = [arabic, math, science, english];

    for (let i = 0; i < 10; i++) {
      const teacher = await User.create({
        fullName: `معلم ${i + 1}`,
        nationalId: `444444000${i}`,
        password: hashedPassword,
        roleId: teacherRole!._id,
      });
      teachers.push(teacher);
      await PasswordReset.create({
        userId: teacher._id,
        mustChangePassword: true,
      });

      // Assign each teacher to a subject
      const subject = teacherSubjects[i % teacherSubjects.length];
      if (subject) {
        await TeacherAssignment.create({
          teacherId: teacher._id,
          subjectId: subject._id,
        });
      }
    }

    // 13. Create Oral Questions (automatically for Arabic and English)
    console.log("❓ Creating oral questions...");
    const oralQuestions = [];

    // Oral questions for Arabic
    if (arabic && oralCat) {
      for (const program of programs) {
        for (const grade of grades) {
          oralQuestions.push({
            subjectId: arabic._id,
            programId: program._id,
            gradeId: grade._id,
            categoryId: oralCat._id,
            questionType: "oral",
            questionText: "اختبار شفوي - يتم تقييمه من قبل المعلم",
            points: 5,
            isApproved: true,
          });
        }
      }
    }

    // Oral questions for English
    if (english && oralCat) {
      for (const program of programs) {
        for (const grade of grades) {
          oralQuestions.push({
            subjectId: english._id,
            programId: program._id,
            gradeId: grade._id,
            categoryId: oralCat._id,
            questionType: "oral",
            questionText: "Oral Exam - Graded by teacher",
            points: 5,
            isApproved: true,
          });
        }
      }
    }

    await Question.insertMany(oralQuestions);

    // 14. Create some MCQ questions
    console.log("❓ Creating MCQ questions...");
    const arabicProgram = programs[0];
    const grade4 = g4;

    if (arabic && arabicProgram && grade4 && mcqCat) {
      const q1 = await Question.create({
        subjectId: arabic._id,
        programId: arabicProgram._id,
        gradeId: grade4._id,
        categoryId: mcqCat._id,
        questionType: "mcq",
        questionText: "ما هو عدد أحرف اللغة العربية؟",
        points: 2,
        isApproved: true,
      });

      await QuestionOption.insertMany([
        { questionId: q1._id, optionText: "26", isCorrect: false },
        { questionId: q1._id, optionText: "28", isCorrect: true },
        { questionId: q1._id, optionText: "30", isCorrect: false },
        { questionId: q1._id, optionText: "32", isCorrect: false },
      ]);
    }

    // 15. Create Exams (one for each subject)
    console.log("📝 Creating exams...");
    const exams = [];

    if (arabic && arabicProgram && grade4) {
      const arabicExam = await Exam.create({
        name: "اختبار اللغة العربية",
        subjectId: arabic._id,
        programId: arabicProgram._id,
        gradeId: grade4._id,
        isActive: true,
      });
      exams.push(arabicExam);
    }

    if (math && arabicProgram && grade4) {
      const mathExam = await Exam.create({
        name: "اختبار الرياضيات",
        subjectId: math._id,
        programId: arabicProgram._id,
        gradeId: grade4._id,
        isActive: true,
      });
      exams.push(mathExam);
    }

    if (science && arabicProgram && grade4) {
      const scienceExam = await Exam.create({
        name: "اختبار العلوم",
        subjectId: science._id,
        programId: arabicProgram._id,
        gradeId: grade4._id,
        isActive: true,
      });
      exams.push(scienceExam);
    }

    if (english && arabicProgram && grade4) {
      const englishExam = await Exam.create({
        name: "English Language Test",
        subjectId: english._id,
        programId: arabicProgram._id,
        gradeId: grade4._id,
        isActive: true,
      });
      exams.push(englishExam);
    }

    // 16. Create Students
    console.log("👨‍🎓 Creating students...");
    const arabicProg = programs[0];

    for (let i = 0; i < 15; i++) {
      const student = await User.create({
        fullName: `طالب ${i + 1}`,
        nationalId: `55555500${i < 10 ? "0" + i : i}`,
        roleId: studentRole!._id,
      });

      // Assign to appropriate school based on grade
      let school = girlsPrimary;
      let grade = g4;

      if (i < 5) {
        school = girlsPrimary;
        grade = g4;
      } else if (i < 10) {
        school = boysMiddle;
        grade = g7;
      } else {
        school = girlsHigh;
        grade = g10;
      }

      if (school && grade && arabicProg) {
        await StudentProfile.create({
          userId: student._id,
          schoolId: school._id,
          programId: arabicProg._id,
          gradeId: grade._id,
          pin4: `${1000 + i}`,
        });
      }
    }

    console.log("\n✅ Database seeded successfully!\n");
    console.log("📊 Summary:");
    console.log("   - 5 roles");
    console.log("   - 6 schools");
    console.log("   - 2 programs");
    console.log("   - 10 grades (G3-G12)");
    console.log("   - 4 subjects (عربي، رياضيات، علوم، إنجليزي)");
    console.log("   - 4 exams (one per subject)");
    console.log("   - 40 oral questions (auto-created for Arabic & English)");
    console.log("   - 1 owner");
    console.log("   - 1 super admin");
    console.log("   - 6 managers (one per school)");
    console.log("   - 10 teachers (assigned to subjects)");
    console.log("   - 15 students");
    console.log("   - Subject weights (25% each)\n");

    console.log("🔐 Login Credentials:");
    console.log("┌─────────────────────────────────────────────────┐");
    console.log("│ OWNER (Ahmed Hagr)                             │");
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
    console.log("└─────────────────────────────────────────────────┘\n");

    await mongoose.connection.close();
    console.log("🔌 Database connection closed.");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
