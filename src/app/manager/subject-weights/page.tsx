"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SubjectWeightsPage() {
  const router = useRouter();
  const [weights, setWeights] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadReferenceLists();
    loadWeights();
  }, []);

  async function loadReferenceLists() {
    try {
      const res = await fetch("/api/reference/lists");
      if (res.ok) {
        const data = await res.json();
        setGrades(data.grades || []);
        setSubjects(data.subjects || []);
        if (data.grades.length > 0) {
          setSelectedGrade(data.grades[0].code);
        }
      }
    } catch (error) {
      console.error("Error loading lists:", error);
    }
  }

  async function loadWeights() {
    try {
      const res = await fetch("/api/manager/subject-weights");
      if (res.ok) {
        const data = await res.json();
        setWeights(data.weights || []);
      }
    } catch (error) {
      console.error("Error loading weights:", error);
    }
  }

  const handleUpdateWeight = async (
    subjectCode: string,
    gradeCode: string,
    weight: number,
  ) => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/manager/subject-weights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectCode, gradeCode, weight }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ تم تحديث الوزن بنجاح");
        loadWeights();
      } else {
        setMessage(`❌ خطأ: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const gradeWeights = weights.filter((w) => w.gradeCode === selectedGrade);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              إدارة أوزان المواد
            </h1>
            <p className="text-sm text-gray-600">تحديد وزن كل مادة لكل صف</p>
          </div>
          <Link
            href="/manager"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← رجوع
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.startsWith("✅")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          {/* Grade Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختر الصف
            </label>
            <select
              className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              {grades.map((g: any) => (
                <option key={g.code} value={g.code}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Weights Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    المادة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    الوزن (%)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map((subject: any) => {
                  const currentWeight = gradeWeights.find(
                    (w) => w.subjectCode === subject.code,
                  );
                  const [tempWeight, setTempWeight] = useState(
                    currentWeight?.weight || 25,
                  );

                  return (
                    <tr key={subject.code}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {subject.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500"
                          value={tempWeight}
                          onChange={(e) =>
                            setTempWeight(Number(e.target.value))
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleUpdateWeight(
                              subject.code,
                              selectedGrade,
                              tempWeight,
                            )
                          }
                          disabled={loading}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? "جاري الحفظ..." : "حفظ"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>ملحوظة:</strong> مجموع أوزان المواد يجب أن يساوي 100%
              لكل صف.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

