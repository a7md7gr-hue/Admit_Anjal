"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SchoolsManagementPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [allGrades, setAllGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState({ name: "", shortCode: "" });
  const router = useRouter();

  useEffect(() => {
    loadSchools();
    loadGrades();
  }, []);

  async function loadSchools() {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/stats");
      if (res.ok) {
        const data = await res.json();
        setSchools(data.schools || []);
      }
    } catch (error) {
      console.error("Error loading schools:", error);
      setMessage("❌ فشل تحميل المدارس");
    } finally {
      setLoading(false);
    }
  }

  async function loadGrades() {
    try {
      const res = await fetch("/api/super-admin/stats");
      if (res.ok) {
        const data = await res.json();
        setAllGrades(data.grades || []);
      }
    } catch (error) {
      console.error("Error loading grades:", error);
    }
  }

  function openAddModal() {
    setModalMode("add");
    setForm({ name: "", shortCode: "" });
    setSelectedSchool(null);
    setIsModalOpen(true);
  }

  function openEditModal(school: any) {
    setModalMode("edit");
    setForm({ name: school.name, shortCode: school.code });
    setSelectedSchool(school);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setForm({ name: "", shortCode: "" });
    setSelectedSchool(null);
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.shortCode.trim()) {
      setMessage("❌ الاسم والرمز مطلوبان");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (modalMode === "add") {
        // Add new school
        const res = await fetch("/api/super-admin/schools", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, shortCode: form.shortCode }),
        });

        const data = await res.json();
        if (res.ok) {
          setMessage("✅ تم إضافة المدرسة بنجاح");
          loadSchools();
          setTimeout(() => closeModal(), 1500);
        } else {
          setMessage("❌ " + (data.error || "فشل إضافة المدرسة"));
        }
      } else {
        // Edit existing school
        const res = await fetch(`/api/super-admin/schools/${selectedSchool.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, shortCode: form.shortCode }),
        });

        const data = await res.json();
        if (res.ok) {
          setMessage("✅ تم تعديل المدرسة بنجاح");
          loadSchools();
          setTimeout(() => closeModal(), 1500);
        } else {
          setMessage("❌ " + (data.error || "فشل تعديل المدرسة"));
        }
      }
    } catch (error: any) {
      console.error("Error submitting school:", error);
      setMessage("❌ حدث خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(school: any) {
    if (!confirm(`⚠️ هل أنت متأكد من حذف المدرسة "${school.name}"؟\n\nهذا الإجراء لا يمكن التراجع عنه!`)) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/super-admin/schools?id=${school.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ " + data.message);
        loadSchools();
      } else {
        setMessage("❌ " + (data.error || "فشل حذف المدرسة"));
      }
    } catch (error: any) {
      console.error("Error deleting school:", error);
      setMessage("❌ حدث خطأ: " + error.message);
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
              <h1 className="text-4xl font-bold mb-2">🏫 إدارة المدارس</h1>
              <p className="text-blue-100">إضافة وتعديل وحذف المدارس المسجلة</p>
            </div>
            <button
              onClick={() => router.push("/super-admin")}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg"
            >
              ← العودة للوحة التحكم
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Action Bar */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-700 hover:to-teal-700 transition-all shadow-lg flex items-center gap-3"
            >
              <span className="text-2xl">➕</span>
              <span>إضافة مدرسة جديدة</span>
            </button>
            
            <button
              onClick={loadSchools}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
            >
              🔄 تحديث
            </button>
          </div>

          <div className="bg-white rounded-xl px-6 py-4 shadow-md border-2 border-blue-200">
            <div className="text-sm text-gray-600 mb-1">إجمالي المدارس</div>
            <div className="text-3xl font-bold text-blue-600">{schools.length}</div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center font-semibold ${
            message.includes("✅") 
              ? "bg-green-100 text-green-700 border-2 border-green-300" 
              : "bg-red-100 text-red-700 border-2 border-red-300"
          }`}>
            {message}
          </div>
        )}

        {/* Schools Grid */}
        {loading && schools.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المدارس...</p>
          </div>
        ) : schools.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-xl">
            <div className="text-6xl mb-4">🏫</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">لا توجد مدارس مسجلة</h3>
            <p className="text-gray-600 mb-6">ابدأ بإضافة مدرسة جديدة باستخدام الزر أعلاه</p>
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all shadow-lg"
            >
              ➕ إضافة أول مدرسة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school, index) => (
              <div
                key={school.id || index}
                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-blue-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{school.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        الرمز: {school.code || school.shortCode}
                      </span>
                    </div>
                  </div>
                  <div className="text-4xl">🏫</div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEditModal(school)}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
                  >
                    ✏️ تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(school)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all"
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === "add" ? "➕ إضافة مدرسة جديدة" : "✏️ تعديل المدرسة"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-3xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اسم المدرسة *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: مدرسة الأنجال الأهلية"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الرمز المختصر *
                </label>
                <input
                  type="text"
                  value={form.shortCode}
                  onChange={(e) => setForm({ ...form, shortCode: e.target.value })}
                  placeholder="مثال: ANB"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-center text-sm ${
                  message.includes("✅") 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {message}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {loading ? "جاري الحفظ..." : modalMode === "add" ? "إضافة" : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

