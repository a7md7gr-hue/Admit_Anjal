"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function PendingGradingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth({ 
    requiredRoles: ["SUPER_ADMIN", "OWNER"],
    redirectTo: "/auth/staff"
  });
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"exams" | "teachers">("exams");

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/pending-grading");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error loading pending grading data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-600">
        <div className="text-center">
          <div className="inline-block animate-spin h-16 w-16 border-4 border-white border-t-transparent rounded-full mb-4"></div>
          <p className="text-white text-xl font-semibold">🔐 جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Only render if authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <p className="text-white text-xl font-semibold">غير مصرح... جاري التحويل</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🔴 التصحيح المعلق</h1>
              <p className="text-red-100">
                الطلاب والمعلمين اللي متأخرين في التصحيح
              </p>
            </div>
            <button
              onClick={() => router.push("/super-admin")}
              className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all shadow-lg"
            >
              ← العودة للوحة التحكم
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        {!loading && data && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-xl">
              <div className="text-5xl font-bold mb-2">{data.totalPending}</div>
              <div className="text-red-100">إجمالي الإجابات المعلقة</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl">
              <div className="text-5xl font-bold mb-2">{data.exams?.length || 0}</div>
              <div className="text-purple-100">امتحانات تحتاج تصحيح</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-6 shadow-xl">
              <div className="text-5xl font-bold mb-2">{data.teachers?.length || 0}</div>
              <div className="text-orange-100">معلمين متأخرين</div>
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
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📝 حسب الامتحانات والطلاب
            </button>
            <button
              onClick={() => setActiveTab("teachers")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === "teachers"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              👨‍🏫 حسب المعلمين
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full"></div>
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
                    {data.exams && data.exams.length > 0 ? (
                      <div className="space-y-6">
                        {data.exams.map((exam: any) => (
                          <div
                            key={exam.id}
                            className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                  {exam.name}
                                </h3>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                                    المادة: {exam.subject}
                                  </span>
                                  <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                                    {exam.totalPending} إجابة معلقة
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Students Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
                                <thead className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                                  <tr>
                                    <th className="px-6 py-3 text-right text-sm font-bold">
                                      اسم الطالب
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-bold">
                                      الرقم الوطني
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-bold">
                                      المدرسة
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-bold">
                                      البرنامج
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-bold">
                                      الصف
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-bold">
                                      عدد الإجابات المعلقة
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {exam.students.map((student: any) => (
                                    <tr key={student.id} className="hover:bg-red-50">
                                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        {student.fullName}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-600">
                                        {student.nationalId}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-600">
                                        {student.school}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-600">
                                        {student.program}
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-600">
                                        {student.grade}
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <span className="inline-block bg-red-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                                          {student.pendingAnswers}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          رائع! لا توجد امتحانات تحتاج تصحيح
                        </h3>
                        <p className="text-gray-600">
                          جميع الإجابات تم تصحيحها بنجاح
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Teachers Tab */}
                {activeTab === "teachers" && (
                  <div>
                    {data.teachers && data.teachers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
                          <thead className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                            <tr>
                              <th className="px-6 py-3 text-right text-sm font-bold">
                                اسم المعلم
                              </th>
                              <th className="px-6 py-3 text-right text-sm font-bold">
                                الرقم الوطني
                              </th>
                              <th className="px-6 py-3 text-right text-sm font-bold">
                                البريد الإلكتروني
                              </th>
                              <th className="px-6 py-3 text-center text-sm font-bold">
                                عدد الإجابات المعلقة
                              </th>
                              <th className="px-6 py-3 text-center text-sm font-bold">
                                عدد الطلاب
                              </th>
                              <th className="px-6 py-3 text-center text-sm font-bold">
                                عدد الامتحانات
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {data.teachers.map((teacher: any, index: number) => (
                              <tr
                                key={teacher.id}
                                className={`hover:bg-red-50 ${
                                  index === 0
                                    ? "bg-red-100 font-bold"
                                    : index === 1
                                      ? "bg-orange-50"
                                      : ""
                                }`}
                              >
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                  {index === 0 && "🏆 "}
                                  {index === 1 && "🥈 "}
                                  {index === 2 && "🥉 "}
                                  {teacher.fullName}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {teacher.nationalId}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {teacher.email || "-"}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span
                                    className={`inline-block text-white text-sm font-bold px-4 py-1 rounded-full ${
                                      teacher.pendingCount > 10
                                        ? "bg-red-600"
                                        : teacher.pendingCount > 5
                                          ? "bg-orange-500"
                                          : "bg-yellow-500"
                                    }`}
                                  >
                                    {teacher.pendingCount}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-gray-900">
                                  {teacher.students}
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-gray-900">
                                  {teacher.exams}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          رائع! جميع المعلمين منتهين من التصحيح
                        </h3>
                        <p className="text-gray-600">
                          لا توجد تصحيحات معلقة حالياً
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-6">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <p>نظام إدارة القبول - مدارس الأنجال الأهلية</p>
          <p className="mt-2">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

