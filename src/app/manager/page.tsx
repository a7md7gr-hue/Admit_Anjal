"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadData();
    fetchUserName();
  }, []);

  async function fetchUserName() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUserName(data.fullName || "");
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  }

  useEffect(() => {
    if (activeTab === "weights") {
      loadWeights();
    }
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/manager/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadWeights() {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/manager/subject-weights");
      if (res.ok) {
        const data = await res.json();
        setWeights(data.weights || []);
      }
    } catch (error) {
      console.error("Error loading weights:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveWeights() {
    setMsg("جاري الحفظ...");
    setLoading(true);
    try {
      const res = await fetch("/api/manager/subject-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("✅ " + data.message);
      } else {
        setMsg("❌ " + (data.error || "فشل الحفظ"));
      }
    } catch (error: any) {
      setMsg("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  }

  function updateWeight(subjectId: string, value: number) {
    setWeights((prev) =>
      prev.map((w) =>
        w.subjectId === subjectId ? { ...w, weight: value } : w,
      ),
    );
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 shadow-lg">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <Image
                src="/anjal-logo.png"
                alt="Al-Anjal"
                width={50}
                height={50}
                priority
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                لوحة تحكم مدير المدرسة
              </h1>
              {userName && (
                <p className="text-sm text-orange-100">مرحباً، {userName} 👋</p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
          >
            تسجيل الخروج
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: "overview", label: "📊 نظرة عامة" },
              { id: "students", label: "👨‍🎓 الطلاب" },
              { id: "weights", label: "⚖️ أوزان المواد" },
              { id: "reports", label: "📈 التقارير" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                جاري التحميل...
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      إحصائيات المدرسة
                    </h2>

                    {stats ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                          <div className="text-4xl font-bold mb-2">
                            {stats.totalStudents || 0}
                          </div>
                          <div className="text-blue-100">إجمالي الطلاب</div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                          <div className="text-4xl font-bold mb-2">
                            {stats.activeExams || 0}
                          </div>
                          <div className="text-green-100">
                            الاختبارات النشطة
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                          <div className="text-4xl font-bold mb-2">
                            {stats.completedAttempts || 0}
                          </div>
                          <div className="text-purple-100">
                            المحاولات المكتملة
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                          <div className="text-4xl font-bold mb-2">
                            {stats.pendingGrading || 0}
                          </div>
                          <div className="text-orange-100">قيد التصحيح</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        لا توجد بيانات متاحة
                      </div>
                    )}

                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-blue-900 mb-2">
                        المدرسة
                      </h3>
                      <p className="text-blue-800">
                        {stats?.schoolName || "غير محدد"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Students Tab */}
                {activeTab === "students" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      قائمة الطلاب
                    </h2>

                    {students.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                الاسم
                              </th>
                              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                رقم الهوية
                              </th>
                              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                الصف
                              </th>
                              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                البرنامج
                              </th>
                              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                PIN
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {students.map((student: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {student.fullName}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {student.nationalId}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {student.grade || "-"}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {student.program || "-"}
                                </td>
                                <td className="px-6 py-4 text-sm font-mono text-blue-600">
                                  {student.pin || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        لا يوجد طلاب مسجلون حالياً
                      </div>
                    )}
                  </div>
                )}

                {/* Weights Tab */}
                {activeTab === "weights" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      أوزان المواد الدراسية
                    </h2>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-blue-800 text-sm">
                        ℹ️ حدد وزن كل مادة في حساب النتيجة النهائية للطالب. يجب
                        أن يكون مجموع الأوزان 100%.
                      </p>
                    </div>

                    {weights.length > 0 ? (
                      <div className="space-y-4">
                        {weights.map((w) => {
                          const totalWeight = weights.reduce(
                            (sum, item) => sum + Number(item.weight),
                            0,
                          );
                          return (
                            <div
                              key={w.subjectId}
                              className="bg-white border-2 border-gray-200 rounded-xl p-6"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-grow">
                                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {w.subjectName}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    مادة دراسية أساسية
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={w.weight}
                                    onChange={(e) =>
                                      updateWeight(
                                        w.subjectId,
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-24 px-4 py-2 border-2 border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <span className="text-gray-600 font-semibold">
                                    %
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              المجموع
                            </span>
                            <span
                              className={`text-2xl font-bold ${
                                Math.abs(
                                  weights.reduce(
                                    (sum, w) => sum + Number(w.weight),
                                    0,
                                  ) - 100,
                                ) < 0.01
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {weights
                                .reduce((sum, w) => sum + Number(w.weight), 0)
                                .toFixed(0)}
                              %
                            </span>
                          </div>
                          {Math.abs(
                            weights.reduce(
                              (sum, w) => sum + Number(w.weight),
                              0,
                            ) - 100,
                          ) > 0.01 && (
                            <p className="text-sm text-red-600 mt-2">
                              ⚠️ يجب أن يكون المجموع 100% بالضبط
                            </p>
                          )}
                        </div>

                        <button
                          onClick={saveWeights}
                          disabled={
                            loading ||
                            Math.abs(
                              weights.reduce(
                                (sum, w) => sum + Number(w.weight),
                                0,
                              ) - 100,
                            ) > 0.01
                          }
                          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "جاري الحفظ..." : "حفظ الأوزان"}
                        </button>

                        {msg && (
                          <div
                            className={`p-4 rounded-lg ${
                              msg.startsWith("✅")
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {msg}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        {loading ? "جاري التحميل..." : "لا توجد مواد متاحة"}
                      </div>
                    )}
                  </div>
                )}

                {/* Reports Tab */}
                {activeTab === "reports" && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      التقارير
                    </h2>
                    <div className="text-center py-12 text-gray-500">
                      <p className="mb-4">سيتم إضافة التقارير المفصلة قريباً</p>
                      <p className="text-sm">
                        (تقارير الأداء، تقارير الطلاب، تحليلات الاختبارات، إلخ)
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-4">
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
