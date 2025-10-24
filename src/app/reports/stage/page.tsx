"use client";

import { useState, useEffect } from "react";

export default function StageReportPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reports/stage-report");
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            تقرير المرحلة (جميع الصفوف)
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${message.startsWith("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {message}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              جاري التحميل...
            </div>
          ) : report ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-2">
                  إجمالي الصفوف: {report.totalGrades}
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        الصف
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        إجمالي الطلاب
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        إجمالي المحاولات
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                        متوسط النسبة
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.grades.map((g: any, i: number) => (
                      <tr key={i}>
                        <td className="px-6 py-4 text-sm font-medium">
                          {g.gradeName}
                        </td>
                        <td className="px-6 py-4 text-sm">{g.totalStudents}</td>
                        <td className="px-6 py-4 text-sm">{g.totalAttempts}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                          {g.averagePercentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}





