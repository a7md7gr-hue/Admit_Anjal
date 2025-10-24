"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function StudentLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nationalId: "",
    pin: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useState(() => {
    setIsVisible(true);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          national_id: formData.nationalId,
          pin_4: formData.pin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "فشل تسجيل الدخول");
        setLoading(false);
        return;
      }

      // Redirect to student exam page
      router.push("/student/exam");
    } catch (err) {
      setError("حدث خطأ في الاتصال");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 shadow-lg">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <Image
                src="/anjal-logo.png"
                alt="شعار مدارس الأنجال"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                تسجيل دخول الطلاب
              </h1>
              <p className="text-xs text-blue-100">
                مدارس الأنجال الأهلية والدولية
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1"
          >
            <span>← العودة للرئيسية</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          className={`w-full max-w-md transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse transform hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">
                تسجيل دخول الطالب
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                ✨ أدخل رقم الهوية ورمز PIN
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl text-red-700 text-sm shadow-md animate-shake">
                <div className="flex items-center gap-2">
                  <span className="text-lg">❌</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-blue-600">🆔</span>
                  رقم الهوية الوطنية (10 أرقام)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setFormData({ ...formData, nationalId: value });
                    }}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-wider font-bold transition-all duration-300 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100"
                    placeholder="0000000000"
                    maxLength={10}
                    required
                  />
                  {formData.nationalId.length === 10 && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500">
                      ✓
                    </div>
                  )}
                </div>
              </div>

              <div className="transform transition-all duration-300 hover:scale-105">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-blue-600">🔐</span>
                  رمز PIN (4 أرقام)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.pin}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
                      setFormData({ ...formData, pin: value });
                    }}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-3xl tracking-widest font-bold transition-all duration-300 bg-gradient-to-r from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100"
                    placeholder="••••"
                    maxLength={4}
                    required
                  />
                  {formData.pin.length === 4 && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500">
                      ✓
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  formData.nationalId.length !== 10 ||
                  formData.pin.length !== 4
                }
                className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <span>تسجيل الدخول</span>
                      <span className="text-xl">🚀</span>
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/staff"
                className="text-sm font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
              >
                هل أنت موظف؟ سجل دخولك من هنا ←
              </Link>
            </div>
          </div>

          {/* Info Cards */}
          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 shadow-lg border-2 border-blue-200 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <p className="font-bold text-blue-900 mb-1">معلومة مهمة:</p>
                  <p className="text-sm text-blue-700">
                    رمز PIN مكون من 4 أرقام تم إرساله لك عند التسجيل
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow-lg border-2 border-green-200 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <p className="font-bold text-green-900 mb-1">نصيحة:</p>
                  <p className="text-sm text-green-700">
                    تأكد من إدخال رقم الهوية كاملاً (10 أرقام)
                  </p>
                </div>
              </div>
            </div>
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
