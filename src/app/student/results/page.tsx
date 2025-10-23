"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function StudentResults() {
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    try {
      setMsg("جاري تحميل النتائج...");
      const r = await fetch("/api/student/results");
      const d = await r.json();

      if (!r.ok) {
        setMsg(`❌ ${d.error}`);
        setLoading(false);
        return;
      }

      setName(d.name || "");
      setRows(d.results || []);
      setMsg("");
      setLoading(false);
    } catch (error: any) {
      setMsg(`❌ ${error.message}`);
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/anjal-logo.png"
              alt="شعار مدارس الأنجال"
              width={60}
              height={60}
              className="object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                نتائج الاختبارات
              </h1>
              {name && <p className="text-sm text-gray-600">الطالب: {name}</p>}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/student/exam")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🏠 الصفحة الرئيسية
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🚪 تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{msg}</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                لا توجد نتائج متاحة
              </h3>
              <p className="text-gray-600 mb-6">
                لم تقم بإجراء أي اختبارات بعد
              </p>
              <button
                onClick={() => router.push("/student/exam")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ابدأ الاختبار
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <h2 className="text-2xl font-bold text-white">
                  نتائج اختباراتك
                </h2>
                <p className="text-blue-100 mt-1">
                  عدد الاختبارات المكتملة: {rows.length}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                        الاختبار
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        الحالة
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        الدرجة المحصلة
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        الدرجة الكلية
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        النسبة المئوية
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        التقييم
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rows.map((r: any, i: number) => {
                      const percent = r.percent || 0;
                      let grade = "";
                      let gradeColor = "";

                      if (percent >= 90) {
                        grade = "ممتاز";
                        gradeColor = "text-green-600 bg-green-50";
                      } else if (percent >= 80) {
                        grade = "جيد جداً";
                        gradeColor = "text-blue-600 bg-blue-50";
                      } else if (percent >= 70) {
                        grade = "جيد";
                        gradeColor = "text-yellow-600 bg-yellow-50";
                      } else if (percent >= 60) {
                        grade = "مقبول";
                        gradeColor = "text-orange-600 bg-orange-50";
                      } else {
                        grade = "ضعيف";
                        gradeColor = "text-red-600 bg-red-50";
                      }

  return (
                        <tr
                          key={i}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-800 font-medium">
                            {r.exam_name}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {r.is_approved ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                ✅ {r.status}
                              </span>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                                  ⏳ {r.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({r.pending_count} سؤال معلق)
                                </span>
      </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-800 font-semibold">
                            {r.is_approved ? r.total_score : "-"}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-600">
                            {r.is_approved ? r.max_score : "-"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {r.is_approved ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                {percent.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {r.is_approved ? (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${gradeColor}`}
                              >
                                {grade}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
        </table>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">
                      إجمالي الاختبارات
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {rows.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">متوسط الدرجات</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {rows.length > 0
                        ? (
                            rows.reduce((sum, r) => sum + (r.percent || 0), 0) /
                            rows.length
                          ).toFixed(2)
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">أعلى درجة</p>
                    <p className="text-2xl font-bold text-green-600">
                      {rows.length > 0
                        ? Math.max(...rows.map((r) => r.percent || 0)).toFixed(
                            2,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {msg && !loading && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{msg}</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <p className="mb-1">
            © {new Date().getFullYear()} جميع الحقوق محفوظة - مدارس الأنجال
            الأهلية والدولية
          </p>
          <p className="text-xs text-gray-500">
            قسم الحاسب الآلي - إشراف: أستاذ هشام يسري
          </p>
        </div>
      </footer>
    </div>
  );
}
