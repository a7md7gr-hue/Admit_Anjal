"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TrackingPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"exams" | "students" | "teachers">("exams");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/tracking");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error loading tracking data:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">📊 متابعة الاختبارات والتصحيح</h1>
              <p className="text-blue-100">تتبع كامل لكل الاختبارات من البداية للنهاية</p>
            </div>
            <button
              onClick={() => router.push("/super-admin")}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg"
            >
              ← العودة
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        {!loading && data && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-xl">
              <div className="text-5xl font-bold mb-2">{data.totalExams || 0}</div>
              <div className="text-blue-100">إجمالي الامتحانات</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-xl">
              <div className="text-5xl font-bold mb-2">{data.completedExams || 0}</div>
              <div className="text-green-100">اكتملت ✅</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-2xl p-6 shadow-xl">
              <div className="text-5xl font-bold mb-2">{data.inProgressExams || 0}</div>
              <div className="text-yellow-100">جارية ⏳</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-xl">
              <div className="text-5xl font-bold mb-2">{data.pendingGrading || 0}</div>
              <div className="text-red-100">تحتاج تصحيح 🔴</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("exams")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "exams"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📝 الامتحانات
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "students"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              👨‍🎓 الطلاب
            </button>
            <button
              onClick={() => setActiveTab("teachers")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "teachers"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              👨‍🏫 المعلمين
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                <p className="mt-4 text-gray-600">جاري التحميل...</p>
              </div>
            ) : !data ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">❌</div>
                <p className="text-gray-600">فشل تحميل البيانات</p>
              </div>
            ) : (
              <>
                {/* Exams Tab */}
                {activeTab === "exams" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">جميع الامتحانات</h2>
                    {data.exams && data.exams.length > 0 ? (
                      <div className="space-y-4">
                        {data.exams.map((exam: any) => (
                          <div
                            key={exam.id}
                            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.name}</h3>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                    {exam.subject}
                                  </span>
                                  <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                                    {exam.grade}
                                  </span>
                                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                    {exam.program}
                                  </span>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{exam.completedCount || 0}</div>
                                <div className="text-sm text-gray-600">طالب أنهى</div>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-600">{exam.inProgressCount || 0}</div>
                                <div className="text-sm text-gray-600">جاري الحل</div>
                              </div>
                              <div className="text-center">
                                <div className="text-3xl font-bold text-red-600">{exam.pendingGradingCount || 0}</div>
                                <div className="text-sm text-gray-600">يحتاج تصحيح</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-gray-600">لا توجد امتحانات حالياً</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Students Tab */}
                {activeTab === "students" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">حالة الطلاب</h2>
                    <div className="text-center py-20">
                      <div className="text-6xl mb-4">👨‍🎓</div>
                      <p className="text-gray-600">قريباً...</p>
                    </div>
                  </div>
                )}

                {/* Teachers Tab */}
                {activeTab === "teachers" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">أداء المعلمين</h2>
                    <div className="text-center py-20">
                      <div className="text-6xl mb-4">👨‍🏫</div>
                      <p className="text-gray-600">قريباً...</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white py-6">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <p>نظام إدارة القبول - مدارس الأنجال الأهلية</p>
          <p className="mt-2">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

