'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AssignmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('teachers');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Reference data
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  
  // Assignments
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [managerAssignments, setManagerAssignments] = useState<any[]>([]);
  const [supervisorAssignments, setSupervisorAssignments] = useState<any[]>([]);
  const [subjectWeights, setSubjectWeights] = useState<any[]>([]);

  useEffect(() => {
    loadReferenceData();
    loadAssignments();
  }, []);

  async function loadReferenceData() {
    try {
      const [usersRes, refsRes] = await Promise.all([
        fetch('/api/super-admin/users/list'),
        fetch('/api/reference/lists'),
      ]);

      if (usersRes.ok && refsRes.ok) {
        const usersData = await usersRes.json();
        const refsData = await refsRes.json();

        setTeachers(usersData.users?.filter((u: any) => u.role?.code === 'TEACHER') || []);
        setManagers(usersData.users?.filter((u: any) => u.role?.code === 'MANAGER') || []);
        setSupervisors(usersData.users?.filter((u: any) => u.role?.code === 'SUPERVISOR') || []);
        
        setSubjects(refsData.subjects || []);
        setGrades(refsData.grades || []);
        setSchools(refsData.schools || []);
        setPrograms(refsData.programs || []);
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  }

  async function loadAssignments() {
    try {
      const [teacherRes, managerRes, supervisorRes, weightsRes] = await Promise.all([
        fetch('/api/super-admin/assignments/teachers'),
        fetch('/api/super-admin/assignments/managers'),
        fetch('/api/super-admin/assignments/supervisors'),
        fetch('/api/super-admin/assignments/subject-weights'),
      ]);

      if (teacherRes.ok) {
        const data = await teacherRes.json();
        setTeacherAssignments(data.assignments || []);
      }
      if (managerRes.ok) {
        const data = await managerRes.json();
        setManagerAssignments(data.assignments || []);
      }
      if (supervisorRes.ok) {
        const data = await supervisorRes.json();
        setSupervisorAssignments(data.assignments || []);
      }
      if (weightsRes.ok) {
        const data = await weightsRes.json();
        setSubjectWeights(data.weights || []);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  }

  async function handleCreateTeacherAssignment(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const gradeIds = Array.from(form.querySelectorAll('input[name="gradeIds"]:checked'))
      .map((el: any) => el.value);

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/super-admin/assignments/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: formData.get('teacherId'),
          subjectId: formData.get('subjectId'),
          schoolId: formData.get('schoolId'),
          programId: formData.get('programId'),
          gradeIds,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✅ تم ربط المعلم بنجاح!');
        form.reset();
        loadAssignments();
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (error: any) {
      setMessage('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTeacherAssignment(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الربط؟')) return;

    try {
      const res = await fetch(`/api/super-admin/assignments/teachers?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage('✅ تم حذف الربط بنجاح!');
        loadAssignments();
      }
    } catch (error) {
      setMessage('❌ حدث خطأ في الحذف');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              🔗 إدارة الربط والتعيينات
            </h1>
            <button
              onClick={() => router.push('/super-admin')}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
            >
              ← العودة
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'teachers', label: '👨‍🏫 ربط المعلمين' },
              { id: 'weights', label: '⚖️ أوزان المواد' },
              { id: 'supervisors', label: '👔 ربط المشرفين' },
              { id: 'managers', label: '👥 ربط المديرين' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {message && (
              <div className={`mb-4 p-4 rounded-lg ${
                message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {/* Teacher Assignments Tab */}
            {activeTab === 'teachers' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">ربط معلم بمادة وصفوف</h2>
                
                <form onSubmit={handleCreateTeacherAssignment} className="bg-gray-50 p-6 rounded-xl space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-2">المعلم</label>
                      <select name="teacherId" required className="w-full border rounded-lg px-4 py-2">
                        <option value="">اختر المعلم</option>
                        {teachers.map(t => (
                          <option key={t._id} value={t._id}>{t.fullName} ({t.nationalId})</option>
                        ))}
                      </select>                    </div>

                    <div>
                      <label className="block font-semibold mb-2">المادة</label>
                      <select name="subjectId" required className="w-full border rounded-lg px-4 py-2">
                        <option value="">اختر المادة</option>
                        {subjects.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">المدرسة</label>
                      <select name="schoolId" required className="w-full border rounded-lg px-4 py-2">
                        <option value="">اختر المدرسة</option>
                        {schools.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">البرنامج</label>
                      <select name="programId" required className="w-full border rounded-lg px-4 py-2">
                        <option value="">اختر البرنامج</option>
                        {programs.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">الصفوف (اختر صف أو أكثر)</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {grades.map(g => (
                        <label key={g._id} className="flex items-center space-x-2 space-x-reverse p-2 border rounded hover:bg-gray-100 cursor-pointer">
                          <input type="checkbox" name="gradeIds" value={g._id} className="rounded" />
                          <span className="text-sm">{g.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? 'جاري الحفظ...' : '✅ حفظ الربط'}
                  </button>
                </form>

                {/* List of assignments */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold mb-4">الربط الحالي ({teacherAssignments.length})</h3>
                  <div className="space-y-2">
                    {teacherAssignments.map(assign => (
                      <div key={assign._id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                        <div>
                          <p className="font-semibold">{assign.teacher?.fullName}</p>
                          <p className="text-sm text-gray-600">
                            {assign.subject?.name} • {assign.school?.name} • {assign.program?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            الصفوف: {assign.grades?.map((g: any) => g.name).join(' • ') || 'لا يوجد'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteTeacherAssignment(assign._id)}
                          className="text-red-600 hover:bg-red-50 px-4 py-2 rounded"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs - I'll add them next */}
            {activeTab !== 'teachers' && (
              <div className="text-center py-12 text-gray-500">
                قريباً... 🚧
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

