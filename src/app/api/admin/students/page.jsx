// src/app/admin/students/page.jsx
"use client";
import { useState } from "react";

export default function AdminStudents() {
  const [form, setForm] = useState({
    full_name: "",
    national_id: "",
    school_id: 1, // خليه مؤقتًا 1 أو اللي عندك
    program_code: "AR",
    grade_code: "G3",
    academic_year: "2025-2026",
  });
  const [msg, setMsg] = useState("");

  const save = async () => {
    setMsg("Saving...");
    const r = await fetch("/api/admin/students/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    setMsg(r.ok ? `✅ PIN: ${d.pin_4}` : `❌ ${d.error || "خطأ"}`);
  };

  return (
    <div className="section max-w-3xl mx-auto grid gap-3">
      <h1 className="h2">إضافة طالب + تحديد المسار والصف</h1>

      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="input"
          placeholder="اسم الطالب"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <input
          className="input"
          placeholder="رقم الهوية"
          value={form.national_id}
          onChange={(e) => setForm({ ...form, national_id: e.target.value })}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <select
          className="input"
          value={form.program_code}
          onChange={(e) => setForm({ ...form, program_code: e.target.value })}
        >
          <option value="AR">Arabic</option>
          <option value="INT">International Diploma</option>
        </select>

        <select
          className="input"
          value={form.grade_code}
          onChange={(e) => setForm({ ...form, grade_code: e.target.value })}
        >
          <option value="G3">G3</option>
          <option value="G12">G12</option>
          {/* زوّد باقي الصفوف اللي عندك */}
        </select>
      </div>

      <input
        className="input"
        placeholder="العام الدراسي"
        value={form.academic_year}
        onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
      />

      <input
        className="input"
        placeholder="School ID (رقم)"
        value={form.school_id}
        onChange={(e) =>
          setForm({ ...form, school_id: Number(e.target.value) || "" })
        }
      />

      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={save}>
          حفظ
        </button>
        {msg && <span className="muted">{msg}</span>}
      </div>
    </div>
  );
}
