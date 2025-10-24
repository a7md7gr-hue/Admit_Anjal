# 🚨 المشاكل الحرجة اللي لازم تتحل فوراً

## Priority 1: 🔴 **مفيش نظام لإدارة الامتحانات!**

### المشكلة:
- ❌ مفيش API لإنشاء Exam
- ❌ مفيش واجهة لإنشاء Exam
- ❌ مفيش طريقة لاختيار الأسئلة للامتحان
- ❌ مفيش طريقة لتحديد موعد ومدة الامتحان
- ❌ مفيش طريقة لتحديد الطلاب المستهدفين

### الحل المطلوب:
1. ✅ تحديث Exam Model (إضافة: startDate, endDate, duration, totalMarks, schoolId)
2. ✅ إنشاء APIs:
   - `POST /api/super-admin/exams/create` - إنشاء امتحان
   - `GET /api/super-admin/exams/list` - قائمة الامتحانات
   - `PUT /api/super-admin/exams/update` - تعديل امتحان
   - `DELETE /api/super-admin/exams/delete` - حذف امتحان
   - `POST /api/super-admin/exams/questions` - إضافة/إزالة أسئلة
3. ✅ إنشاء واجهة `/super-admin/exams` - إدارة كاملة

---

## Priority 2: 🟡 **مشاكل في الـ workflows**

### 1. Teacher Grading:
- ⚠️ المعلم بيصحح بس Essay/Oral
- ⚠️ MCQ بيتصحح تلقائياً
- ❓ هل المعلم يقدر يشوف فقط امتحانات طلابه؟
- ❓ هل في Teacher Assignment فعلاً موجود في القاعدة؟

### 2. Supervisor Approval:
- ⚠️ المشرف بيعتمد بعد المعلم
- ❓ هل Supervisor Assignment موجود؟
- ❓ هل المشرف يقدر يعتمد فقط معلمينه؟

### 3. Manager Final Approval:
- ⚠️ المدير بيعتمد النهائي
- ⚠️ Manager Assignment موجود في seed
- ❓ هل المدير يقدر يعتمد فقط طلاب مدرسته؟

---

## Priority 3: 🟢 **مشاكل ثانوية**

### 1. Image Upload:
- ⚠️ الصور في `/tmp` مؤقتة
- 💡 الحل: Vercel Blob أو AWS S3

### 2. Excel Upload:
- ⚠️ لو الأسماء مش متطابقة، بيفشل
- 💡 الحل: معاينة قبل الرفع + تحديد أوضح للأخطاء

### 3. Password Reset:
- ✅ موجود في seed للـ Managers/Teachers
- ❓ هل بيشتغل صح؟

---

## الخطة الفورية:

### المرحلة 1: إنشاء نظام الامتحانات (الآن!)
1. ✅ تحديث Exam Model
2. ✅ إنشاء Exam APIs
3. ✅ إنشاء Exam Management Page
4. ✅ اختبار شامل

### المرحلة 2: اختبار الـ workflows (بعدين)
1. ✅ اختبار Student → Exam → Submit
2. ✅ اختبار Teacher → Grade
3. ✅ اختبار Supervisor → Approve
4. ✅ اختبار Manager → Final Approval
5. ✅ اختبار Reports

### المرحلة 3: إصلاح المشاكل الثانوية
1. ✅ Image Upload (Vercel Blob)
2. ✅ Excel Preview
3. ✅ Better Error Messages


