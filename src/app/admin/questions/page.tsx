"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddQuestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lists, setLists] = useState<any>({
    subjects: [],
    programs: [],
    grades: [],
  });

  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    questionType: "mcq",
    subjectCode: "",
    programCode: "",
    gradeCode: "",
    imageUrl: "",
    points: 1,
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  useEffect(() => {
    loadReferenceLists();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/questions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionForm),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ تم إضافة السؤال بنجاح!");
        // Reset form
        setQuestionForm({
          questionText: "",
          questionType: "mcq",
          subjectCode: "",
          programCode: "",
          gradeCode: "",
          imageUrl: "",
          points: 1,
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        });
      } else {
        setMessage(`❌ خطأ: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (
    index: number,
    field: "text" | "isCorrect",
    value: string | boolean,
  ) => {
    const newOptions = [...questionForm.options];
    if (field === "isCorrect") {
      // Only one correct answer
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      newOptions[index].text = value as string;
    }
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              إضافة سؤال جديد
            </h1>
            <p className="text-sm text-gray-600">أضف سؤالاً إلى بنك الأسئلة</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← رجوع
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نص السؤال *
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={questionForm.questionText}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    questionText: e.target.value,
                  })
                }
                placeholder="اكتب السؤال هنا..."
              />
            </div>

            {/* Question Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع السؤال *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={questionForm.questionType}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      questionType: e.target.value,
                    })
                  }
                >
                  <option value="mcq">اختيار من متعدد (MCQ)</option>
                  <option value="true_false">صح/خطأ</option>
                  <option value="essay">مقالي</option>
                  <option value="oral">شفوي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  النقاط *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={questionForm.points}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      points: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            {/* Subject, Program, Grade, Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المادة *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={questionForm.subjectCode}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      subjectCode: e.target.value,
                    })
                  }
                >
                  <option value="">-- اختر مادة --</option>
                  {lists.subjects.map((s: any) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البرنامج *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={questionForm.programCode}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      programCode: e.target.value,
                    })
                  }
                >
                  <option value="">-- اختر برنامج --</option>
                  {lists.programs.map((p: any) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الصف *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={questionForm.gradeCode}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      gradeCode: e.target.value,
                    })
                  }
                >
                  <option value="">-- اختر صف --</option>
                  {lists.grades.map((g: any) => (
                    <option key={g.code} value={g.code}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة السؤال (اختياري)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setUploadingImage(true);
                    try {
                      const formData = new FormData();
                      formData.append('image', file);

                      const res = await fetch('/api/upload-image', {
                        method: 'POST',
                        body: formData,
                      });

                      const data = await res.json();
                      if (data.success) {
                        setQuestionForm({
                          ...questionForm,
                          imageUrl: data.imageUrl,
                        });
                        setMessage('✅ تم رفع الصورة بنجاح!');
                        setTimeout(() => setMessage(''), 3000);
                      } else {
                        setMessage('❌ فشل رفع الصورة: ' + data.error);
                      }
                    } catch (error: any) {
                      setMessage('❌ خطأ: ' + error.message);
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                />
                {uploadingImage && (
                  <p className="text-sm text-blue-600 mt-2">⏳ جاري رفع الصورة...</p>
                )}
                {questionForm.imageUrl && !uploadingImage && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-green-600">✅ تم رفع الصورة</span>
                      <button
                        type="button"
                        onClick={() => setQuestionForm({ ...questionForm, imageUrl: '' })}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        حذف
                      </button>
                    </div>
                    <img
                      src={questionForm.imageUrl}
                      alt="Question Preview"
                      className="h-32 object-contain rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Options (for MCQ and True/False) */}
            {(questionForm.questionType === "mcq" ||
              questionForm.questionType === "true_false") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  الخيارات * (اختر الإجابة الصحيحة)
                </label>
                <div className="space-y-3">
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={option.isCorrect}
                        onChange={() => updateOption(index, "isCorrect", true)}
                        className="w-5 h-5 text-green-600"
                      />
                      <input
                        type="text"
                        required={questionForm.questionType === "mcq"}
                        placeholder={`الخيار ${index + 1}`}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={option.text}
                        onChange={(e) =>
                          updateOption(index, "text", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? "⏳ جاري الإضافة..." : "✅ إضافة السؤال"}
            </button>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-lg text-center font-semibold ${
                  message.startsWith("✅")
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
