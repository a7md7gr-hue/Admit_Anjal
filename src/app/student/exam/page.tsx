"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function StudentExamPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [currentExamIndex, setCurrentExamIndex] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadExamsAndStart();
  }, []);

  async function loadExamsAndStart() {
    setLoading(true);
    setMsg("جاري تحميل الاختبارات...");

    try {
      const r = await fetch("/api/student/exams");
      const d = await r.json();

      if (!r.ok) {
        setMsg(`❌ ${d.error}`);
        setLoading(false);
        return;
      }

      setExams(d.exams || []);

      // Find first incomplete exam
      const firstIncomplete = (d.exams || []).findIndex(
        (e: any) => !e.isCompleted,
      );

      if (firstIncomplete === -1) {
        setMsg("✅ تم إكمال جميع الاختبارات!");
        setLoading(false);
        setTimeout(() => {
          router.push("/student/results");
        }, 2000);
        return;
      }

      setCurrentExamIndex(firstIncomplete);
      await startExam(d.exams[firstIncomplete].id);
    } catch (error: any) {
      setMsg(`❌ ${error.message}`);
      setLoading(false);
    }
  }

  async function startExam(examId: string) {
    setMsg("جاري بدء الاختبار...");
    setLoading(true);

    try {
      const r = await fetch("/api/attempts/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_id: examId }),
      });

      const d = await r.json();

      if (!r.ok) {
        setMsg(`❌ ${d.error}`);
        setLoading(false);
        return;
      }

      setAttemptId(d.attempt_id);

      // Get questions
      const q = await fetch(
        `/api/attempts/questions?attempt_id=${d.attempt_id}`,
      );
      const qd = await q.json();

      if (!q.ok) {
        setMsg(`❌ ${qd.error}`);
        setLoading(false);
        return;
      }

      setItems(qd.items || []);
      setMsg("✅ جاهز للإجابة");
    } catch (error: any) {
      setMsg(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function saveAnswer(qid: string, payload: any) {
    setMsg("جاري الحفظ...");

    try {
      const r = await fetch("/api/attempts/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attempt_id: attemptId,
          question_id: qid,
          ...payload,
        }),
      });

      setMsg(r.ok ? "✅ تم الحفظ" : "❌ فشل الحفظ");
    } catch (error) {
      setMsg("❌ فشل الحفظ");
    }
  }

  async function markOralReady(attemptAnswerId: string) {
    setMsg("جاري التسجيل...");
    setLoading(true);

    try {
      const r = await fetch("/api/student/oral-ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptAnswerId }),
      });

      const d = await r.json();

      if (r.ok) {
        setMsg("✅ " + d.message);
        // Update the item's isOralReady flag
        setItems((prev) =>
          prev.map((p) =>
            p.attemptAnswerId === attemptAnswerId
              ? { ...p, isOralReady: true }
              : p,
          ),
        );
      } else {
        setMsg(`❌ ${d.error || "فشل التسجيل"}`);
      }
    } catch (error: any) {
      setMsg(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!attemptId) return;

    setMsg("جاري التسليم...");
    setLoading(true);

    try {
      const r = await fetch("/api/attempts/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempt_id: attemptId }),
      });

      const d = await r.json();

      if (r.ok) {
        setMsg("✅ تم تسليم الاختبار بنجاح!");

        // Mark current exam as completed
        const updatedExams = [...exams];
        updatedExams[currentExamIndex].isCompleted = true;
        setExams(updatedExams);

        // Move to next exam
        const nextIncomplete = updatedExams.findIndex(
          (e, idx) => idx > currentExamIndex && !e.isCompleted,
        );

        if (nextIncomplete !== -1) {
          setMsg("✅ تم التسليم! جاري الانتقال للاختبار التالي...");
          setTimeout(() => {
            setCurrentExamIndex(nextIncomplete);
            startExam(updatedExams[nextIncomplete].id);
          }, 2000);
        } else {
          setMsg("🎉 تم إكمال جميع الاختبارات! جاري الانتقال للنتائج...");
          setTimeout(() => {
            router.push("/student/results");
          }, 3000);
        }
      } else {
        setMsg(`❌ ${d.error || "فشل التسليم"}`);
      }
    } catch (error: any) {
      setMsg(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const currentExam = exams[currentExamIndex];
  const answered =
    items.filter((q) => q.selected_option_id || q.free_text || q.isOralReady)
      ?.length || 0;
  const progress = items.length
    ? Math.round((answered / items.length) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <Image
                src="/anjal-logo.png"
                alt="مدارس الأنجال"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                مدارس الأنجال الأهلية والدولية
              </h1>
              <p className="text-sm text-blue-100">
                منصة الاختبارات الإلكترونية
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/student/results")}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all text-sm border border-white/30"
            >
              📊 النتائج
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm shadow-lg"
            >
              🚪 خروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Progress Checklist */}
        {exams.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border border-gray-200">
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              📋 تقدم الاختبارات
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {exams.map((exam, idx) => (
                <div
                  key={exam.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                    exam.isCompleted
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 shadow-lg"
                      : idx === currentExamIndex
                        ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-500 shadow-xl animate-pulse"
                        : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {exam.isCompleted
                        ? "✅"
                        : idx === currentExamIndex
                          ? "⏳"
                          : "⏸️"}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {exam.subject}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {exam.isCompleted
                        ? "مكتمل"
                        : idx === currentExamIndex
                          ? "جاري"
                          : "قادم"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Exam */}
        {currentExam && (
          <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {currentExam.name}
              </h2>
              <div className="text-sm bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                <span className="font-bold text-blue-700">{answered}</span>
                <span className="text-gray-600"> / </span>
                <span className="text-gray-700">{items.length}</span>
                <span className="text-gray-600 mr-1">سؤال</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>

            {/* Questions */}
            {items.length > 0 ? (
              <div className="space-y-6">
                {items.map((item, i) => (
                  <div
                    key={item.questionId}
                    className="border-b pb-6 last:border-b-0"
                  >
                    <div className="flex gap-2 mb-3">
                      <span className="font-bold text-lg text-gray-700">
                        س{i + 1}:
                      </span>
                      <p className="text-lg text-gray-900">
                        {item.questionText}
                      </p>
                    </div>

                    {/* MCQ Options */}
                    {item.questionType === "mcq" && (
                      <div className="space-y-2 mr-8">
                        {item.options?.map((opt: any) => (
                          <label
                            key={opt.id}
                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                          >
                            <input
                              type="radio"
                              name={`q${item.questionId}`}
                              checked={item.selected_option_id === opt.id}
                              onChange={() =>
                                saveAnswer(item.questionId, {
                                  selected_option_id: opt.id,
                                })
                              }
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="text-gray-900">
                              {opt.optionText}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Essay */}
                    {item.questionType === "essay" && (
                      <div className="mr-8">
                        <textarea
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                          placeholder="اكتب إجابتك هنا..."
                          defaultValue={item.free_text || ""}
                          onBlur={(e) =>
                            saveAnswer(item.questionId, {
                              free_text: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}

                    {/* Oral */}
                    {item.questionType === "oral" && (
                      <div className="mr-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-purple-900 font-semibold mb-3">
                          🎤 سؤال شفوي - عند الاستعداد، اضغط على زر "أنا جاهز"
                        </p>
                        {item.isOralReady ? (
                          <div className="text-green-700 font-semibold">
                            ✅ تم التسجيل - سيقوم المعلم بتقييمك قريباً
                          </div>
                        ) : (
                          <button
                            onClick={() => markOralReady(item.attemptAnswerId)}
                            disabled={loading}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            ✋ أنا جاهز للاختبار الشفوي
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {loading ? "جاري التحميل..." : "لا توجد أسئلة"}
              </div>
            )}

            {/* Submit Button */}
            {items.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={submit}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? "جاري التسليم..." : "📤 تسليم الاختبار"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Message */}
        {msg && (
          <div
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-xl text-white font-semibold ${
              msg.startsWith("✅") || msg.startsWith("🎉")
                ? "bg-green-600"
                : msg.startsWith("❌")
                  ? "bg-red-600"
                  : "bg-blue-600"
            }`}
          >
            {msg}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-600">
          <p>قسم الحاسب الآلي</p>
          <p className="mt-1 text-xs text-gray-500">
            مدارس الأنجال الأهلية والدولية © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
