import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Import models properly
import Question from "../src/models/Question";
import QuestionOption from "../src/models/QuestionOption";
import Subject from "../src/models/Subject";
import Program from "../src/models/Program";
import Grade from "../src/models/Grade";
import QuestionCategory from "../src/models/QuestionCategory";
import Exam from "../src/models/Exam";
import ExamBlueprint from "../src/models/ExamBlueprint";
import User from "../src/models/User";
import Role from "../src/models/Role";

async function addEssayQuestionsAndExam() {
  try {
    console.log("🔄 جاري الاتصال بقاعدة البيانات...");
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ تم الاتصال بنجاح!");

    // Get reference data (using correct codes)
    console.log("🔍 جاري البحث عن البيانات المرجعية...");

    const arabicSubject = await Subject.findOne({ code: "AR" });
    const mathSubject = await Subject.findOne({ code: "MATH" });
    const scienceSubject = await Subject.findOne({ code: "SCI" });
    const arabicProgram = await Program.findOne({ code: "ARABIC" });
    const grade3 = await Grade.findOne({ code: "G3" });
    const essayCategory = await QuestionCategory.findOne({ code: "ESSAY" });
    const mcqCategory = await QuestionCategory.findOne({ code: "MCQ" });

    if (
      !arabicSubject ||
      !mathSubject ||
      !scienceSubject ||
      !arabicProgram ||
      !grade3 ||
      !essayCategory ||
      !mcqCategory
    ) {
      throw new Error("البيانات المرجعية غير موجودة");
    }

    console.log("✅ تم العثور على جميع البيانات المرجعية!");

    console.log("\n📝 جاري إضافة أسئلة مقالية...");

    // Add Essay Questions for Arabic
    const essayQuestions = [
      {
        questionText:
          "اكتب موضوعاً عن فصل الربيع وجماله، مستخدماً جملاً واضحة وكلمات معبرة (لا يقل عن 5 أسطر)",
        questionType: "essay",
        subjectId: arabicSubject._id,
        programId: arabicProgram._id,
        gradeId: grade3._id,
        categoryId: essayCategory._id,
        points: 10,
        isApproved: true,
      },
      {
        questionText:
          'اقرأ القصة القصيرة التالية ثم اكتب ملخصاً لها: "كان هناك طفل صغير يحب مساعدة الناس، في يوم من الأيام ساعد رجلاً عجوزاً في حمل أغراضه، فشكره الرجل ودعا له بالتوفيق"',
        questionType: "essay",
        subjectId: arabicSubject._id,
        programId: arabicProgram._id,
        gradeId: grade3._id,
        categoryId: essayCategory._id,
        points: 8,
        isApproved: true,
      },
      {
        questionText:
          "ما رأيك في أهمية القراءة؟ اذكر ثلاثة أسباب تجعل القراءة مهمة",
        questionType: "essay",
        subjectId: arabicSubject._id,
        programId: arabicProgram._id,
        gradeId: grade3._id,
        categoryId: essayCategory._id,
        points: 6,
        isApproved: true,
      },
      {
        questionText: "اكتب رسالة قصيرة إلى صديقك تدعوه فيها لزيارتك في المنزل",
        questionType: "essay",
        subjectId: arabicSubject._id,
        programId: arabicProgram._id,
        gradeId: grade3._id,
        categoryId: essayCategory._id,
        points: 7,
        isApproved: true,
      },
      {
        questionText:
          "حل المسألة التالية واشرح خطوات الحل: إذا كان معك 50 ريال واشتريت 3 كتب كل واحد بـ 12 ريال، كم يتبقى معك؟",
        questionType: "essay",
        subjectId: mathSubject._id,
        programId: arabicProgram._id,
        gradeId: grade3._id,
        categoryId: essayCategory._id,
        points: 5,
        isApproved: true,
      },
      {
        questionText: "اشرح بكلماتك الخاصة ما هي دورة الماء في الطبيعة",
        questionType: "essay",
        subjectId: scienceSubject._id,
        programId: arabicProgram._id,
        gradeId: grade3._id,
        categoryId: essayCategory._id,
        points: 8,
        isApproved: true,
      },
    ];

    const createdEssayQuestions = await Question.insertMany(essayQuestions);
    console.log(`✅ تم إضافة ${createdEssayQuestions.length} سؤال مقالي`);

    // Add more MCQ questions
    console.log("\n📝 جاري إضافة أسئلة اختيارية إضافية...");

    const mcqQuestions = [
      {
        questionText: 'ما هو عكس كلمة "كبير"؟',
        questionType: "mcq",
        subjectId: arabicSubject._id,
        programId: arabicProgram._id,
        gradeId: grade3._id,
        categoryId: mcqCategory._id,
        points: 2,
        isApproved: true,
      },
      {
        questionText: "كم عدد أحرف الهجاء العربية؟",
        questionType: "mcq",
        subjectId: arabicSubject._id,
        programId: arabicProgram._id,
        gradeId: grade3._id,
        categoryId: mcqCategory._id,
        points: 2,
        isApproved: true,
      },
      {
        questionText: "ما ناتج 7 + 8؟",
        questionType: "mcq",
        subjectId: mathSubject._id,
        programId: arabicProgram._id,
        gradeId: grade3._id,
        categoryId: mcqCategory._id,
        points: 2,
        isApproved: true,
      },
      {
        questionText: "ما هو الكوكب الأقرب للشمس؟",
        questionType: "mcq",
        subjectId: scienceSubject._id,
        programId: arabicProgram._id,
        gradeId: grade3._id,
        categoryId: mcqCategory._id,
        points: 2,
        isApproved: true,
      },
    ];

    const createdMcqQuestions = await Question.insertMany(mcqQuestions);
    console.log(`✅ تم إضافة ${createdMcqQuestions.length} سؤال اختياري جديد`);

    // Add options for MCQ questions
    const mcqOptions = [
      // Q1 options
      {
        questionId: createdMcqQuestions[0]._id,
        optionText: "صغير",
        isCorrect: true,
        optionOrder: 1,
      },
      {
        questionId: createdMcqQuestions[0]._id,
        optionText: "عظيم",
        isCorrect: false,
        optionOrder: 2,
      },
      {
        questionId: createdMcqQuestions[0]._id,
        optionText: "ضخم",
        isCorrect: false,
        optionOrder: 3,
      },
      {
        questionId: createdMcqQuestions[0]._id,
        optionText: "كثير",
        isCorrect: false,
        optionOrder: 4,
      },

      // Q2 options
      {
        questionId: createdMcqQuestions[1]._id,
        optionText: "26",
        isCorrect: false,
        optionOrder: 1,
      },
      {
        questionId: createdMcqQuestions[1]._id,
        optionText: "28",
        isCorrect: true,
        optionOrder: 2,
      },
      {
        questionId: createdMcqQuestions[1]._id,
        optionText: "30",
        isCorrect: false,
        optionOrder: 3,
      },
      {
        questionId: createdMcqQuestions[1]._id,
        optionText: "32",
        isCorrect: false,
        optionOrder: 4,
      },

      // Q3 options
      {
        questionId: createdMcqQuestions[2]._id,
        optionText: "13",
        isCorrect: false,
        optionOrder: 1,
      },
      {
        questionId: createdMcqQuestions[2]._id,
        optionText: "14",
        isCorrect: false,
        optionOrder: 2,
      },
      {
        questionId: createdMcqQuestions[2]._id,
        optionText: "15",
        isCorrect: true,
        optionOrder: 3,
      },
      {
        questionId: createdMcqQuestions[2]._id,
        optionText: "16",
        isCorrect: false,
        optionOrder: 4,
      },

      // Q4 options
      {
        questionId: createdMcqQuestions[3]._id,
        optionText: "عطارد",
        isCorrect: true,
        optionOrder: 1,
      },
      {
        questionId: createdMcqQuestions[3]._id,
        optionText: "الزهرة",
        isCorrect: false,
        optionOrder: 2,
      },
      {
        questionId: createdMcqQuestions[3]._id,
        optionText: "الأرض",
        isCorrect: false,
        optionOrder: 3,
      },
      {
        questionId: createdMcqQuestions[3]._id,
        optionText: "المريخ",
        isCorrect: false,
        optionOrder: 4,
      },
    ];

    await QuestionOption.insertMany(mcqOptions);
    console.log("✅ تم إضافة خيارات الأسئلة");

    // Create a comprehensive exam for Grade 3
    console.log("\n📋 جاري إنشاء اختبار شامل...");

    // Get all G3 questions
    const allG3Questions = await Question.find({
      gradeId: grade3._id,
      isApproved: true,
    });

    console.log(`📊 وجد ${allG3Questions.length} سؤال للصف الثالث`);

    // Select questions for the exam (mix of MCQ and Essay)
    const mcqQuestionsForExam = allG3Questions
      .filter((q) => q.questionType === "mcq")
      .slice(0, 10);
    const essayQuestionsForExam = allG3Questions
      .filter((q) => q.questionType === "essay")
      .slice(0, 3);
    const selectedQuestions = [
      ...mcqQuestionsForExam,
      ...essayQuestionsForExam,
    ];

    if (selectedQuestions.length === 0) {
      throw new Error("لا توجد أسئلة لإنشاء الاختبار");
    }

    const totalPoints = selectedQuestions.reduce(
      (sum, q) => sum + (q.points || 1),
      0,
    );

    const exam = await Exam.create({
      name: "اختبار شامل للصف الثالث - نموذج تجريبي",
      subjectId: arabicSubject._id, // اختبار شامل لكن نحتاج subject واحد
      gradeId: grade3._id,
      programId: arabicProgram._id,
      isActive: true,
    });

    console.log(`✅ تم إنشاء اختبار: ${exam.name}`);
    console.log(`   - الصف: الثالث`);
    console.log(`   - البرنامج: عربي`);

    // Create exam blueprint (questions in exam)
    const blueprints = selectedQuestions.map((q, index) => ({
      examId: exam._id,
      questionId: q._id,
      questionOrder: index + 1,
      pointsOverride: q.points,
    }));

    await ExamBlueprint.insertMany(blueprints);
    console.log(`✅ تم إضافة ${blueprints.length} سؤال للاختبار`);
    console.log(`   - أسئلة اختيارية: ${mcqQuestionsForExam.length}`);
    console.log(`   - أسئلة مقالية: ${essayQuestionsForExam.length}`);

    console.log("\n✅ تم إنشاء البيانات بنجاح!");
    console.log("\n" + "=".repeat(60));

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ خطأ:", error);
    process.exit(1);
  }
}

addEssayQuestionsAndExam();
