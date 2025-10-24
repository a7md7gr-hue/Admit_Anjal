"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export default function UploadQuestionsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");

      // Preview file
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setPreview(json.slice(0, 5)); // Show first 5 rows
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ الرجاء اختيار ملف");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/super-admin/upload-questions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(
          `✅ ${data.message}\n📊 تم إضافة ${data.count || 0} سؤال بنجاح!`,
        );
        setFile(null);
        setPreview([]);

        // Clear file input
        const fileInput = document.getElementById(
          "file-input",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setMessage(`❌ خطأ: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create sample data
    const template = [
      {
        "نص السؤال": "ما هو عاصمة المملكة العربية السعودية؟",
        "نوع السؤال (mcq/essay/oral)": "mcq",
        "المادة (AR/MATH/SCI/EN)": "AR",
        "البرنامج (ARABIC/INTERNATIONAL)": "ARABIC",
        "الصف (G3-G12)": "G3",
        النقاط: "2",
        "خيار 1": "الرياض",
        "صحيح 1 (TRUE/FALSE)": "TRUE",
        "خيار 2": "جدة",
        "صحيح 2": "FALSE",
        "خيار 3": "مكة",
        "صحيح 3": "FALSE",
        "خيار 4": "المدينة",
        "صحيح 4": "FALSE",
      },
      {
        "نص السؤال": "اكتب موضوعاً عن أهمية التعليم (لا يقل عن 5 أسطر)",
        "نوع السؤال (mcq/essay/oral)": "essay",
        "المادة (AR/MATH/SCI/EN)": "AR",
        "البرنامج (ARABIC/INTERNATIONAL)": "ARABIC",
        "الصف (G3-G12)": "G3",
        النقاط: "10",
        "خيار 1": "",
        "صحيح 1 (TRUE/FALSE)": "",
        "خيار 2": "",
        "صحيح 2": "",
        "خيار 3": "",
        "صحيح 3": "",
        "خيار 4": "",
        "صحيح 4": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");

    // Set column widths
    ws["!cols"] = [
      { wch: 50 }, // Question text
      { wch: 30 }, // Type
      { wch: 25 }, // Subject
      { wch: 30 }, // Program
      { wch: 15 }, // Grade
      { wch: 10 }, // Points
      { wch: 30 }, // Option 1
      { wch: 20 }, // Correct 1
      { wch: 30 }, // Option 2
      { wch: 20 }, // Correct 2
      { wch: 30 }, // Option 3
      { wch: 20 }, // Correct 3
      { wch: 30 }, // Option 4
      { wch: 20 }, // Correct 4
    ];

    XLSX.writeFile(wb, "questions_template.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              رفع الأسئلة (Excel)
            </h1>
            <p className="text-sm text-gray-600">
              رفع ملف Excel يحتوي على بنك الأسئلة
            </p>
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
        <div className="max-w-4xl mx-auto">
          {/* Download Template */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📥</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  تحميل نموذج Excel
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  قم بتحميل النموذج، املأه بالأسئلة، ثم ارفعه هنا
                </p>
                <button
                  onClick={downloadTemplate}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  📥 تحميل النموذج
                </button>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              رفع ملف Excel
            </h2>

            <div className="space-y-6">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اختر ملف Excel (.xlsx, .xls)
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    معاينة البيانات (أول 5 صفوف):
                  </h3>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          {Object.keys(preview[0])
                            .slice(0, 7)
                            .map((key) => (
                              <th
                                key={key}
                                className="px-4 py-2 text-right font-semibold text-gray-700"
                              >
                                {key}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {preview.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            {Object.values(row)
                              .slice(0, 7)
                              .map((val: any, i) => (
                                <td
                                  key={i}
                                  className="px-4 py-2 text-gray-600 max-w-xs truncate"
                                >
                                  {val?.toString()}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? "⏳ جاري الرفع..." : "📤 رفع الملف"}
              </button>

              {/* Message */}
              {message && (
                <div
                  className={`p-4 rounded-lg text-center font-semibold whitespace-pre-line ${
                    message.startsWith("✅")
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              📋 تعليمات مهمة:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">1.</span>
                <span>استخدم النموذج المحمل أعلاه - لا تغير أسماء الأعمدة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">2.</span>
                <span>
                  نوع السؤال: mcq (اختياري) أو essay (مقالي) أو oral (شفوي)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">3.</span>
                <span>
                  المادة: AR (عربي) أو MATH (رياضيات) أو SCI (علوم) أو EN
                  (إنجليزي)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">4.</span>
                <span>البرنامج: ARABIC أو INTERNATIONAL</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">5.</span>
                <span>الصف: من G3 إلى G12</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">6.</span>
                <span>
                  للأسئلة الاختيارية: املأ الخيارات (1-4) وحدد الإجابة الصحيحة
                  بـ TRUE
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">7.</span>
                <span>للأسئلة المقالية/الشفوية: اترك خانات الخيارات فارغة</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
