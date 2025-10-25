"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface QuestionRow {
  id: string;
  questionText: string;
  questionType: "mcq" | "essay" | "oral";
  points: number;
  subjectId: string;
  programId: string;
  gradeId: string;
  imageUrl: string;
  // For MCQ
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctOption: string; // "1", "2", "3", "4"
}

export default function BulkQuestionsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<QuestionRow[]>([]);
  const [lists, setLists] = useState<any>({
    schools: [],
    programs: [],
    grades: [],
    subjects: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadReferenceLists();
    addNewRow(); // Start with one empty row
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

  function generateId() {
    return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function addNewRow() {
    const newRow: QuestionRow = {
      id: generateId(),
      questionText: "",
      questionType: "mcq",
      points: 1,
      subjectId: "",
      programId: "",
      gradeId: "",
      imageUrl: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctOption: "1",
    };
    setRows([...rows, newRow]);
  }

  function removeRow(id: string) {
    if (rows.length === 1) {
      alert("يجب أن يكون هناك صف واحد على الأقل!");
      return;
    }
    setRows(rows.filter((r) => r.id !== id));
  }

  function updateRow(id: string, field: keyof QuestionRow, value: any) {
    setRows(
      rows.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: value };
        }
        return r;
      })
    );
  }

  function duplicateRow(id: string) {
    const row = rows.find((r) => r.id === id);
    if (row) {
      const newRow = { ...row, id: generateId() };
      const index = rows.findIndex((r) => r.id === id);
      const newRows = [...rows];
      newRows.splice(index + 1, 0, newRow);
      setRows(newRows);
    }
  }

  async function handleSubmit() {
    // Validate
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.questionText.trim()) {
        setMessage(`❌ الصف ${i + 1}: نص السؤال مطلوب`);
        return;
      }
      if (!row.subjectId || !row.programId || !row.gradeId) {
        setMessage(`❌ الصف ${i + 1}: المادة، البرنامج، والصف مطلوبة`);
        return;
      }
      if (row.questionType === "mcq") {
        if (!row.option1 || !row.option2) {
          setMessage(`❌ الصف ${i + 1}: يجب إدخال خيارين على الأقل للأسئلة الاختيارية`);
          return;
        }
      }
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/super-admin/questions/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: rows }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        // Clear form
        setRows([]);
        setTimeout(() => {
          addNewRow();
          setMessage("");
        }, 2000);
      } else {
        setMessage(`❌ خطأ: ${data.error}`);
      }
    } catch (error: any) {
      console.error("Error submitting bulk questions:", error);
      setMessage(`❌ حدث خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">📝 إضافة أسئلة متعددة</h1>
              <p className="text-purple-100">أضف عدة أسئلة دفعة واحدة - واجهة شبيهة بالإكسيل</p>
            </div>
            <button
              onClick={() => router.push("/super-admin")}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg"
            >
              ← العودة
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Action Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={addNewRow}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all shadow-lg"
            >
              ➕ إضافة صف
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || rows.length === 0}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "جاري الحفظ..." : `💾 حفظ الكل (${rows.length})`}
            </button>
          </div>

          <div className="bg-white rounded-xl px-6 py-3 shadow-md border-2 border-purple-200">
            <div className="text-sm text-gray-600">عدد الأسئلة</div>
            <div className="text-3xl font-bold text-purple-600">{rows.length}</div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center font-semibold ${
            message.includes("✅") 
              ? "bg-green-100 text-green-700 border-2 border-green-300" 
              : "bg-red-100 text-red-700 border-2 border-red-300"
          }`}>
            {message}
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-lg text-blue-900 mb-3">📋 التعليمات:</h3>
          <ul className="space-y-2 text-blue-800">
            <li>✅ أضف أسئلة جديدة بالضغط على "➕ إضافة صف"</li>
            <li>✅ اختر نوع السؤال: اختياري، مقالي، أو شفوي</li>
            <li>✅ للأسئلة الاختيارية: املأ الخيارات واختر الإجابة الصحيحة</li>
            <li>✅ يمكنك نسخ صف بالضغط على "📋"</li>
            <li>✅ يمكنك حذف صف بالضغط على "🗑️"</li>
            <li>✅ بعد الانتهاء، اضغط "💾 حفظ الكل"</li>
          </ul>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-4 text-center text-sm font-bold border-r border-purple-500">#</th>
                  <th className="px-4 py-4 text-right text-sm font-bold border-r border-purple-500 min-w-[300px]">نص السؤال *</th>
                  <th className="px-4 py-4 text-right text-sm font-bold border-r border-purple-500 min-w-[120px]">النوع *</th>
                  <th className="px-4 py-4 text-right text-sm font-bold border-r border-purple-500 min-w-[120px]">المادة *</th>
                  <th className="px-4 py-4 text-right text-sm font-bold border-r border-purple-500 min-w-[120px]">البرنامج *</th>
                  <th className="px-4 py-4 text-right text-sm font-bold border-r border-purple-500 min-w-[120px]">الصف *</th>
                  <th className="px-4 py-4 text-center text-sm font-bold border-r border-purple-500 min-w-[80px]">النقاط</th>
                  <th className="px-4 py-4 text-right text-sm font-bold border-r border-purple-500 min-w-[150px]">خيار 1</th>
                  <th className="px-4 py-4 text-right text-sm font-bold border-r border-purple-500 min-w-[150px]">خيار 2</th>
                  <th className="px-4 py-4 text-right text-sm font-bold border-r border-purple-500 min-w-[150px]">خيار 3</th>
                  <th className="px-4 py-4 text-right text-sm font-bold border-r border-purple-500 min-w-[150px]">خيار 4</th>
                  <th className="px-4 py-4 text-center text-sm font-bold border-r border-purple-500 min-w-[120px]">الإجابة الصحيحة</th>
                  <th className="px-4 py-4 text-center text-sm font-bold min-w-[150px]">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((row, index) => (
                  <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {/* Row Number */}
                    <td className="px-3 py-3 text-center text-sm font-bold text-gray-700 border-r border-gray-200">
                      {index + 1}
                    </td>

                    {/* Question Text */}
                    <td className="px-4 py-3 border-r border-gray-200">
                      <textarea
                        value={row.questionText}
                        onChange={(e) => updateRow(row.id, "questionText", e.target.value)}
                        placeholder="اكتب نص السؤال هنا..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        rows={2}
                      />
                    </td>

                    {/* Question Type */}
                    <td className="px-4 py-3 border-r border-gray-200">
                      <select
                        value={row.questionType}
                        onChange={(e) => updateRow(row.id, "questionType", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="mcq">اختياري</option>
                        <option value="essay">مقالي</option>
                        <option value="oral">شفوي</option>
                      </select>
                    </td>

                    {/* Subject */}
                    <td className="px-4 py-3 border-r border-gray-200">
                      <select
                        value={row.subjectId}
                        onChange={(e) => updateRow(row.id, "subjectId", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">-- اختر --</option>
                        {lists.subjects.map((s: any) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Program */}
                    <td className="px-4 py-3 border-r border-gray-200">
                      <select
                        value={row.programId}
                        onChange={(e) => updateRow(row.id, "programId", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">-- اختر --</option>
                        {lists.programs.map((p: any) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Grade */}
                    <td className="px-4 py-3 border-r border-gray-200">
                      <select
                        value={row.gradeId}
                        onChange={(e) => updateRow(row.id, "gradeId", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">-- اختر --</option>
                        {lists.grades.map((g: any) => (
                          <option key={g._id} value={g._id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Points */}
                    <td className="px-4 py-3 border-r border-gray-200">
                      <input
                        type="number"
                        min="1"
                        value={row.points}
                        onChange={(e) => updateRow(row.id, "points", parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center"
                      />
                    </td>

                    {/* Options (visible only for MCQ) */}
                    {row.questionType === "mcq" ? (
                      <>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <input
                            type="text"
                            value={row.option1}
                            onChange={(e) => updateRow(row.id, "option1", e.target.value)}
                            placeholder="الخيار الأول"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <input
                            type="text"
                            value={row.option2}
                            onChange={(e) => updateRow(row.id, "option2", e.target.value)}
                            placeholder="الخيار الثاني"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <input
                            type="text"
                            value={row.option3}
                            onChange={(e) => updateRow(row.id, "option3", e.target.value)}
                            placeholder="الخيار الثالث (اختياري)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <input
                            type="text"
                            value={row.option4}
                            onChange={(e) => updateRow(row.id, "option4", e.target.value)}
                            placeholder="الخيار الرابع (اختياري)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">
                          <select
                            value={row.correctOption}
                            onChange={(e) => updateRow(row.id, "correctOption", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center font-bold"
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </select>
                        </td>
                      </>
                    ) : (
                      <>
                        <td colSpan={5} className="px-4 py-3 text-center text-gray-400 border-r border-gray-200 italic">
                          {row.questionType === "essay" ? "سؤال مقالي - لا يحتاج خيارات" : "سؤال شفوي - لا يحتاج خيارات"}
                        </td>
                      </>
                    )}

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => duplicateRow(row.id)}
                          title="نسخ الصف"
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => removeRow(row.id)}
                          title="حذف الصف"
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={addNewRow}
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all shadow-lg"
          >
            ➕ إضافة صف آخر
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rows.length === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "جاري الحفظ..." : `💾 حفظ جميع الأسئلة (${rows.length})`}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-6">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <p>نظام إدارة القبول - مدارس الأنجال الأهلية</p>
          <p className="mt-2">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

