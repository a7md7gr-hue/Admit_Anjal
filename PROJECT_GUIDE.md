# 📚 دليل مشروع نظام الاختبارات - مدارس الأنجال

---

## 📋 نظرة عامة

نظام إلكتروني متكامل لإدارة الاختبارات المدرسية يشمل:
- ✅ إدارة المستخدمين (Super Admin, Manager, Teacher, Student)
- ✅ بنك الأسئلة
- ✅ إنشاء وإدارة الاختبارات
- ✅ أداء الاختبارات للطلاب
- ✅ التصحيح الآلي والتقارير

---

## 🛠️ التقنيات المستخدمة

### Frontend & Backend:
- **Next.js 15** (React Framework)
- **TypeScript** للأمان البرمجي
- **Tailwind CSS** للتصميم
- **App Router** (Next.js)

### Database:
- **MongoDB** (قاعدة بيانات NoSQL)
- **Mongoose** (ODM)
- **MongoDB Atlas** (Cloud)

### Authentication:
- **JWT** (JSON Web Tokens)
- **bcrypt** للتشفير

### Deployment:
- **Vercel** (Cloud Platform)
- **GitHub** (Version Control)

---

## 🗂️ هيكل قاعدة البيانات

### Models الرئيسية:

1. **Role** - الأدوار (Super Admin, Manager, Teacher, Student)
2. **User** - المستخدمون
3. **StudentProfile** - ملفات الطلاب
4. **School** - المدارس
5. **Program** - البرامج (عربي، دولي)
6. **Grade** - الصفوف الدراسية
7. **Subject** - المواد
8. **QuestionCategory** - تصنيفات الأسئلة
9. **Question** - الأسئلة
10. **Exam** - الاختبارات
11. **StudentExam** - امتحانات الطلاب

---

## 🔐 بيانات تسجيل الدخول (بعد الـ Seed)

### 👨‍💼 Super Admin:
```
الرقم الوطني: 1111111111
كلمة المرور:  Test@1234
الرابط: https://your-domain.vercel.app/auth/staff
```

### 👔 Managers (6 مديرين):
```
الرقم الوطني: 2222220000 → 2222220005
كلمة المرور:  Test@1234
الرابط: https://your-domain.vercel.app/auth/staff
```

### 👨‍🏫 Teachers (10 معلمين):
```
الرقم الوطني: 4444440000 → 4444440009
كلمة المرور:  Test@1234
الرابط: https://your-domain.vercel.app/auth/staff
```

### 👨‍🎓 Students (15 طالب):
```
الرقم الوطني: 5555550000 → 5555550014
الرمز السري:   1000 → 1014
الرابط: https://your-domain.vercel.app/auth/student
```

---

## 💻 التشغيل المحلي (Local Development)

### 1️⃣ المتطلبات:
- **Node.js** (v18 أو أحدث)
- **MongoDB** (محلي أو Atlas)
- **Git**

### 2️⃣ التثبيت:

```bash
# 1. Clone المشروع
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 2. تثبيت المكتبات
npm install

# 3. إنشاء ملف .env
# اكتب:
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DB_NAME
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars

# 4. تشغيل السيرفر
npm run dev

# 5. ملء قاعدة البيانات
npm run seed
```

### 3️⃣ فتح المتصفح:
```
http://localhost:3000
```

---

## 🚀 النشر على Vercel

### 📋 الخطوات الكاملة:

#### 1️⃣ رفع المشروع على GitHub:

```bash
# في Terminal:
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

#### 2️⃣ إنشاء حساب على Vercel:
- اذهب إلى: https://vercel.com
- سجل دخول بـ GitHub
- اضغط **New Project**

#### 3️⃣ ربط المشروع:
- اختر الـ Repository من GitHub
- اضغط **Import**

#### 4️⃣ إضافة Environment Variables:

في صفحة المشروع → **Settings** → **Environment Variables**:

```
MONGODB_URI = mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DB_NAME
JWT_SECRET = your-super-secret-jwt-key-here-min-32-chars
```

⚠️ **مهم جداً:** تأكد من:
- اسم Database في `MONGODB_URI` يستخدم `_` (underscore) وليس `-` (dash)
- مثال صحيح: `admission_tests`
- مثال خاطئ: `admission-tests`

#### 5️⃣ Deploy:
- اضغط **Deploy**
- انتظر 2-3 دقائق
- احصل على رابط المشروع: `https://your-project.vercel.app`

#### 6️⃣ ملء قاعدة البيانات:
بعد نجاح الـ Deploy:
1. اذهب إلى: `https://your-project.vercel.app/setup`
2. اضغط الزر الأخضر **"ابدأ الإعداد"**
3. انتظر 15-20 ثانية
4. ستظهر بيانات تسجيل الدخول ✅

---

## 🔧 استكشاف الأخطاء الشائعة

### ❌ خطأ: `404: NOT_FOUND`
**الحل:**
- تأكد من إضافة `MONGODB_URI` و `JWT_SECRET` في Vercel Environment Variables
- أعد Deploy من جديد

### ❌ خطأ: `Please define the MONGODB_URI environment variable`
**الحل:**
```bash
# في Terminal المحلي:
vercel env add MONGODB_URI
# الصق قيمة MONGODB_URI
# اختر: Production, Preview, Development (اضغط a ثم Enter)

vercel env add JWT_SECRET
# الصق قيمة JWT_SECRET
# اختر: Production, Preview, Development (اضغط a ثم Enter)

# أعد Deploy:
git add .
git commit -m "Fix env vars"
git push origin main
```

### ❌ خطأ: `National ID must be exactly 10 digits`
**الحل:** تم إصلاحه في النسخة الحالية ✅

### ❌ خطأ: `Question validation failed: gradeId is required`
**الحل:** تم إصلاحه في النسخة الحالية ✅

### ❌ خطأ: `MongooseError: Operation buffering timed out`
**الحل:**
- تأكد من صحة `MONGODB_URI`
- تأكد من إضافة IP Address في MongoDB Atlas:
  1. اذهب إلى MongoDB Atlas
  2. **Network Access** → **Add IP Address**
  3. اختر **Allow Access from Anywhere** (0.0.0.0/0)

---

## 📁 هيكل المشروع

```
admission-tests/
├── src/
│   ├── app/                    # صفحات Next.js
│   │   ├── api/               # API Routes
│   │   ├── auth/              # صفحات تسجيل الدخول
│   │   ├── student/           # لوحة الطالب
│   │   ├── teacher/           # لوحة المعلم
│   │   ├── manager/           # لوحة المدير
│   │   ├── super-admin/       # لوحة Super Admin
│   │   ├── setup/             # صفحة الـ Seed
│   │   └── page.tsx           # الصفحة الرئيسية
│   ├── components/            # مكونات React
│   ├── lib/                   # مكتبات مساعدة
│   │   ├── mongodb.ts         # اتصال MongoDB
│   │   └── auth.ts            # JWT Auth
│   └── models/                # Mongoose Models
├── public/                    # ملفات ثابتة (صور، شعارات)
├── scripts/                   # سكربتات مساعدة
├── .env                       # متغيرات البيئة (محلي)
├── next.config.ts             # إعدادات Next.js
├── package.json               # المكتبات
└── tsconfig.json              # إعدادات TypeScript
```

---

## 🎯 الميزات الرئيسية

### 1️⃣ Super Admin:
- ✅ إنشاء مستخدمين جدد (Managers, Teachers, Students)
- ✅ إدارة الصلاحيات
- ✅ عرض كل البيانات

### 2️⃣ Manager:
- ✅ إدارة المعلمين والطلاب
- ✅ عرض التقارير

### 3️⃣ Teacher:
- ✅ إنشاء الأسئلة
- ✅ إنشاء الاختبارات
- ✅ التصحيح
- ✅ عرض النتائج

### 4️⃣ Student:
- ✅ أداء الاختبارات
- ✅ عرض النتائج
- ✅ تغيير كلمة المرور

---

## 📊 البيانات الأولية (Seeded Data)

بعد تشغيل `/setup` أو `npm run seed`:

| النوع | العدد |
|-------|-------|
| 🏫 Schools | 2 |
| 📚 Programs | 2 |
| 🎓 Grades | 6 |
| 📖 Subjects | 5 |
| 🏷️ Categories | 4 |
| 👥 Users | 32 |
| ❓ Questions | 30 |
| 📝 Exams | 3 |

---

## 🔒 الأمان

- ✅ **JWT Authentication** - جلسات آمنة
- ✅ **bcrypt Hashing** - تشفير كلمات المرور
- ✅ **Role-Based Access Control** - صلاحيات حسب الدور
- ✅ **Environment Variables** - إخفاء البيانات الحساسة
- ✅ **Input Validation** - التحقق من المدخلات

---

## 📞 الدعم

للمزيد من المساعدة، راجع:
- **SYSTEM_FLOWCHART.md** - مخطط النظام التفصيلي
- **README.md** - معلومات أساسية

---

## 🎉 ملاحظات مهمة

1. ⚠️ **لا تشارك بيانات `.env` مع أحد!**
2. ✅ **احفظ نسخة احتياطية من MongoDB URI و JWT Secret**
3. 🔄 **أعد Deploy بعد أي تعديل على الكود**
4. 🚫 **لا ترفع `/setup` على Production بعد الانتهاء** (احذف المجلد `src/app/setup`)

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ نظام تسجيل دخول كامل
- ✅ 4 أدوار مستخدم
- ✅ بنك أسئلة
- ✅ نظام اختبارات
- ✅ التصحيح الآلي
- ✅ تقارير النتائج
- ✅ Deployment على Vercel
- ✅ تم حذف Owner Account للأمان

---

**💻 قسم الحاسب الآلي**  
**🏫 مدارس الأنجال الأهلية والدولية**  
**📅 © 2025**

---

