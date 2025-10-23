import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { School, Program, Grade, Subject, QuestionCategory } from "@/models";

export async function GET() {
  try {
    await connectDB();

    const [schools, programs, grades, subjects, categories] = await Promise.all(
      [
        School.find().lean(),
        Program.find().lean(),
        Grade.find().lean(),
        Subject.find().lean(),
        QuestionCategory.find().lean(),
      ],
    );

    return NextResponse.json({
      schools: schools.map((s: any) => ({
        id: s._id.toString(),
        code: s.shortCode,
        name: s.name,
      })),
      programs: programs.map((p: any) => ({
        _id: p._id.toString(),
        code: p.code,
        name: p.name,
      })),
      grades: grades.map((g: any) => ({
        _id: g._id.toString(),
        code: g.code,
        name: g.name,
      })),
      subjects: subjects.map((s: any) => ({
        _id: s._id.toString(),
        code: s.code,
        name: s.name,
      })),
      categories: categories.map((c: any) => ({
        _id: c._id.toString(),
        code: c.code,
        name: c.name,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
