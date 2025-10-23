"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (newPassword.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("كلمة المرور الجديدة غير متطابقة");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ في تغيير كلمة المرور");
        setLoading(false);
        return;
      }

      // Success - redirect to appropriate page
      alert("✅ تم تغيير كلمة المرور بنجاح!");

      // Redirect based on role
      if (data.role === "super_admin" || data.role === "owner") {
        router.push("/super-admin");
      } else if (data.role === "manager") {
        router.push("/manager");
      } else if (data.role === "teacher") {
        router.push("/teacher/grading");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ في الاتصال");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/anjal-logo.png"
              alt="Al-Anjal"
              width={160}
              height={40}
              priority
            />
            <h1 className="text-xl font-bold text-gray-800">
              تغيير كلمة المرور
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              تغيير كلمة المرور
            </h2>
            <p className="text-gray-600">
              يجب عليك تغيير كلمة المرور عند أول تسجيل دخول
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">خطأ!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="current_password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                كلمة المرور الحالية
              </label>
              <input
                type="password"
                id="current_password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="new_password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                كلمة المرور الجديدة (8 أحرف على الأقل)
              </label>
              <input
                type="password"
                id="new_password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                type="password"
                id="confirm_password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "جاري التغيير..." : "تغيير كلمة المرور"}
            </button>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>متطلبات كلمة المرور:</strong>
                <br />• 8 أحرف على الأقل
                <br />• استخدم أحرف كبيرة وصغيرة وأرقام للأمان
              </p>
            </div>
          </form>
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
