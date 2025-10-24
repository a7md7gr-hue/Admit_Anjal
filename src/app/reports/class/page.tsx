"use client";

import { useState, useEffect } from "react";

export default function ClassReportPage() {
  const [gradeCode, setGradeCode] = useState("");
  const [grades, setGrades] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadGrades();
  }, []);

  async function loadGrades() {
    try {
      const res = await fetch("/api/reference/lists");
      if (res.ok) {
        const data = await res.json();
        setGrades(data.grades || []);
        if (data.grades.length > 0) {
          setGradeCode(data.grades[0].code);
        }
      }
    } catch (error) {
      console.error("Error loading grades:", error);
    }
  }

  async function handleSearch() {
    if (!gradeCode) {
      setMessage("❌ الرجاء اختيار صف");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `/api/reports/class-report?gradeCode=${gradeCode}`,
      );
      const data = await res.json();

      if (res.ok) {
        setReport(data);
      } else {
        setMessage(`❌ خطأ: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">تقرير صف</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${message.startsWith("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <select
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
              value={gradeCode}
              onChange={(e) => setGradeCode(e.target.value)}
            >
              <option value="">-- اختر صف --</option>
              {grades.map((g: any) => (
                <option key={g.code} value={g.code}>
                  {g.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "جاري البحث..." : "عرض التقرير"}
            </button>
          </div>

          {report && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">
                  {report.grade} - إجمالي الطلاب: {report.totalStudents}
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        الطالب
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        رقم الهوية
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        المدرسة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        البرنامج
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        المحاولات
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        إجمالي الدرجات
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        متوسط النسبة
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.students.map((s: any, i: number) => (
                      <tr key={i}>
                        <td className="px-6 py-4 text-sm font-medium">
                          {s.fullName}
                        </td>
                        <td className="px-6 py-4 text-sm">{s.nationalId}</td>
                        <td className="px-6 py-4 text-sm">{s.school}</td>
                        <td className="px-6 py-4 text-sm">{s.program}</td>
                        <td className="px-6 py-4 text-sm">{s.totalAttempts}</td>
                        <td className="px-6 py-4 text-sm">{s.totalScore}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          {s.averagePercentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

