"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TeacherGradingPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [examId, setExamId] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchUserName();
  }, []);

  async function fetchUserName() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUserName(data.fullName || "");
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  }

  // States for adding question
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    questionType: "mcq",
    subjectId: "",
    programId: "",
    gradeId: "",
    points: 1,
    image: null as File | null,
  });
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [lists, setLists] = useState<any>({
    programs: [],
    grades: [],
    subjects: [],
  });

  useEffect(() => {
    if (activeTab === "pending") {
      loadPending();
    } else if (activeTab === "add-question") {
      loadReferenceLists();
    }
  }, [activeTab]);

  async function loadPending() {
    setMsg("Loading...");
    const r = await fetch(`/api/teacher/pending?exam_id=${examId}`);
    const d = await r.json();
    setMsg(r.ok ? "" : `❌ ${d.error || ""}`);
    setItems(r.ok ? d.items || [] : []);
  }

  async function loadReferenceLists() {
    const res = await fetch("/api/reference/lists");
    if (res.ok) {
      const data = await res.json();
      setLists(data);
    }
  }

  async function saveGrade(row: any) {
    setMsg("Saving...");
    const r = await fetch("/api/teacher/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attempt_answer_id: row.row_id,
        manual_score: Number(row.manual_score || 0),
        comment: row.comment || "",
      }),
    });
    const d = await r.json();
    setMsg(r.ok ? "Saved ✅" : `❌ ${d.error || ""}`);
    if (r.ok) setItems((prev) => prev.filter((x) => x.row_id !== row.row_id));
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    setMsg("جاري الإضافة...");

    const formData = new FormData();
    formData.append("questionText", questionForm.questionText);
    formData.append("questionType", questionForm.questionType);
    formData.append("subjectId", questionForm.subjectId);
    formData.append("programId", questionForm.programId);
    formData.append("gradeId", questionForm.gradeId);
    formData.append("points", questionForm.points.toString());

    if (questionForm.image) {
      formData.append("image", questionForm.image);
    }

    if (
      questionForm.questionType === "mcq" ||
      questionForm.questionType === "true_false"
    ) {
      formData.append("options", JSON.stringify(options));
    }

    const res = await fetch("/api/teacher/questions/create", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      setMsg("✅ تم إضافة السؤال بنجاح!");
      // Reset form
      setQuestionForm({
        questionText: "",
        questionType: "mcq",
        subjectId: "",
        programId: "",
        gradeId: "",
        points: 1,
        image: null,
      });
      setOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
    } else {
      setMsg(`❌ ${data.error || "حدث خطأ"}`);
    }
  }

  function addOption() {
    setOptions([...options, { text: "", isCorrect: false }]);
  }

  function removeOption(index: number) {
    setOptions(options.filter((_, i) => i !== index));
  }

  function updateOption(index: number, field: string, value: any) {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };

    // If setting this as correct, unset others
    if (field === "isCorrect" && value) {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.isCorrect = false;
      });
    }

    setOptions(newOptions);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <Image
                src="/anjal-logo.png"
                alt="Al-Anjal"
                width={50}
                height={50}
                priority
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">لوحة تحكم المعلم</h1>
              {userName && (
                <p className="text-sm text-green-100">مرحباً، {userName} 👋</p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
          >
            🚪 خروج
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-xl mb-6 overflow-hidden border border-gray-200">
          <div className="flex border-b overflow-x-auto bg-gray-50">
            {[
              { id: "pending", label: "📝 تصحيح الإجابات" },
              { id: "add-question", label: "➕ إضافة سؤال جديد" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105 z-10"
                    : "bg-transparent text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Pending Tab */}
            {activeTab === "pending" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    الأسئلة المعلقة للتصحيح
                  </h2>
                  <input
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                    type="number"
                    value={examId}
                    onChange={(e) => setExamId(+e.target.value)}
                  />
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    onClick={loadPending}
                  >
                    تحديث
                  </button>
                </div>

                {!items.length && (
                  <div className="text-gray-500">لا توجد عناصر معلقة حالياً</div>
                )}

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.row_id}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6"
                    >
                      <div className="flex flex-wrap justify-between gap-2 text-sm text-gray-600 mb-3">
                        <div>
                          <b className="text-blue-600">{item.student.name}</b> —{" "}
                          {item.student.nid}
                        </div>
                        <div>
                          Attempt #{item.attempt_id} • Max{" "}
                          {item.question.type === "oral"
                            ? "5"
                            : item.question.points}{" "}
                          • {item.question.type.toUpperCase()}
                          {item.question.type === "oral" && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              🎤 شفوي
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-semibold text-lg mb-2">السؤال:</div>
                      <div className="mb-3">{item.question.text}</div>
                      {item.question.type === "oral" && (
                        <div className="mb-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-blue-800 text-sm">
                            🎤 اختبار شفوي - قم بإجراء الاختبار مع الطالب وأدخل
                            الدرجة من 0 إلى 5
                          </p>
                        </div>
                      )}
                      {item.answer_text && item.question.type !== "oral" && (
                        <div className="mb-3 bg-white p-3 rounded-lg border border-gray-200">
                          <b>إجابة الطالب:</b> {item.answer_text}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <input
                          className="w-28 px-3 py-2 border border-gray-300 rounded-lg"
                          type="number"
                          placeholder={
                            item.question.type === "oral"
                              ? `0..5`
                              : `0..${item.question.points}`
                          }
                          min={0}
                          max={
                            item.question.type === "oral"
                              ? 5
                              : item.question.points
                          }
                          step={item.question.type === "oral" ? 0.5 : 1}
                          value={item.manual_score ?? ""}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((x) =>
                                x.row_id === item.row_id
                                  ? {
                                      ...x,
                                      manual_score:
                                        e.target.value === ""
                                          ? null
                                          : +e.target.value,
                                    }
                                  : x,
                              ),
                            )
                          }
                        />
                        <input
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="تعليق (اختياري)"
                          value={item.comment}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((x) =>
                                x.row_id === item.row_id
                                  ? { ...x, comment: e.target.value }
                                  : x,
                              ),
                            )
                          }
                        />
                        <button
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          onClick={() => saveGrade(item)}
                        >
                          حفظ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {msg && <div className="mt-4 text-gray-600">{msg}</div>}
              </div>
            )}

            {/* Add Question Tab */}
            {activeTab === "add-question" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  إضافة سؤال جديد
                </h2>

                <form onSubmit={handleAddQuestion} className="space-y-6">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نص السؤال
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      required
                      value={questionForm.questionText}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          questionText: e.target.value,
                        })
                      }
                      placeholder="اكتب نص السؤال هنا..."
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      صورة (اختياري)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          image: e.target.files?.[0] || null,
                        })
                      }
                    />
                  </div>

                  {/* Question Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        نوع السؤال
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={questionForm.questionType}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            questionType: e.target.value,
                          })
                        }
                      >
                        <option value="mcq">اختيار من متعدد</option>
                        <option value="true_false">صح/خطأ</option>
                        <option value="essay">مقالي</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المادة
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                        value={questionForm.subjectId}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            subjectId: e.target.value,
                          })
                        }
                      >
                        <option value="">اختر المادة</option>
                        {lists.subjects.map((s: any) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        البرنامج
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                        value={questionForm.programId}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            programId: e.target.value,
                          })
                        }
                      >
                        <option value="">اختر البرنامج</option>
                        {lists.programs.map((p: any) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الصف
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                        value={questionForm.gradeId}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            gradeId: e.target.value,
                          })
                        }
                      >
                        <option value="">اختر الصف</option>
                        {lists.grades.map((g: any) => (
                          <option key={g._id} value={g._id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Points */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      عدد النقاط
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
                      value={questionForm.points}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          points: +e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Options (for MCQ/True-False) */}
                  {(questionForm.questionType === "mcq" ||
                    questionForm.questionType === "true_false") && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          الاختيارات
                        </label>
                        {questionForm.questionType === "mcq" && (
                          <button
                            type="button"
                            onClick={addOption}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            + إضافة اختيار
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {options.map((opt, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correct-option"
                              checked={opt.isCorrect}
                              onChange={() =>
                                updateOption(index, "isCorrect", true)
                              }
                              className="w-4 h-4"
                            />
                            <input
                              type="text"
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                              placeholder={`الاختيار ${index + 1}`}
                              value={opt.text}
                              onChange={(e) =>
                                updateOption(index, "text", e.target.value)
                              }
                              required
                            />
                            {questionForm.questionType === "mcq" &&
                              options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(index)}
                                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  حذف
                                </button>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    إضافة السؤال
                  </button>

                  {msg && (
                    <div
                      className={`p-4 rounded-lg ${
                        msg.startsWith("✅")
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {msg}
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
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
