"use client";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";

export default function SupervisorPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await fetch("/api/supervisor/dashboard");
      if (!response.ok) {
        console.error("Failed to fetch data");
        setLoading(false);
        return;
      }
      const data = await response.json();
      setTeachers(data.teachers || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/anjal-logo.png" alt="Al-Anjal Logo" className="h-12" />
            <div>
              <div className="font-bold text-lg">
                مدارس الأنجال الأهلية والدولية
              </div>
              <div className="text-xs text-gray-500">
                Al-Anjal Private & International Schools
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">لوحة المشرف</h1>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">المعلمون تحت الإشراف</h2>

          {loading ? (
            <div>جاري التحميل...</div>
          ) : teachers.length === 0 ? (
            <div className="text-gray-500">لا يوجد معلمون مرتبطون بك حالياً</div>
          ) : (
            <div className="grid gap-4">
              {teachers.map((teacher, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="font-semibold">{teacher.name}</div>
                  <div className="text-sm text-gray-600">
                    المادة: {teacher.subject}
                  </div>
                  <div className="text-sm text-gray-600">
                    عدد الطلاب: {teacher.studentCount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
