'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [loadingFull, setLoadingFull] = useState(false);
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

  async function handleFullSeed() {
    setLoadingFull(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'GET',
      });
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'فشل ملء قاعدة البيانات');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoadingFull(false);
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
          اختر الطريقة المناسبة لإعداد النظام
        </p>

        <div className="space-y-4">
          <button
            onClick={handleFullSeed}
            disabled={loading || loadingFull || clearing}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingFull ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جاري ملء قاعدة البيانات...
              </span>
            ) : (
              <div>
                <div className="text-lg">🎯 ملء قاعدة البيانات الكاملة</div>
                <div className="text-xs text-white/80 mt-1">
                  المدارس + البرامج + المواد + الصفوف + حسابات تجريبية
                </div>
              </div>
            )}
          </button>

          <button
            onClick={handleSeed}
            disabled={loading || loadingFull || clearing}
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
            <div>
              <div className="text-lg">🚀 إنشاء Super Admin فقط</div>
              <div className="text-xs text-white/80 mt-1">
                للاستخدام المتقدم - أضف البيانات يدوياً
              </div>
            </div>
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

              {result.summary && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-300">{result.summary.schools}</div>
                    <div className="text-xs text-white/70">مدارس</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-300">{result.summary.programs}</div>
                    <div className="text-xs text-white/70">برامج</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-300">{result.summary.grades}</div>
                    <div className="text-xs text-white/70">صفوف</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-300">{result.summary.subjects}</div>
                    <div className="text-xs text-white/70">مواد</div>
                  </div>
                </div>
              )}

              {result.credentials && (
                <div className="bg-white/10 rounded-lg p-6">
                  <p className="text-green-300 font-semibold mb-4 text-center">👨‍💼 Super Admin</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">الرقم الوطني:</span>
                      <span className="font-mono bg-black/30 px-3 py-1 rounded text-green-300">
                        {result.credentials.superAdmin?.nationalId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">كلمة المرور:</span>
                      <span className="font-mono bg-black/30 px-3 py-1 rounded text-green-300">
                        {result.credentials.superAdmin?.password}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {result.superAdmin && !result.credentials && (
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
              )}

              {result.summary?.users && (
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mt-4">
                  <p className="text-blue-200 text-sm font-semibold mb-2">👥 تم إنشاء:</p>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>✅ {result.summary.users.managers} مديرين</li>
                    <li>✅ {result.summary.users.teachers} معلمين</li>
                    <li>✅ {result.summary.users.students} طلاب</li>
                    {result.summary.questions && <li>✅ {result.summary.questions} سؤال</li>}
                    {result.summary.exams && <li>✅ {result.summary.exams} اختبار</li>}
                  </ul>
                </div>
              )}

              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mt-4">
                <p className="text-yellow-200 text-sm">
                  💡 <strong>ملاحظة:</strong> تفقد ملف <code className="bg-black/30 px-2 py-1 rounded">ACCOUNTS_DETAILS.md</code> لجميع بيانات الحسابات
                </p>
              </div>

              <div className="mt-6 text-center">
                <a
                  href="/auth/staff"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                >
                  🔐 تسجيل الدخول
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


