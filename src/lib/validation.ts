import { z } from "zod";

// Student login validation
export const studentLoginSchema = z.object({
  national_id: z
    .string()
    .length(10, "National ID must be exactly 10 digits")
    .regex(/^\d{10}$/, "National ID must contain only numbers")
    .trim(),
  pin_4: z
    .string()
    .length(4, "PIN must be 4 digits")
    .regex(/^\d{4}$/, "PIN must contain only numbers"),
});

// Staff login validation
export const staffLoginSchema = z.object({
  nationalId: z
    .string()
    .length(10, "National ID must be exactly 10 digits")
    .regex(/^\d{10}$/, "National ID must contain only numbers")
    .trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Create student validation
export const createStudentSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").trim(),
  national_id: z
    .string()
    .length(10, "National ID must be exactly 10 digits")
    .regex(/^\d{10}$/, "National ID must contain only numbers")
    .trim(),
  school_code: z.string().optional(),
  school_id: z.string().optional(),
  program_code: z.string().min(1, "Program is required"),
  grade_code: z.string().min(1, "Grade is required"),
  academic_year: z.string().optional(),
});

// Create question validation
export const createQuestionSchema = z.object({
  subject_code: z.string().min(1, "Subject is required"),
  program_code: z.string().min(1, "Program is required"),
  grade_code: z.string().min(1, "Grade is required"),
  category_code: z.string().min(1, "Category is required"),
  question_type: z.enum(["MCQ", "ESSAY", "ORAL_AR", "ORAL_INT"]),
  question_text: z.string().min(5, "Question must be at least 5 characters"),
  options: z
    .array(
      z.object({
        option_text: z.string(),
        is_correct: z.boolean(),
      }),
    )
    .optional(),
});
