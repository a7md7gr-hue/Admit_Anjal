"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ExamsManagementPage() {
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [lists, setLists] = useState<any>({
    schools: [],
    programs: [],
    grades: [],
    subjects: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    schoolId: "",
    subjectId: "",
    programId: "",
    gradeId: "",
    startDate: "",
    endDate: "",
    duration: "60",
    totalMarks: "20",
    passingMarks: "12",
    instructions: "",
  });

  useEffect(() => {
    loadExams();
    loadReferenceLists();
    loadQuestions();
  }, []);

  async function loadExams() {
    try {
      const res = await fetch("/api/super-admin/exams");
      if (res.ok) {
        const data = await res.json();
        setExams(data.exams || []);
      }
    } catch (error) {
      console.error("Error loading exams:", error);
    }
  }

  async function loadReferenceLists() {
    try {
      const res = await fetch("/api/reference/lists");
      if (res.ok) {
        const data = await res.json();
        setLists(data);
      }
    } catch (error) {
      console.error("Error loading lists:", error);
    }
  }

  async function loadQuestions() {
    try {
      const res = await fetch("/api/super-admin/questions/list");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  }

  async function loadExamQuestions(examId: string) {
    try {
      const res = await fetch(`/api/super-admin/exams/questions?examId=${examId}`);
      if (res.ok) {
        const data = await res.json();
        setExamQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Error loading exam questions:", error);
    }
  }

  async function handleCreateExam(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/super-admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        setFormData({
          name: "",
          schoolId: "",
          subjectId: "",
          programId: "",
          gradeId: "",
          startDate: "",
          endDate: "",
          duration: "60",
          totalMarks: "20",
          passingMarks: "12",
          instructions: "",
        });
        loadExams();
        setActiveTab("list");
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteExam(examId: string, examName: string) {
    if (!confirm(`⚠️ هل أنت متأكد من حذف الامتحان: ${examName}؟`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/super-admin/exams?id=${examId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        loadExams();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddQuestionToExam(questionId: string) {
    if (!selectedExam) return;

    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/exams/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExam,
          questionIds: [questionId],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        loadExamQuestions(selectedExam);
        loadExams(); // Refresh to update total marks
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveQuestionFromExam(questionId: string) {
    if (!selectedExam) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/super-admin/exams/questions?examId=${selectedExam}&questionId=${questionId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        loadExamQuestions(selectedExam);
        loadExams();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Filter questions based on selected exam's subject/program/grade
  const getFilteredQuestions = () => {
    if (!selectedExam) return [];

    const exam = exams.find((e) => e.id === selectedExam);
    if (!exam) return [];

    // Get questions that match exam criteria and aren't already added
    const examQuestionIds = examQuestions.map((q) => q.id);
    return questions.filter(
      (q) =>
        q.subject === exam.subject &&
        q.program === exam.program &&
        q.grade === exam.grade &&
        !examQuestionIds.includes(q.id)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm shadow-lg rounded-xl mb-6 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📝 إدارة الامتحانات</h1>
          <Link
            href="/super-admin"
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            ← العودة للوحة التحكم
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.startsWith("✅")
                ? "bg-green-500/20 border border-green-500"
                : "bg-red-500/20 border border-red-500"
            }`}
          >
            <p className="text-center font-semibold">{message}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "list"
                ? "bg-white text-blue-900"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            📋 قائمة الامتحانات ({exams.length})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "create"
                ? "bg-white text-blue-900"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            ➕ إنشاء امتحان جديد
          </button>
        </div>

        {/* List Tab */}
        {activeTab === "list" && (
          <div className="space-y-6">
            {exams.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
                <p className="text-xl text-gray-300 mb-4">
                  📭 لا توجد امتحانات حالياً
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  ➕ إنشاء امتحان جديد
                </button>
              </div>
            ) : (
              exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{exam.name}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">المدرسة:</span>
                          <p className="font-semibold">{exam.school}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">المادة:</span>
                          <p className="font-semibold">{exam.subject}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">البرنامج:</span>
                          <p className="font-semibold">{exam.program}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">الصف:</span>
                          <p className="font-semibold">{exam.grade}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">المدة:</span>
                          <p className="font-semibold">{exam.duration} دقيقة</p>
                        </div>
                        <div>
                          <span className="text-gray-400">الدرجات:</span>
                          <p className="font-semibold">
                            {exam.totalMarks} / {exam.passingMarks} للنجاح
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">البداية:</span>
                          <p className="font-semibold">
                            {new Date(exam.startDate).toLocaleDateString("ar-EG")}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">النهاية:</span>
                          <p className="font-semibold">
                            {new Date(exam.endDate).toLocaleDateString("ar-EG")}
                          </p>
                        </div>
                      </div>
                      {exam.instructions && (
                        <div className="mt-3 p-3 bg-blue-500/20 rounded-lg">
                          <p className="text-sm">{exam.instructions}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedExam(exam.id);
                          loadExamQuestions(exam.id);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        📝 إدارة الأسئلة
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id, exam.name)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === "create" && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">إنشاء امتحان جديد</h2>
            <form onSubmit={handleCreateExam} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    اسم الامتحان *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="مثال: اختبار الفترة الأولى - رياضيات"
                    required
                  />
                </div>

                {/* School */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    المدرسة *
                  </label>
                  <select
                    value={formData.schoolId}
                    onChange={(e) =>
                      setFormData({ ...formData, schoolId: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  >
                    <option value="">-- اختر المدرسة --</option>
                    {lists.schools.map((school: any) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Program */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    البرنامج *
                  </label>
                  <select
                    value={formData.programId}
                    onChange={(e) =>
                      setFormData({ ...formData, programId: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  >
                    <option value="">-- اختر البرنامج --</option>
                    {lists.programs.map((program: any) => (
                      <option key={program._id} value={program._id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    الصف *
                  </label>
                  <select
                    value={formData.gradeId}
                    onChange={(e) =>
                      setFormData({ ...formData, gradeId: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  >
                    <option value="">-- اختر الصف --</option>
                    {lists.grades.map((grade: any) => (
                      <option key={grade._id} value={grade._id}>
                        {grade.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    المادة *
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectId: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  >
                    <option value="">-- اختر المادة --</option>
                    {lists.subjects.map((subject: any) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    تاريخ البدء *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    تاريخ الانتهاء *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    المدة (بالدقائق) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  />
                </div>

                {/* Total Marks */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    مجموع الدرجات *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, totalMarks: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  />
                </div>

                {/* Passing Marks */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    درجة النجاح *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.passingMarks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passingMarks: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    required
                  />
                </div>

                {/* Instructions */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    تعليمات الامتحان (اختياري)
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    rows={3}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white resize-none"
                    placeholder="مثال: اقرأ الأسئلة بعناية قبل الإجابة. استخدم الوقت المتاح بحكمة."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "جاري الإنشاء..." : "✅ إنشاء الامتحان"}
              </button>
            </form>
          </div>
        )}

        {/* Question Management Modal */}
        {selectedExam && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  📝 إدارة أسئلة الامتحان
                </h2>
                <button
                  onClick={() => {
                    setSelectedExam(null);
                    setExamQuestions([]);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  ✕ إغلاق
                </button>
              </div>

              {/* Current Questions */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">
                  الأسئلة الحالية ({examQuestions.length})
                </h3>
                {examQuestions.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    لا توجد أسئلة في هذا الامتحان بعد
                  </p>
                ) : (
                  <div className="space-y-3">
                    {examQuestions.map((q, index) => (
                      <div
                        key={q.id}
                        className="bg-white/10 p-4 rounded-lg flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <span className="font-bold text-blue-300 mr-2">
                            {index + 1}.
                          </span>
                          <span>{q.text.substring(0, 100)}...</span>
                          <span className="ml-2 text-sm text-gray-400">
                            ({q.type} - {q.points} درجات)
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveQuestionFromExam(q.id)}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Questions */}
              <div>
                <h3 className="text-xl font-bold mb-4">
                  الأسئلة المتاحة للإضافة ({getFilteredQuestions().length})
                </h3>
                {getFilteredQuestions().length === 0 ? (
                  <p className="text-gray-400 text-center py-4">
                    لا توجد أسئلة متاحة تتطابق مع معايير الامتحان
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getFilteredQuestions().map((q) => (
                      <div
                        key={q.id}
                        className="bg-white/10 p-4 rounded-lg flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <p className="mb-1">
                            {q.questionText.substring(0, 150)}...
                          </p>
                          <p className="text-sm text-gray-400">
                            {q.type} - {q.points} درجات - {q.subject}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddQuestionToExam(q.id)}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition-colors disabled:opacity-50 ml-4"
                        >
                          ➕ إضافة
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-8 text-center text-white/60 text-sm pb-4">
        <p>💻 قسم الحاسب الآلي</p>
        <p className="mt-2">🏫 مدارس الأنجال الأهلية والدولية</p>
      </footer>
    </div>
  );
}

