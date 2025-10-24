/**
 * Script to upload Excel file directly to database
 * Usage: npx ts-node scripts/upload-excel-direct.ts
 */

import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/admission-tests';

// Models
import '../src/models';
const School = mongoose.model('School');
const Program = mongoose.model('Program');
const Grade = mongoose.model('Grade');
const Subject = mongoose.model('Subject');
const Question = mongoose.model('Question');
const QuestionOption = mongoose.model('QuestionOption');

async function uploadExcel() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read Excel file
    const filePath = path.join(process.cwd(), 'grade5_international_sample_questions.xlsx');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log('📖 Reading Excel file...');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 Found ${rows.length} rows in Excel`);

    if (rows.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Parse questions
    const parsedQuestions: any[] = [];
    
    for (const row of rows) {
      // Find column names (flexible matching)
      const questionText =
        row['QuestionText'] ||
        row['questionText'] ||
        row['Question Text'] ||
        row['question text'] ||
        row['السؤال'] ||
        row['نص السؤال'];

      const questionType =
        row['Type'] ||
        row['type'] ||
        row['QuestionType'] ||
        row['النوع'] ||
        'mcq';

      const points =
        row['Points'] ||
        row['points'] ||
        row['الدرجات'] ||
        1;

      const subject =
        row['Subject'] ||
        row['subject'] ||
        row['المادة'];

      const program =
        row['Program'] ||
        row['program'] ||
        row['البرنامج'];

      const grade =
        row['Grade'] ||
        row['grade'] ||
        row['الصف'];

      const imageUrl =
        row['ImageURL'] ||
        row['imageUrl'] ||
        row['Image URL'] ||
        row['image url'] ||
        row['صورة'] ||
        null;

      // Options for MCQ
      const optionA = row['OptionA'] || row['Option A'] || row['الخيار أ'] || null;
      const optionB = row['OptionB'] || row['Option B'] || row['الخيار ب'] || null;
      const optionC = row['OptionC'] || row['Option C'] || row['الخيار ج'] || null;
      const optionD = row['OptionD'] || row['Option D'] || row['الخيار د'] || null;
      const optionE = row['OptionE'] || row['Option E'] || row['الخيار ه'] || null;

      const correctAnswer =
        row['CorrectAnswer'] ||
        row['Correct Answer'] ||
        row['correct answer'] ||
        row['الإجابة الصحيحة'] ||
        'A';

      if (!questionText) {
        console.warn('⚠️ Skipping row: missing question text');
        continue;
      }

      parsedQuestions.push({
        questionText,
        questionType: questionType.toLowerCase(),
        points: Number(points),
        subject,
        program,
        grade,
        imageUrl,
        options: [
          { text: optionA, isCorrect: correctAnswer.toUpperCase() === 'A' },
          { text: optionB, isCorrect: correctAnswer.toUpperCase() === 'B' },
          { text: optionC, isCorrect: correctAnswer.toUpperCase() === 'C' },
          { text: optionD, isCorrect: correctAnswer.toUpperCase() === 'D' },
          { text: optionE, isCorrect: correctAnswer.toUpperCase() === 'E' },
        ].filter((opt) => opt.text), // Remove null options
      });
    }

    console.log(`✅ Parsed ${parsedQuestions.length} questions`);

    // Upload to database
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const q of parsedQuestions) {
      try {
        // Get reference IDs
        const subject = await Subject.findOne({ name: q.subject });
        const program = await Program.findOne({ name: q.program });
        const grade = await Grade.findOne({ name: q.grade });

        if (!subject) {
          errors.push(`${q.questionText.substring(0, 30)}...: المادة "${q.subject}" غير موجودة`);
          errorCount++;
          continue;
        }
        if (!program) {
          errors.push(`${q.questionText.substring(0, 30)}...: البرنامج "${q.program}" غير موجود`);
          errorCount++;
          continue;
        }
        if (!grade) {
          errors.push(`${q.questionText.substring(0, 30)}...: الصف "${q.grade}" غير موجود`);
          errorCount++;
          continue;
        }

        // Create question
        const question = await Question.create({
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points,
          subjectId: subject._id,
          programId: program._id,
          gradeId: grade._id,
          imageUrl: q.imageUrl || null,
          isActive: true,
        });

        // Create options for MCQ
        if (q.questionType === 'mcq' && q.options.length > 0) {
          const optionDocs = q.options.map((opt: any) => ({
            questionId: question._id,
            optionText: opt.text,
            isCorrect: opt.isCorrect,
          }));

          await QuestionOption.insertMany(optionDocs);
        }

        successCount++;
      } catch (err: any) {
        console.error(`❌ Error adding question: ${err.message}`);
        errors.push(`${q.questionText.substring(0, 30)}...: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\n⚠️ Errors:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    console.log('\n✅ Done!');
    await mongoose.disconnect();
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

uploadExcel();

