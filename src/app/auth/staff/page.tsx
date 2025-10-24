"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function StaffLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nationalId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useState(() => {
    setIsVisible(true);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "فشل تسجيل الدخول");
        setLoading(false);
        return;
      }

      console.log("✅ Login response:", data);

      // Check if password reset is required
      if (data.mustChangePassword) {
        console.log(
          "🔒 Password reset required, redirecting to /change-password",
        );
        router.push("/change-password");
        return;
      }

      // Redirect based on role (role codes from DB are uppercase)
      const roleLower = data.user.role.toLowerCase();
      const roleRedirects: Record<string, string> = {
        owner: "/super-admin",
        super_admin: "/super-admin",
        manager: "/manager",
        teacher: "/teacher/grading",
        student: "/student/exam",
      };

      const redirectPath = roleRedirects[roleLower] || "/super-admin"; // Default to super-admin instead of home
      console.log(
        "🔄 Redirecting to:",
        redirectPath,
        "(role:",
        data.user.role,
        ")",
      );
      router.push(redirectPath);
    } catch (err) {
      setError("حدث خطأ في الاتصال");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/anjal-logo.png"
              alt="شعار مدارس الأنجال"
              width={50}
              height={50}
              className="object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                تسجيل دخول الموظفين
              </h1>
              <p className="text-xs text-gray-600">
                مدارس الأنجال الأهلية والدولية
              </p>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← العودة للرئيسية
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          className={`w-full max-w-md transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                تسجيل دخول الموظفين
              </h2>
              <p className="text-sm text-gray-600">
                أدخل رقم الهوية وكلمة المرور
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهوية الوطنية (10 أرقام)
                </label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setFormData({ ...formData, nationalId: value });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-wider"
                  placeholder="0000000000"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || formData.nationalId.length !== 10}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    جاري تسجيل الدخول...
                  </span>
                ) : (
                  "تسجيل الدخول 🔐"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/student"
                className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
              >
                هل أنت طالب؟ سجل دخولك من هنا ←
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600 bg-white rounded-lg p-4 shadow">
            <p className="font-semibold mb-2">💡 معلومة:</p>
            <p>سيُطلب منك تغيير كلمة المرور عند أول تسجيل دخول</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <p className="mb-1">
            © {new Date().getFullYear()} جميع الحقوق محفوظة - مدارس الأنجال
            الأهلية والدولية
          </p>
          <p className="text-xs text-gray-500">
            قسم الحاسب الآلي
          </p>
        </div>
      </footer>
    </div>
  );
}
