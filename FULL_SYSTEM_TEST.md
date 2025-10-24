# 🧪 اختبار شامل للنظام - كل السيناريوهات

## المراحل الأساسية:
1. ✅ إعداد قاعدة البيانات
2. 🔄 رفع الأسئلة
3. ❌ الطلاب يدخلون الامتحان
4. ❌ المعلمين يصححون الشفوي/المقالي
5. ❌ المشرفين يعتمدون
6. ❌ المديرين يعتمدون النهائي
7. ❌ التقارير والتحليلات

---

## 📊 السيناريو 1: Super Admin (مدير النظام)

### الحساب:
- Username: `1111111111`
- Password: `Test@1234`

### الصفحات المتوقعة:
- ✅ `/super-admin` - Dashboard
- ✅ `/super-admin/upload-questions` - رفع أسئلة Excel
- ✅ `/super-admin/upload-students` - رفع طلاب Excel
- ✅ `/super-admin/assignments` - إدارة الربط
- ✅ `/admin/questions` - إضافة سؤال يدوي
- ❓ `/profile` - إعدادات الحساب

### الـ APIs المطلوبة:
- ✅ `GET /api/super-admin/stats` - الإحصائيات
- ✅ `POST /api/super-admin/create-user` - إضافة مستخدم
- ✅ `POST /api/super-admin/students/create` - إضافة طالب
- ✅ `POST /api/super-admin/upload-questions` - رفع أسئلة
- ✅ `POST /api/super-admin/upload-students` - رفع طلاب
- ✅ `GET /api/super-admin/questions/list` - قائمة الأسئلة
- ✅ `DELETE /api/super-admin/questions/delete` - حذف سؤال
- ✅ `POST /api/super-admin/reset-password` - إعادة تعيين كلمة المرور

### المشاكل المحتملة:
1. ❌ رفع الصور لا يعمل (تم الإصلاح جزئياً - /tmp مؤقت)
2. ❓ رفع Excel يفشل بسبب عدم تطابق الأسماء
3. ❓ إضافة مستخدم - هل يتم إنشاء PasswordReset؟
4. ❓ حذف مستخدم - هل يحذف البيانات المرتبطة؟

---

## 📊 السيناريو 2: Manager (مدير المدرسة)

### الحساب التجريبي:
- Username: `2222220000` (مدير - الأهلية بنين)
- Password: `Test@1234`

### الصفحات المتوقعة:
- ✅ `/manager` - Dashboard
- ✅ `/manager/grade-approvals` - اعتماد الدرجات
- ✅ `/manager/subject-weights` - أوزان المواد
- ❓ `/profile` - إعدادات الحساب

### الـ APIs المطلوبة:
- ✅ `GET /api/manager/dashboard` - Dashboard
- ✅ `GET /api/manager/grade-approvals` - قائمة الدرجات المعلقة
- ✅ `POST /api/manager/grade-approvals` - اعتماد الدرجات
- ✅ `GET /api/manager/subject-weights` - الأوزان
- ✅ `POST /api/manager/subject-weights` - تعديل الأوزان

### المشاكل المحتملة:
1. ❓ Manager Assignment - هل موجود؟
2. ❓ Subject Weights - هل بيجيب الصفوف الصح؟
3. ❓ Grade Approvals - هل بيجيب الطلاب الصح؟

---

## 📊 السيناريو 3: Teacher (معلم)

### الحساب التجريبي:
- Username: `4444440000` (معلم عربي - الأهلية بنين)
- Password: `Test@1234`

### الصفحات المتوقعة:
- ✅ `/teacher` - Dashboard
- ✅ `/teacher/grading` - تصحيح الامتحانات
- ❓ `/admin/questions` - إضافة أسئلة (هل المعلم له صلاحية؟)
- ❓ `/profile` - إعدادات الحساب

### الـ APIs المطلوبة:
- ✅ `GET /api/teacher/pending` - الامتحانات المعلقة للتصحيح
- ✅ `POST /api/teacher/grade` - تصحيح امتحان
- ❓ `POST /api/teacher/questions/create` - إضافة سؤال (هل موجود؟)

### المشاكل المحتملة:
1. ❓ Teacher Assignment - هل موجود؟
2. ❓ هل المعلم يقدر يشوف فقط امتحانات طلابه؟
3. ❓ تصحيح الشفوي/المقالي - هل الواجهة واضحة؟

---

## 📊 السيناريو 4: Student (طالب)

### الحساب التجريبي:
- Username: `5555550000`
- PIN: `1001`

### الصفحات المتوقعة:
- ✅ `/student/exam` - دخول الامتحان
- ✅ `/student/results` - النتائج
- ❌ `/profile` - محظور للطلاب (صح!)

### الـ APIs المطلوبة:
- ✅ `GET /api/student/exams` - الامتحانات المتاحة
- ✅ `POST /api/attempts/start` - بدء الامتحان
- ✅ `GET /api/attempts/questions` - أسئلة الامتحان
- ✅ `POST /api/attempts/answer` - حفظ الإجابة
- ✅ `POST /api/attempts/submit` - تسليم الامتحان
- ✅ `GET /api/student/results` - النتائج

### المشاكل المحتملة:
1. ❓ الطالب يقدر يدخل الامتحان أكثر من مرة؟
2. ❓ الوقت ينتهي - هل يتم التسليم تلقائياً؟
3. ❓ MCQ - التصحيح تلقائي صح؟
4. ❓ Essay/Oral - يروح للمعلم صح؟

---

## 📊 السيناريو 5: Supervisor (مشرف)

### الحساب التجريبي:
- Username: ??? (محتاج نشوف)
- Password: `Test@1234`

### الصفحات المتوقعة:
- ✅ `/supervisor` - Dashboard
- ✅ `/supervisor/approvals` - اعتماد الدرجات
- ❓ `/profile` - إعدادات الحساب

### الـ APIs المطلوبة:
- ✅ `GET /api/supervisor/approvals` - قائمة الدرجات المعلقة
- ✅ `POST /api/supervisor/approvals` - اعتماد الدرجات

### المشاكل المحتملة:
1. ❓ Supervisor Assignment - هل موجود؟
2. ❓ هل المشرف يقدر يعتمد فقط معلمينه؟

---

## 🔍 الفحص الفوري:

### 1. فحص الـ Models:
- ✅ User
- ✅ Role
- ✅ School
- ✅ Program
- ✅ Grade
- ✅ Subject
- ✅ Question
- ✅ QuestionOption
- ✅ Exam
- ✅ Attempt
- ✅ AttemptAnswer
- ✅ StudentProfile
- ✅ TeacherAssignment
- ✅ ManagerAssignment
- ✅ SupervisorAssignment
- ✅ SubjectWeight
- ❓ ExamBlueprint (مش مستخدم؟)

### 2. فحص الـ Middleware:
- ✅ التحقق من الـ JWT
- ✅ التحقق من الـ Role
- ✅ Redirect حسب الـ Role

### 3. فحص الـ Auth:
- ✅ Staff Login (National ID + Password)
- ✅ Student Login (National ID + PIN)
- ✅ Password Reset (first login)
- ✅ Change Password
- ✅ Logout

---

## 🚨 المشاكل المتوقعة في الـ Workflows:

### 🔴 مشكلة كبيرة: Exam Creation
- ❌ **مفيش واجهة لإنشاء Exam!**
- ❌ مين اللي يعمل Exam؟ Super Admin؟ Manager؟ Teacher؟
- ❌ ازاي يختار الأسئلة للامتحان؟
- ❌ ازاي يحدد التاريخ والوقت؟

### 🟡 مشكلة متوسطة: Teacher Assignment
- ⚠️ لازم يكون في Teacher Assignment عشان المعلم يقدر يصحح
- ⚠️ Super Admin لازم يربط المعلم بالمادة + المدرسة + البرنامج + الصفوف

### 🟡 مشكلة متوسطة: Excel Upload
- ⚠️ لو الأسماء مش متطابقة بالضبط، الرفع بيفشل
- ⚠️ مفيش معاينة قبل الرفع
- ⚠️ مفيش تحديد للأخطاء بشكل واضح

### 🟢 مشكلة صغيرة: Image Upload
- ⚠️ الصور في `/tmp` مؤقتة
- ⚠️ محتاج Vercel Blob أو S3

---

## 📝 الخطوات التالية:

1. ✅ فحص كل Model والعلاقات
2. ✅ فحص كل API endpoint
3. ✅ إنشاء واجهة Exam Management
4. ✅ اختبار كل workflow من البداية للنهاية
5. ✅ إضافة validation أفضل
6. ✅ إضافة error handling أفضل


