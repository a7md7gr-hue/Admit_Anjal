"use client";

import { useState } from "react";
import Link from "next/link";

export default function StudentReportPage() {
  const [studentId, setStudentId] = useState("");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSearch() {
    if (!studentId) {
      setMessage("❌ الرجاء إدخال رقم الطالب");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `/api/reports/student-full-report?studentId=${studentId}`,
      );
      const data = await res.json();

      if (res.ok) {
        setReport(data.report);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">تقرير طالب</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${message.startsWith("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <input
              type="text"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
              placeholder="أدخل رقم الطالب (ID)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "جاري البحث..." : "بحث"}
            </button>
          </div>

          {report && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">معلومات الطالب</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>الاسم:</strong> {report.fullName}
                  </div>
                  <div>
                    <strong>رقم الهوية:</strong> {report.nationalId}
                  </div>
                  <div>
                    <strong>المدرسة:</strong> {report.school}
                  </div>
                  <div>
                    <strong>البرنامج:</strong> {report.program}
                  </div>
                  <div>
                    <strong>الصف:</strong> {report.grade}
                  </div>
                  <div>
                    <strong>هاتف 1:</strong> {report.phone1}
                  </div>
                  {report.phone2 && (
                    <div>
                      <strong>هاتف 2:</strong> {report.phone2}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">
                  المحاولات ({report.totalAttempts})
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                          الاختبار
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                          المادة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                          الدرجة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                          النسبة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                          التاريخ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.attempts.map((att: any, i: number) => (
                        <tr key={i}>
                          <td className="px-6 py-4 text-sm">{att.exam}</td>
                          <td className="px-6 py-4 text-sm">{att.subject}</td>
                          <td className="px-6 py-4 text-sm">{att.score}</td>
                          <td className="px-6 py-4 text-sm font-semibold">
                            {att.percentage}%
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(att.submittedAt).toLocaleDateString("ar")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p>
                    <strong>متوسط النسبة المئوية:</strong>{" "}
                    {report.averagePercentage}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}



