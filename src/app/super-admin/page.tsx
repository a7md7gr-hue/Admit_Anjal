"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState(""); // To track user role (OWNER vs SUPER_ADMIN)
  const [clearing, setClearing] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [emptying, setEmptying] = useState(false);
  const [emptyConfirm, setEmptyConfirm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Form states
  const [userForm, setUserForm] = useState({
    fullName: "",
    nationalId: "",
    role: "manager",
    schoolId: "",
  });

  const [studentForm, setStudentForm] = useState({
    fullName: "",
    nationalId: "",
    schoolId: "",
    programId: "",
    gradeId: "",
    phone1: "",
    phone2: "",
  });

  const [users, setUsers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  const [lists, setLists] = useState<any>({
    schools: [],
    programs: [],
    grades: [],
    subjects: [],
    categories: [],
  });

  // Auth check on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          // Not authenticated
          console.log("❌ Not authenticated, redirecting to login");
          router.push("/auth/staff");
          return;
        }
        const data = await res.json();
        const role = data.role?.toUpperCase() || data.user?.role?.toUpperCase();
        
        if (!role || !["SUPER_ADMIN", "OWNER"].includes(role)) {
          console.log("❌ Insufficient permissions, redirecting");
          router.push("/auth/staff");
          return;
        }
        
        console.log("✅ Authenticated as:", role);
        setIsAuthenticated(true);
        setAuthLoading(false);
        
        // Load data only after auth confirmed
        loadStats();
        loadReferenceLists();
        fetchUserName();
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/auth/staff");
      }
    }
    
    checkAuth();
  }, [router]);

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    if (!userSearchTerm) return true;
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.nationalId?.includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    if (!studentSearchTerm) return true;
    const searchLower = studentSearchTerm.toLowerCase();
    return (
      student.fullName?.toLowerCase().includes(searchLower) ||
      student.nationalId?.includes(searchLower) ||
      student.pin4?.includes(searchLower) ||
      student.school?.toLowerCase().includes(searchLower) ||
      student.grade?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    
    console.log(`📍 Active tab changed to: ${activeTab}`);
    
    if (activeTab === "users") {
      loadUsers();
    } else if (activeTab === "students") {
      loadStudents();
    } else if (activeTab === "questions") {
      console.log("🔄 Loading questions for questions tab...");
      loadQuestions();
    } else if (activeTab === "reports") {
      loadReports();
    }
  }, [activeTab, isAuthenticated]);

  async function handleEmptyDatabase() {
    if (!emptyConfirm) {
      setEmptyConfirm(true);
      setTimeout(() => setEmptyConfirm(false), 5000);
      return;
    }

    if (!confirm("⚠️ تحذير: سيتم تفريغ قاعدة البيانات من البيانات الديناميكية!\n\nسيتم حذف: الطلاب، المعلمين، الأسئلة، الاختبارات، المحاولات\n\nهل أنت متأكد؟")) {
      setEmptyConfirm(false);
      return;
    }

    setEmptying(true);
    setMessage("");

    try {
      const response = await fetch('/api/empty-database', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setMessage("✅ " + data.message);
        setTimeout(() => {
          setMessage("");
          loadStats();
        }, 3000);
      } else {
        setMessage("❌ خطأ: " + data.error);
      }
    } catch (err: any) {
      setMessage("❌ خطأ: " + err.message);
    } finally {
      setEmptying(false);
      setEmptyConfirm(false);
    }
  }

  async function handleClearDatabase() {
    if (!clearConfirm) {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 5000);
      return;
    }

    if (!confirm("⚠️ تحذير نهائي: سيتم مسح جميع البيانات نهائياً!\n\nهل أنت متأكد 100%؟")) {
      setClearConfirm(false);
      return;
    }

    setClearing(true);
    setMessage("");

    try {
      const response = await fetch('/api/clear-database', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setMessage("✅ تم مسح قاعدة البيانات بنجاح!");
        alert(data.message + "\n\nسيتم إعادة تحميل الصفحة...");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setMessage("❌ خطأ: " + data.error);
      }
    } catch (err: any) {
      setMessage("❌ خطأ: " + err.message);
    } finally {
      setClearing(false);
      setClearConfirm(false);
    }
  }

  async function fetchUserName() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUserName(data.fullName || "");
        setUserRole(data.role || ""); // Get user role (OWNER, SUPER_ADMIN, etc.)
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  }

  async function loadUsers() {
    try {
      const res = await fetch("/api/super-admin/users/list");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }

  async function loadStudents() {
    try {
      const res = await fetch("/api/super-admin/students/list");
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    }
  }

  async function loadQuestions() {
    setLoading(true);
    try {
      console.log("📊 Loading questions...");
      const res = await fetch("/api/super-admin/questions/list");
      console.log("📊 Response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("📊 Questions data:", data);
        console.log("📊 Questions count:", data.questions?.length || 0);
        setQuestions(data.questions || []);
      } else {
        console.error("❌ Failed to load questions:", res.status);
      }
    } catch (error) {
      console.error("❌ Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadReports() {
    try {
      const res = await fetch("/api/super-admin/reports/overview");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  }

  async function loadStats() {
    try {
      const res = await fetch("/api/super-admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        
        // Also update lists if available in stats
        if (data.schools || data.programs || data.grades || data.subjects) {
          setLists({
            schools: data.schools || [],
            programs: data.programs || [],
            grades: data.grades || [],
            subjects: data.subjects || [],
            categories: lists.categories || [],
          });
        }
      }
    } catch (error) {
      console.error("Error loading stats:", error);
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

  async function handleAddSchool(name: string, code: string) {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/super-admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, shortCode: code }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ تمت إضافة المدرسة: ${name}`);
        loadReferenceLists(); // Refresh list
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ ${data.error || "فشلت الإضافة"}`);
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSchool(schoolId: string, schoolName: string) {
    if (!confirm(`⚠️ هل أنت متأكد من حذف المدرسة: ${schoolName}؟\nهذا الإجراء لا يمكن التراجع عنه!`)) {
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/super-admin/schools?id=${schoolId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ تم حذف المدرسة: ${schoolName}`);
        loadReferenceLists(); // Refresh list
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`❌ ${data.error || "فشل الحذف"}`);
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/super-admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(
          `✅ تم إنشاء المستخدم بنجاح! الرقم الوطني: ${data.user.nationalId}`,
        );
        setUserForm({
          fullName: "",
          nationalId: "",
          role: "manager",
          schoolId: "",
        });
        loadStats();
        loadUsers();
      } else {
        setMessage(`❌ خطأ: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateStudent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/super-admin/students/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentForm),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}! PIN: ${data.student.pin4}`);
        setStudentForm({
          fullName: "",
          nationalId: "",
          schoolId: "",
          programId: "",
          gradeId: "",
          phone1: "",
          phone2: "",
        });
        loadStudents();
      } else {
        setMessage(`❌ خطأ: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(userId: string) {
    if (!confirm("هل تريد إعادة تعيين كلمة المرور لهذا المستخدم؟")) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/super-admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ خطأ: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (
      !confirm(
        "⚠️ هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه!",
      )
    ) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/super-admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        loadUsers();
      } else {
        setMessage(`❌ خطأ: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (!confirm("⚠️ هل أنت متأكد من حذف هذا السؤال؟")) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/super-admin/questions/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        loadQuestions();
      } else {
        setMessage(`❌ خطأ: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="text-center">
          <div className="inline-block animate-spin h-16 w-16 border-4 border-white border-t-transparent rounded-full mb-4"></div>
          <p className="text-white text-xl font-semibold">🔐 جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Only render if authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <p className="text-white text-xl font-semibold">غير مصرح... جاري التحويل</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
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
              <h1 className="text-xl font-bold text-white">
                لوحة تحكم Super Admin 👑
              </h1>
              {userName && (
                <p className="text-sm text-indigo-100">مرحباً، {userName} 👋</p>
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
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: "overview", label: "📊 نظرة عامة" },
              { id: "users", label: "👥 إدارة المستخدمين" },
              { id: "schools", label: "🏫 المدارس" },
              { id: "students", label: "👨‍🎓 الطلاب" },
              { id: "questions", label: "❓ بنك الأسئلة" },
              { id: "reports", label: "📈 التقارير" },
              { id: "database", label: "🗄️ إدارة قاعدة البيانات" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  نظرة عامة على النظام
                </h2>

                {/* Quick Actions */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => router.push("/super-admin/exams")}
                    className="bg-gradient-to-r from-purple-600 to-pink-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-800 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">📝</span>
                    <span>إدارة الامتحانات</span>
                  </button>

                  <button
                    onClick={() => router.push("/super-admin/schools")}
                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">🏫</span>
                    <span>إدارة المدارس</span>
                  </button>

                  <button
                    onClick={() => router.push("/super-admin/assignments")}
                    className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-800 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">🔗</span>
                    <span>إدارة الربط</span>
                  </button>

                  <button
                    onClick={() => router.push("/super-admin/upload-students")}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">📤</span>
                    <span>رفع الطلاب (Excel)</span>
                  </button>

                  <button
                    onClick={() => router.push("/super-admin/bulk-questions")}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">📝</span>
                    <span>إضافة أسئلة متعددة</span>
                  </button>

                  <button
                    onClick={() => router.push("/super-admin/upload-questions")}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">📤</span>
                    <span>رفع الأسئلة (Excel)</span>
                  </button>
                </div>

                {stats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                      <div className="text-4xl font-bold mb-2">
                        {stats.totalStudents || 0}
                      </div>
                      <div className="text-blue-100">إجمالي الطلاب</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                      <div className="text-4xl font-bold mb-2">
                        {stats.totalTeachers || 0}
                      </div>
                      <div className="text-green-100">المعلمون</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                      <div className="text-4xl font-bold mb-2">
                        {stats.totalManagers || 0}
                      </div>
                      <div className="text-purple-100">مدراء المدارس</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                      <div className="text-4xl font-bold mb-2">
                        {stats.totalSchools || 6}
                      </div>
                      <div className="text-orange-100">المدارس</div>
                    </div>

                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
                      <div className="text-4xl font-bold mb-2">
                        {stats.totalQuestions || 0}
                      </div>
                      <div className="text-pink-100">الأسئلة</div>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg">
                      <div className="text-4xl font-bold mb-2">
                        {stats.totalExams || 0}
                      </div>
                      <div className="text-cyan-100">الاختبارات</div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6 shadow-lg">
                      <div className="text-4xl font-bold mb-2">
                        {stats.totalAttempts || 0}
                      </div>
                      <div className="text-yellow-100">المحاولات</div>
                    </div>

                    <div 
                      onClick={() => router.push("/super-admin/tracking")}
                      className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg cursor-pointer hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
                    >
                      <div className="text-4xl font-bold mb-2">
                        {stats.pendingGrading || 0}
                      </div>
                      <div className="text-red-100">قيد التصحيح 👆</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    جاري التحميل...
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  إنشاء مستخدم جديد
                </h2>

                <form
                  onSubmit={handleCreateUser}
                  className="bg-gray-50 p-6 rounded-lg space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={userForm.fullName}
                      onChange={(e) =>
                        setUserForm({ ...userForm, fullName: e.target.value })
                      }
                      placeholder="مثال: محمد أحمد"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رقم الهوية الوطنية (10 أرقام)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={userForm.nationalId}
                      onChange={(e) => {
                        // قبول الأرقام فقط
                        const value = e.target.value.replace(/\D/g, "");
                        setUserForm({ ...userForm, nationalId: value });
                      }}
                      placeholder="1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الدور
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={userForm.role}
                      onChange={(e) =>
                        setUserForm({ ...userForm, role: e.target.value })
                      }
                    >
                      <option value="manager">مدير مدرسة</option>
                      <option value="supervisor">مشرف</option>
                      <option value="teacher">معلم</option>
                      <option value="super_admin">مدير نظام</option>
                    </select>
                  </div>

                  {userForm.role === "manager" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المدرسة
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={userForm.schoolId}
                        onChange={(e) =>
                          setUserForm({ ...userForm, schoolId: e.target.value })
                        }
                      >
                        <option value="">-- اختر مدرسة --</option>
                        {lists.schools.map((school: any) => (
                          <option key={school.id} value={school.id}>
                            {school.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "جاري الإنشاء..." : "إنشاء المستخدم"}
                  </button>

                  {message && (
                    <div
                      className={`p-4 rounded-lg ${
                        message.startsWith("✅")
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>ملاحظة:</strong> كلمة المرور الافتراضية:{" "}
                      <code className="bg-white px-2 py-1 rounded">
                        Test@1234
                      </code>
                      <br />
                      سيُطلب من المستخدم تغييرها عند أول تسجيل دخول.
                    </p>
                  </div>
                </form>

                {/* Users List */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      قائمة المستخدمين ({filteredUsers.length})
                    </h2>
                    <div className="w-96">
                      <input
                        type="text"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        placeholder="🔍 ابحث بالاسم، الهوية، البريد، أو الدور..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {filteredUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                              الاسم
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                              رقم الهوية
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                              الدور
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                              تاريخ الإنشاء
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                              الإجراءات
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredUsers.map((user: any) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {user.fullName}
                              </td>
                              <td className="px-6 py-4 text-sm font-mono text-gray-600">
                                {user.nationalId}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(user.createdAt).toLocaleDateString(
                                  "ar-EG",
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleResetPassword(user.id)}
                                    disabled={loading}
                                    className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors disabled:opacity-50"
                                    title="إعادة تعيين كلمة المرور"
                                  >
                                    🔑 استعادة
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    disabled={loading}
                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                                    title="حذف المستخدم"
                                  >
                                    🗑️ حذف
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      {loading ? "جاري التحميل..." : "لا يوجد مستخدمون حالياً"}
                    </div>
                  )}

                  {message && (
                    <div
                      className={`mt-4 p-4 rounded-lg ${
                        message.startsWith("✅")
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Schools Tab */}
            {activeTab === "schools" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    المدارس المسجلة ({lists.schools.length})
                  </h2>
                  <button
                    onClick={() => {
                      const schoolName = prompt('أدخل اسم المدرسة:');
                      const schoolCode = prompt('أدخل رمز المدرسة (مثل: ANB):');
                      if (schoolName && schoolCode) {
                        handleAddSchool(schoolName, schoolCode);
                      }
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center gap-2"
                  >
                    <span>➕</span>
                    <span>إضافة مدرسة</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lists.schools.map((school: any) => (
                    <div
                      key={school.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {school.name}
                          </h3>
                          <p className="text-sm font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                            الرمز: {school.code}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteSchool(school.id, school.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 text-sm font-semibold"
                          title="حذف المدرسة"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {lists.schools.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">لا توجد مدارس مسجلة</p>
                    <p className="text-gray-400 text-sm mt-2">
                      اضغط على "إضافة مدرسة" لإضافة مدرسة جديدة
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Students Tab */}
            {activeTab === "students" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    إضافة طالب جديد
                  </h2>
                  <button
                    onClick={() => router.push("/super-admin/upload-students")}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center gap-2"
                  >
                    <span>📤</span>
                    <span>رفع الطلاب (Excel)</span>
                  </button>
                </div>

                <form
                  onSubmit={handleCreateStudent}
                  className="bg-gray-50 p-6 rounded-lg space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الاسم الكامل
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={studentForm.fullName}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            fullName: e.target.value,
                          })
                        }
                        placeholder="مثال: محمد أحمد"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رقم الهوية الوطنية (10 أرقام)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={studentForm.nationalId}
                        onChange={(e) => {
                          // قبول الأرقام فقط
                          const value = e.target.value.replace(/\D/g, "");
                          setStudentForm({ ...studentForm, nationalId: value });
                        }}
                        placeholder="1234567890"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        المدرسة
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={studentForm.schoolId}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            schoolId: e.target.value,
                          })
                        }
                      >
                        <option value="">-- اختر مدرسة --</option>
                        {lists.schools.map((school: any) => (
                          <option key={school.id} value={school.id}>
                            {school.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        البرنامج
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={studentForm.programId}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            programId: e.target.value,
                          })
                        }
                      >
                        <option value="">-- اختر برنامج --</option>
                        {lists.programs.map((program: any) => (
                          <option key={program._id} value={program._id}>
                            {program.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الصف
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={studentForm.gradeId}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            gradeId: e.target.value,
                          })
                        }
                      >
                        <option value="">-- اختر صف --</option>
                        {lists.grades.map((grade: any) => (
                          <option key={grade._id} value={grade._id}>
                            {grade.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رقم الهاتف 1 (مطلوب) *
                      </label>
                      <input
                        type="text"
                        required
                        pattern="\+966\d{9}"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={studentForm.phone1}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            phone1: e.target.value,
                          })
                        }
                        placeholder="+966501234567"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        يجب أن يبدأ بـ +966 ويتبعه 9 أرقام
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رقم الهاتف 2 (اختياري)
                      </label>
                      <input
                        type="text"
                        pattern="\+966\d{9}"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={studentForm.phone2}
                        onChange={(e) =>
                          setStudentForm({
                            ...studentForm,
                            phone2: e.target.value,
                          })
                        }
                        placeholder="+966501234567"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        اختياري - يجب أن يبدأ بـ +966 ويتبعه 9 أرقام
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "جاري الإضافة..." : "إضافة الطالب"}
                  </button>

                  {message && (
                    <div
                      className={`p-4 rounded-lg ${
                        message.startsWith("✅")
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {message}
                    </div>
                  )}
                </form>

                {/* Students List */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      قائمة الطلاب ({filteredStudents.length})
                    </h2>
                    <div className="w-96">
                      <input
                        type="text"
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        placeholder="🔍 ابحث بالاسم، الهوية، المدرسة، الصف، أو PIN..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                              الاسم
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                              رقم الهوية
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                              المدرسة
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                              البرنامج
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                              الصف
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                              PIN
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredStudents.map((student: any) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {student.fullName}
                              </td>
                              <td className="px-6 py-4 text-sm font-mono text-gray-600">
                                {student.nationalId}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {student.school}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {student.program}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {student.grade}
                              </td>
                              <td className="px-6 py-4 text-sm font-mono text-blue-600 font-semibold">
                                {student.pin4}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      {loading ? "جاري التحميل..." : "لا يوجد طلاب حالياً"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Questions Tab */}
            {activeTab === "questions" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    بنك الأسئلة ({questions.length})
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push("/admin/questions")}
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md flex items-center gap-2"
                    >
                      <span>➕</span>
                      <span>إضافة سؤال</span>
                    </button>
                    <button
                      onClick={() => router.push("/super-admin/bulk-questions")}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2"
                    >
                      <span>📝</span>
                      <span>إضافة أسئلة متعددة</span>
                    </button>
                    <button
                      onClick={() =>
                        router.push("/super-admin/upload-questions")
                      }
                      className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md flex items-center gap-2"
                    >
                      <span>📤</span>
                      <span>رفع Excel</span>
                    </button>
                  </div>
                </div>

                {questions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                            نص السؤال
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                            النوع
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                            المادة
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                            الصف
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                            النقاط
                          </th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {questions.map((q: any) => (
                          <tr key={q.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {q.questionText}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  q.questionType === "mcq"
                                    ? "bg-blue-100 text-blue-800"
                                    : q.questionType === "essay"
                                      ? "bg-green-100 text-green-800"
                                      : q.questionType === "oral"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {q.questionType === "mcq"
                                  ? "اختياري"
                                  : q.questionType === "essay"
                                    ? "مقالي"
                                    : q.questionType === "oral"
                                      ? "شفوي"
                                      : q.questionType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {q.subject}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {q.grade}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                              {q.points}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                disabled={loading}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                                title="حذف السؤال"
                              >
                                🗑️ حذف
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {loading ? "جاري التحميل..." : "لا توجد أسئلة حالياً"}
                  </div>
                )}

                {message && (
                  <div
                    className={`mt-4 p-4 rounded-lg ${
                      message.startsWith("✅")
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  التقارير والإحصائيات الشاملة
                </h2>

                {reports ? (
                  <div className="space-y-6">
                    {/* Overview Cards */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        📊 نظرة عامة
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                          <div className="text-3xl font-bold mb-1">
                            {reports.overview.totalStudents}
                          </div>
                          <div className="text-blue-100 text-sm">
                            إجمالي الطلاب
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                          <div className="text-3xl font-bold mb-1">
                            {reports.overview.totalTeachers}
                          </div>
                          <div className="text-green-100 text-sm">المعلمون</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                          <div className="text-3xl font-bold mb-1">
                            {reports.overview.totalQuestions}
                          </div>
                          <div className="text-purple-100 text-sm">الأسئلة</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                          <div className="text-3xl font-bold mb-1">
                            {reports.overview.totalExams}
                          </div>
                          <div className="text-orange-100 text-sm">
                            الاختبارات
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Questions by Type */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        ❓ الأسئلة حسب النوع
                      </h3>
                      <div className="bg-white rounded-xl shadow p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600">
                              {reports.questionsByType.mcq}
                            </div>
                            <div className="text-gray-600 text-sm mt-1">
                              أسئلة اختياري
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-green-600">
                              {reports.questionsByType.essay}
                            </div>
                            <div className="text-gray-600 text-sm mt-1">
                              أسئلة مقالية
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600">
                              {reports.questionsByType.oral}
                            </div>
                            <div className="text-gray-600 text-sm mt-1">
                              أسئلة شفوية
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Students by School */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        🏫 توزيع الطلاب على المدارس
                      </h3>
                      <div className="bg-white rounded-xl shadow overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                المدرسة
                              </th>
                              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                عدد الطلاب
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {reports.studentsBySchool.map(
                              (item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm text-gray-900">
                                    {item._id}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                    {item.count}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Questions by Subject */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        📚 توزيع الأسئلة على المواد
                      </h3>
                      <div className="bg-white rounded-xl shadow overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                المادة
                              </th>
                              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                عدد الأسئلة
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {reports.questionsBySubject.map(
                              (item: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 text-sm text-gray-900">
                                    {item._id}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                    {item.count}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Attempts Overview */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        📝 إحصائيات المحاولات
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl shadow p-6 text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {reports.overview.totalAttempts}
                          </div>
                          <div className="text-gray-600 text-sm mt-1">
                            إجمالي المحاولات
                          </div>
                        </div>
                        <div className="bg-white rounded-xl shadow p-6 text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {reports.overview.completedAttempts}
                          </div>
                          <div className="text-gray-600 text-sm mt-1">
                            محاولات مكتملة
                          </div>
                        </div>
                        <div className="bg-white rounded-xl shadow p-6 text-center">
                          <div className="text-3xl font-bold text-red-600">
                            {reports.overview.pendingGrading}
                          </div>
                          <div className="text-gray-600 text-sm mt-1">
                            قيد التصحيح
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    جاري تحميل التقارير...
                  </div>
                )}
              </div>
            )}

            {/* Database Management Tab */}
            {activeTab === "database" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🗄️ إدارة قاعدة البيانات
                </h2>

                {/* Change User Role Section */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-2xl p-8 mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-5xl">🔄</div>
                    <div>
                      <h3 className="text-2xl font-bold text-blue-700 mb-2">
                        تغيير دور مستخدم
                      </h3>
                      <p className="text-blue-600">
                        قم بتغيير دور أي مستخدم في النظام (ما عدا Owner)
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6">
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const nationalId = formData.get('changeRoleNationalId') as string;
                        const newRole = formData.get('newRole') as string;

                        if (!nationalId || !newRole) {
                          setMessage('❌ رقم الهوية والدور الجديد مطلوبان');
                          return;
                        }

                        setLoading(true);
                        setMessage('');

                        try {
                          const res = await fetch('/api/super-admin/change-user-role', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ nationalId, newRole }),
                          });

                          const data = await res.json();

                          if (res.ok) {
                            setMessage(data.message);
                            loadUsers();
                            (e.target as HTMLFormElement).reset();
                          } else {
                            setMessage(`❌ ${data.error}`);
                          }
                        } catch (error: any) {
                          setMessage(`❌ ${error.message || 'حدث خطأ'}`);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            رقم الهوية الوطنية (10 أرقام)
                          </label>
                          <input
                            type="text"
                            name="changeRoleNationalId"
                            required
                            maxLength={10}
                            pattern="[0-9]{10}"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="مثال: 2185255896"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الدور الجديد
                          </label>
                          <select
                            name="newRole"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">-- اختر الدور --</option>
                            <option value="SUPER_ADMIN">مدير نظام</option>
                            <option value="MANAGER">مدير مدرسة</option>
                            <option value="SUPERVISOR">مشرف</option>
                            <option value="TEACHER">معلم</option>
                            <option value="STUDENT">طالب</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'جاري التغيير...' : '🔄 تغيير الدور'}
                      </button>

                      {message && (
                        <div
                          className={`p-4 rounded-lg text-center ${
                            message.includes('✅')
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {message}
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* Empty Database - For SUPER_ADMIN */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-2xl p-8 mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-6xl">🗑️</div>
                    <div>
                      <h3 className="text-2xl font-bold text-orange-700 mb-2">
                        تفريغ قاعدة البيانات
                      </h3>
                      <p className="text-orange-600">
                        حذف البيانات الديناميكية مع الاحتفاظ بالإعدادات الأساسية
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 mb-6">
                    <h4 className="font-bold text-gray-800 mb-3">
                      سيتم حذف:
                    </h4>
                    <ul className="grid grid-cols-2 gap-2 text-gray-700">
                      <li>✓ جميع المستخدمين (ما عدا المدراء)</li>
                      <li>✓ جميع الطلاب</li>
                      <li>✓ جميع الأسئلة</li>
                      <li>✓ جميع الاختبارات</li>
                      <li>✓ جميع المحاولات</li>
                      <li>✓ جميع النتائج</li>
                    </ul>
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-bold text-green-800 mb-2">
                        سيتم الاحتفاظ بـ:
                      </h4>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li>✓ المدارس</li>
                        <li>✓ البرامج (عربي/دولي)</li>
                        <li>✓ الصفوف</li>
                        <li>✓ المواد</li>
                        <li>✓ الأدوار</li>
                      </ul>
                    </div>
                  </div>

                  {message && (
                    <div className={`p-4 rounded-lg mb-4 ${
                      message.includes("✅") 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {message}
                    </div>
                  )}

                  <button
                    onClick={handleEmptyDatabase}
                    disabled={emptying}
                    className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                      emptyConfirm
                        ? 'bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-800 hover:to-red-800 animate-pulse text-white'
                        : 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white'
                    }`}
                  >
                    {emptying ? 'جاري التفريغ...' : emptyConfirm ? '🚨 اضغط مرة ثانية للتأكيد!' : '🗑️ تفريغ قاعدة البيانات'}
                  </button>

                  {emptyConfirm && (
                    <div className="mt-4 text-center">
                      <p className="text-orange-700 font-bold text-lg animate-pulse">
                        ⏰ لديك 5 ثوانٍ للتأكيد!
                      </p>
                    </div>
                  )}
                </div>

                {/* Clear Database - For OWNER ONLY */}
                {userRole === 'OWNER' && (
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-6xl">⚠️</div>
                      <div>
                        <h3 className="text-2xl font-bold text-red-700 mb-2">
                          منطقة خطرة جداً! (للمسؤولين فقط)
                        </h3>
                        <p className="text-red-600">
                          هذا الإجراء سيحذف جميع البيانات من قاعدة البيانات نهائياً
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 mb-6">
                      <h4 className="font-bold text-gray-800 mb-3">
                        سيتم حذف كل شيء:
                      </h4>
                      <ul className="grid grid-cols-2 gap-2 text-gray-700">
                        <li>✓ جميع المستخدمين</li>
                        <li>✓ جميع الطلاب</li>
                        <li>✓ جميع الأسئلة</li>
                        <li>✓ جميع الاختبارات</li>
                        <li>✓ جميع المحاولات</li>
                        <li>✓ جميع النتائج</li>
                        <li>✓ جميع المواد</li>
                        <li>✓ جميع البرامج</li>
                        <li>✓ جميع الصفوف</li>
                        <li>✓ جميع المدارس</li>
                        <li>✓ جميع الأدوار</li>
                        <li>✓ كل شيء!</li>
                      </ul>
                    </div>

                    {message && (
                      <div className={`p-4 rounded-lg mb-4 ${
                        message.includes("✅") 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {message}
                      </div>
                    )}

                    <button
                      onClick={handleClearDatabase}
                      disabled={clearing}
                      className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                        clearConfirm
                          ? 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 animate-pulse text-white'
                          : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
                      }`}
                    >
                      {clearing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          جاري مسح قاعدة البيانات...
                        </span>
                      ) : clearConfirm ? (
                        <span className="text-lg">
                          🚨 اضغط مرة ثانية للتأكيد النهائي - سيتم مسح كل شيء نهائياً!
                        </span>
                      ) : (
                        <span className="text-lg">
                          ⚠️ مسح كامل - منطقة خطرة!
                        </span>
                      )}
                    </button>

                    {clearConfirm && (
                      <div className="mt-4 text-center">
                        <p className="text-red-700 font-bold text-lg animate-pulse">
                          ⏰ لديك 5 ثوانٍ للتأكيد!
                        </p>
                        <p className="text-red-600 text-sm mt-2">
                          بمجرد الضغط مرة أخرى، لن تتمكن من استعادة البيانات!
                        </p>
                      </div>
                    )}

                    <div className="mt-6 text-center text-gray-600 text-sm">
                      💡 بعد المسح، يمكنك الذهاب إلى{" "}
                      <a href="/setup" className="text-blue-600 hover:underline font-semibold">
                        /setup
                      </a>{" "}
                      لإعادة ملء قاعدة البيانات
                    </div>
                  </div>
                )}
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
            قسم الحاسب الآلي
          </p>
        </div>
      </footer>
    </div>
  );
}
