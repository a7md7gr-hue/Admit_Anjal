"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GradeApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadApprovals();
  }, [filter]);

  async function loadApprovals() {
    try {
      const res = await fetch(`/api/manager/grade-approvals?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals || []);
      }
    } catch (error) {
      console.error("Error loading approvals:", error);
    }
  }

  const handleApprove = async (
    studentId: string,
    examId: string,
    status: string,
    notes: string = "",
  ) => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/manager/grade-approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, examId, status, notes }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ تم تحديث الاعتماد بنجاح");
        loadApprovals();
      } else {
        setMessage(`❌ خطأ: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">اعتماد الدرجات</h1>
            <p className="text-sm text-gray-600">
              اعتماد درجات الطلاب (مقبول/غير مقبول/قبول مشروط)
            </p>
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
        <div className="bg-white rounded-xl shadow-lg p-8">
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

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 border-b">
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 border-b-2 transition-colors ${
                filter === "pending"
                  ? "border-green-600 text-green-600 font-semibold"
                  : "border-transparent text-gray-500"
              }`}
            >
              قيد الانتظار
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 border-b-2 transition-colors ${
                filter === "approved"
                  ? "border-green-600 text-green-600 font-semibold"
                  : "border-transparent text-gray-500"
              }`}
            >
              مقبول
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-2 border-b-2 transition-colors ${
                filter === "rejected"
                  ? "border-green-600 text-green-600 font-semibold"
                  : "border-transparent text-gray-500"
              }`}
            >
              غير مقبول
            </button>
            <button
              onClick={() => setFilter("conditional_approved")}
              className={`px-4 py-2 border-b-2 transition-colors ${
                filter === "conditional_approved"
                  ? "border-green-600 text-green-600 font-semibold"
                  : "border-transparent text-gray-500"
              }`}
            >
              قبول مشروط
            </button>
          </div>

          {/* Approvals Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    الطالب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    رقم الهوية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    المدرسة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    الصف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    الاختبار
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {approvals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      لا يوجد طلاب للاعتماد
                    </td>
                  </tr>
                ) : (
                  approvals.map((approval: any) => (
                    <tr key={approval.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {approval.student}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {approval.nationalId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {approval.school}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {approval.grade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {approval.exam}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            approval.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : approval.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : approval.status === "conditional_approved"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {approval.status === "approved"
                            ? "مقبول"
                            : approval.status === "rejected"
                              ? "غير مقبول"
                              : approval.status === "conditional_approved"
                                ? "قبول مشروط"
                                : "قيد الانتظار"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {approval.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleApprove(
                                  approval.studentId,
                                  approval.examId,
                                  "approved",
                                )
                              }
                              disabled={loading}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                            >
                              قبول
                            </button>
                            <button
                              onClick={() =>
                                handleApprove(
                                  approval.studentId,
                                  approval.examId,
                                  "rejected",
                                )
                              }
                              disabled={loading}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                            >
                              رفض
                            </button>
                            <button
                              onClick={() =>
                                handleApprove(
                                  approval.studentId,
                                  approval.examId,
                                  "conditional_approved",
                                )
                              }
                              disabled={loading}
                              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition disabled:opacity-50"
                            >
                              قبول مشروط
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}


