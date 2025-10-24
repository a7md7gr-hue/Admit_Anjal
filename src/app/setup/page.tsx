'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  async function handleSeed() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/init-admin', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'فشل إنشاء Super Admin');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  async function handleClearDatabase() {
    if (!clearConfirm) {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 5000);
      return;
    }

    setClearing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/clear-database', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        alert('✅ ' + data.message);
        window.location.reload();
      } else {
        setError(data.error || 'فشل مسح قاعدة البيانات');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setClearing(false);
      setClearConfirm(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-white/20">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          🌱 إعداد قاعدة البيانات
        </h1>

        <p className="text-white/80 text-center mb-8">
          اضغط على الزر أدناه لإنشاء حساب Super Admin
        </p>

        <div className="space-y-4">
          <button
            onClick={handleSeed}
            disabled={loading || clearing}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              جاري الإنشاء...
            </span>
          ) : (
            '🚀 إنشاء Super Admin'
          )}
          </button>

          <button
            onClick={handleClearDatabase}
            disabled={loading || clearing}
            className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              clearConfirm
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 animate-pulse'
                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
            } text-white`}
          >
            {clearing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جاري المسح...
              </span>
            ) : clearConfirm ? (
              '⚠️ اضغط مرة ثانية للتأكيد - سيتم مسح كل شيء!'
            ) : (
              '🗑️ مسح قاعدة البيانات بالكامل'
            )}
          </button>

          {clearConfirm && (
            <p className="text-yellow-300 text-sm text-center animate-pulse">
              ⚠️ تحذير: سيتم حذف جميع البيانات نهائياً! (5 ثواني)
            </p>
          )}
        </div>

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
              <p className="font-semibold text-center mb-4">✅ {result.message}</p>

              <div className="bg-white/10 rounded-lg p-6">
                <p className="text-green-300 font-semibold mb-4 text-center">👨‍💼 Super Admin</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">الاسم:</span>
                    <span className="font-semibold">{result.superAdmin?.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">الرقم الوطني:</span>
                    <span className="font-mono bg-black/30 px-3 py-1 rounded text-green-300">
                      {result.superAdmin?.nationalId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">كلمة المرور:</span>
                    <span className="font-mono bg-black/30 px-3 py-1 rounded text-green-300">
                      {result.superAdmin?.password}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mt-4">
                <p className="text-yellow-200 text-sm">
                  💡 <strong>ملاحظة:</strong> الآن يمكنك إضافة المدارس، البرامج، المواد، المعلمين والطلاب من لوحة Super Admin
                </p>
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


