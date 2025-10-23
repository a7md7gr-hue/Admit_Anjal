"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export default function UploadStudentsPage() {
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

      const res = await fetch("/api/super-admin/upload-students", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(
          `✅ ${data.message}\n📊 تم إضافة ${data.count || 0} طالب بنجاح!`,
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
        "الاسم الكامل": "محمد أحمد علي",
        "رقم الهوية (10 أرقام)": "1234567890",
        "المدرسة (رمز)": "AS-BOYS",
        "البرنامج (ARABIC/INTERNATIONAL)": "ARABIC",
        "الصف (G3-G12)": "G3",
        "رمز PIN (4 أرقام)": "1234",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // Set column widths
    ws["!cols"] = [
      { wch: 25 },
      { wch: 25 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
    ];

    XLSX.writeFile(wb, "students_template.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              رفع الطلاب (Excel)
            </h1>
            <p className="text-sm text-gray-600">
              رفع ملف Excel يحتوي على بيانات الطلاب
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
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📥</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  تحميل نموذج Excel
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  قم بتحميل النموذج، املأه ببيانات الطلاب، ثم ارفعه هنا
                </p>
                <button
                  onClick={downloadTemplate}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          {Object.keys(preview[0]).map((key) => (
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
                            {Object.values(row).map((val: any, i) => (
                              <td key={i} className="px-4 py-2 text-gray-600">
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
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
                <span className="text-blue-600 font-bold">1.</span>
                <span>استخدم النموذج المحمل أعلاه - لا تغير أسماء الأعمدة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>رقم الهوية يجب أن يكون 10 أرقام بالضبط</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>رمز PIN يجب أن يكون 4 أرقام</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>
                  المدرسة: استخدم الرموز (AS-BOYS, AS-GIRLS, IS-BOYS, IS-GIRLS,
                  ELEM, SEC)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">5.</span>
                <span>البرنامج: ARABIC أو INTERNATIONAL فقط</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">6.</span>
                <span>الصف: من G3 إلى G12</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
