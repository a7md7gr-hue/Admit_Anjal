/**
 * Excel File Parser Utilities
 * Handles parsing Excel files for bulk uploads
 */

import * as XLSX from "xlsx";

export interface ExcelRow {
  [key: string]: any;
}

export interface ParseResult {
  success: boolean;
  data: ExcelRow[];
  errors: { row: number; field: string; message: string }[];
}

/**
 * Parse CSV text to JSON
 */
export function parseCSV(text: string): ExcelRow[] {
  const lines = text.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: ExcelRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: ExcelRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Validate student row
 */
export function validateStudentRow(
  row: ExcelRow,
  rowNumber: number,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!row.FullName || row.FullName.length < 2) {
    errors.push("FullName is required and must be at least 2 characters");
  }

  // National ID: exactly 10 digits
  if (!row.NationalID || !/^\d{10}$/.test(row.NationalID)) {
    errors.push("NationalID must be exactly 10 digits");
  }

  // School
  if (!row.School) {
    errors.push("School is required");
  }

  // Program
  if (!row.Program) {
    errors.push("Program is required");
  }

  // Grade
  if (!row.Grade) {
    errors.push("Grade is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate question row
 */
export function validateQuestionRow(
  row: ExcelRow,
  rowNumber: number,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!row.Subject) errors.push("Subject is required");
  if (!row.Program) errors.push("Program is required");
  if (!row.Grade) errors.push("Grade is required");
  if (!row.Category) errors.push("Category is required");
  if (!row.Type) errors.push("Type is required");
  if (!row.Question || row.Question.length < 5) {
    errors.push("Question is required and must be at least 5 characters");
  }

  // MCQ specific validation
  if (row.Type && row.Type.toLowerCase() === "mcq") {
    if (!row.Option1 && !row.Option2) {
      errors.push("MCQ questions must have at least 2 options");
    }
    if (!row.CorrectAnswer) {
      errors.push("CorrectAnswer is required for MCQ questions");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Convert Excel data to create student payload
 */
export function excelRowToStudent(row: ExcelRow) {
  return {
    full_name: row.FullName,
    national_id: row.NationalID,
    school_code: row.School,
    program_code: row.Program,
    grade_code: row.Grade,
    academic_year: row.Year || "2025-2026",
  };
}

/**
 * Convert Excel data to create question payload
 */
export function excelRowToQuestion(row: ExcelRow) {
  const options: any[] = [];

  if (row.Type && row.Type.toLowerCase() === "mcq") {
    // Build options array
    for (let i = 1; i <= 6; i++) {
      const optionKey = `Option${i}`;
      if (row[optionKey]) {
        options.push({
          option_text: row[optionKey],
          is_correct: row.CorrectAnswer === String(i),
        });
      }
    }
  }

  return {
    subject_code: row.Subject,
    program_code: row.Program,
    grade_code: row.Grade,
    category_code: row.Category,
    question_type: row.Type.toLowerCase(),
    question_text: row.Question,
    options: options.length > 0 ? options : undefined,
  };
}

/**
 * Parse Excel file to students array
 * Expected columns: FullName, NationalID, School, Program, Grade, PIN, Phone1, Phone2
 */
export async function parseExcelToStudents(file: File): Promise<any[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);

  return rows.map((row: any) => ({
    fullName: row.FullName || row["الاسم الكامل"] || "",
    nationalId: String(row.NationalID || row["رقم الهوية"] || ""),
    school: row.School || row["المدرسة"] || "",
    program: row.Program || row["البرنامج"] || "",
    grade: row.Grade || row["الصف"] || "",
    pin4: String(row.PIN || row["الرمز السري"] || ""),
    phone1: row.Phone1 || row["رقم الهاتف 1"] || "",
    phone2: row.Phone2 || row["رقم الهاتف 2"] || "",
  }));
}

/**
 * Parse Excel file to questions array
 * Expected columns: QuestionText, Type, Points, Subject, Program, Grade, Options, CorrectAnswer, ImageUrl
 */
export async function parseExcelToQuestions(file: File): Promise<any[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);

  console.log('📊 Excel parsed:', rows.length, 'rows');
  if (rows.length > 0 && rows[0]) {
    console.log('First row keys:', Object.keys(rows[0] as Record<string, unknown>));
  }

  return rows.map((row: any, index: number) => {
    const options: any[] = [];

    // Parse options for MCQ/True-False
    const type = (row.Type || row.type || row["النوع"] || row.QuestionType || row.questionType || "").toLowerCase();
    
    if (type === "mcq" || type === "اختيار من متعدد") {
      for (let i = 1; i <= 6; i++) {
        const optKey = `Option${i}`;
        const optKeyAr = `خيار${i}`;
        const optValue = row[optKey] || row[optKeyAr] || row[`option${i}`];
        
        if (optValue) {
          const correctAns = String(row.CorrectAnswer || row.correctAnswer || row["الإجابة الصحيحة"] || "");
          options.push({
            text: optValue,
            isCorrect: correctAns === String(i) || correctAns.toLowerCase() === optValue.toLowerCase(),
          });
        }
      }
    } else if (type === "true_false" || type === "صح وخطأ") {
      const correctAns = row.CorrectAnswer || row.correctAnswer || row["الإجابة الصحيحة"];
      options.push({ text: "صح", isCorrect: correctAns === "صح" || correctAns === "True" || correctAns === "true" });
      options.push({ text: "خطأ", isCorrect: correctAns === "خطأ" || correctAns === "False" || correctAns === "false" });
    }

    const question = {
      questionText: row.QuestionText || row.questionText || row.Question || row.question || row["نص السؤال"] || row["السؤال"] || "",
      questionType: type === "اختيار من متعدد" ? "mcq" : type === "صح وخطأ" ? "true_false" : type === "مقالي" ? "essay" : type === "شفوي" ? "oral" : type,
      points: Number(row.Points || row.points || row["النقاط"] || row.Marks || row.marks || 1),
      subject: row.Subject || row.subject || row["المادة"] || "",
      program: row.Program || row.program || row["البرنامج"] || "",
      grade: row.Grade || row.grade || row["الصف"] || "",
      imageUrl: row.ImageUrl || row.imageUrl || row["رابط الصورة"] || "",
      options,
    };

    console.log(`Row ${index + 1}:`, {
      questionText: question.questionText.substring(0, 30),
      type: question.questionType,
      subject: question.subject,
      optionsCount: options.length
    });

    return question;
  });
}
