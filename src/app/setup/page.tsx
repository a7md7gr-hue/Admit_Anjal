'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSeed() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/seed');
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'فشل ملء قاعدة البيانات');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-white/20">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          🌱 إعداد قاعدة البيانات
        </h1>

        <p className="text-white/80 text-center mb-8">
          اضغط على الزر أدناه لملء قاعدة البيانات بالبيانات الأولية
        </p>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              جاري الملء...
            </span>
          ) : (
            '🚀 ابدأ الإعداد'
          )}
        </button>

        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-200 font-semibold">❌ خطأ:</p>
            <p className="text-white mt-2">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-green-500/20 border border-green-500 rounded-lg p-6">
            <p className="text-green-200 font-bold text-xl mb-4">✅ تم بنجاح!</p>

            <div className="space-y-3 text-white">
              <p className="font-semibold">📊 تم إضافة:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>{result.summary?.users?.superAdmin || 1} Super Admin</li>
                <li>{result.summary?.users?.managers || 6} Managers</li>
                <li>{result.summary?.users?.teachers || 10} Teachers</li>
                <li>{result.summary?.users?.students || 15} Students</li>
                <li>{result.summary?.exams || 3} Exams</li>
                <li>{result.summary?.questions || 30} Questions</li>
              </ul>

              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="font-semibold mb-3">🔐 بيانات تسجيل الدخول:</p>

                <div className="bg-white/10 rounded-lg p-4 mb-3">
                  <p className="text-green-300 font-semibold mb-2">👨‍💼 Super Admin:</p>
                  <p className="text-sm">الرقم الوطني: <span className="font-mono bg-black/30 px-2 py-1 rounded">1111111111</span></p>
                  <p className="text-sm">كلمة المرور: <span className="font-mono bg-black/30 px-2 py-1 rounded">Test@1234</span></p>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-blue-300 font-semibold mb-2">👨‍🎓 طالب:</p>
                  <p className="text-sm">الرقم الوطني: <span className="font-mono bg-black/30 px-2 py-1 rounded">5555550000</span></p>
                  <p className="text-sm">الرمز: <span className="font-mono bg-black/30 px-2 py-1 rounded">1000</span></p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <a
                  href="/"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                >
                  🏠 العودة للصفحة الرئيسية
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-white/20 text-center text-white/60 text-sm">
          <p>💻 قسم الحاسب الآلي</p>
          <p className="mt-2">🏫 مدارس الأنجال الأهلية والدولية</p>
        </div>
      </div>
    </div>
  );
}


