# 🚀 رفع المشروع على Vercel - من الصفر

**التاريخ:** 23 أكتوبر 2025  
**الحالة:** 📝 دليل كامل خطوة بخطوة

---

## ⚠️ المشكلة الحالية:

خطأ **404: NOT_FOUND** معناه إن المشروع مش موجود على Vercel!

**الحل:** نرفع المشروع من البداية! ✅

---

## 📋 المتطلبات الجاهزة:

- ✅ المشروع على GitHub: [https://github.com/a7md7gr-hue/Admit_Anjal](https://github.com/a7md7gr-hue/Admit_Anjal)
- ✅ MongoDB URI جاهز
- ✅ JWT Secret جاهز
- 🔄 نحتاج: حساب Vercel

---

## 🎯 الخطوات الكاملة

### **الخطوة 1: إنشاء حساب Vercel (3 دقائق)**

#### 1.1 التسجيل
1. افتح: 👉 **[https://vercel.com/signup](https://vercel.com/signup)**
2. اضغط **"Continue with GitHub"** (الخيار الأول)
3. سجل دخول بحساب GitHub:
   - Username: `a7md7gr-hue`
   - Password: [كلمة مرورك]
4. Vercel سيطلب صلاحيات:
   - ✅ Read access to code
   - ✅ Read access to metadata
   - ✅ Write access to deployments
5. اضغط **"Authorize Vercel"**

#### 1.2 التأكيد
- ستفتح لوحة تحكم Vercel Dashboard
- هتشوف رسالة ترحيب
- إذا طلب منك معلومات إضافية، املأها (اختياري)

---

### **الخطوة 2: استيراد المشروع من GitHub (2 دقائق)**

#### 2.1 إضافة مشروع جديد
1. في Vercel Dashboard، اضغط **"Add New..."** (زر في أعلى اليمين)
2. اختر **"Project"** من القائمة المنسدلة
3. ستظهر صفحة "Import Git Repository"

#### 2.2 البحث عن الريبو
1. في قسم "Import Git Repository"
2. ابحث في القائمة عن: **"Admit_Anjal"**
3. أو اكتب في البحث: `a7md7gr-hue/Admit_Anjal`
4. لما تلاقيه، اضغط **"Import"** بجانبه

**ملاحظة:** لو مش ظاهر، اضغط "Adjust GitHub App Permissions" وأضف الريبو

---

### **الخطوة 3: إعداد المشروع (Configure Project)**

صفحة Configure Project هتفتح تلقائياً:

#### 3.1 إعدادات أساسية
```
Project Name: admit-anjal
(أو أي اسم تحبه - بدون مسافات)

Framework Preset: Next.js
(سيكتشفه Vercel تلقائياً ✅)

Root Directory: ./
(اتركه كما هو)

Build Command: npm run build
(تلقائي - لا تغيره)

Output Directory: .next
(تلقائي - لا تغيره)

Install Command: npm install
(تلقائي - لا تغيره)
```

#### 3.2 لا تضغط Deploy بعد! ⚠️
**مهم:** لازم نضيف Environment Variables الأول!

---

### **الخطوة 4: إضافة Environment Variables (مهم جداً!) ⭐**

#### 4.1 فتح قسم Environment Variables
1. في صفحة Configure Project
2. scroll لتحت شوية
3. هتلاقي قسم **"Environment Variables"**
4. اضغط عليه ليفتح

#### 4.2 إضافة MONGODB_URI

**الخطوات:**
1. في خانة **"Key"** (أو "Name")، اكتب:
   ```
   MONGODB_URI
   ```

2. في خانة **"Value"**، انسخ والصق بالضبط:
   ```
   mongodb+srv://a7md7gr_db_user:cV3sXCyMMz3Lbmb3@ahmeddb.ipeioqo.mongodb.net/admission-tests?retryWrites=true&w=majority&appName=AhmedDB
   ```

3. في **"Environment"**، تأكد من اختيار الكل:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. اضغط **"Add"** أو **"Save"**

#### 4.3 إضافة JWT_SECRET

**الخطوات:**
1. في خانة **"Key"** (أو "Name")، اكتب:
   ```
   JWT_SECRET
   ```

2. في خانة **"Value"**، انسخ والصق بالضبط:
   ```
   4993509721286690e8883c005cddd7424092bb42a597e58fd3633893ac5c5e17
   ```

3. في **"Environment"**، تأكد من اختيار الكل:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. اضغط **"Add"** أو **"Save"**

#### 4.4 التأكد
**تأكد إنك أضفت المتغيرين:**
- ✅ MONGODB_URI
- ✅ JWT_SECRET

**وإن كل واحد مختار له الـ 3 environments!**

---

### **الخطوة 5: النشر! 🚀**

#### 5.1 بدء النشر
1. بعد إضافة المتغيرين، scroll لتحت
2. اضغط الزر الأزرق الكبير: **"Deploy"**
3. الصفحة هتتحول لـ Build Logs

#### 5.2 مراقبة البناء (2-3 دقائق)
راقب الـ Logs:

**علامات التقدم:**
```
✓ Installing dependencies...
✓ Creating an optimized production build...
✓ Compiled successfully in X seconds
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (64/64)
✓ Finalizing page optimization
```

**علامات النجاح:**
- ✅ Build نجح بدون errors
- ✅ ظهرت رسالة **"Deployment Ready"** أو **"Congratulations!"**
- ✅ ظهر رابط الموقع

**علامات الفشل:**
- ❌ خطوط حمراء في Logs
- ❌ "Error: ..."
- ❌ "Build Failed"

**لو فشل:** صورلي الـ error وهساعدك!

---

### **الخطوة 6: فتح الموقع! 🎉**

#### 6.1 الحصول على الرابط
بعد نجاح البناء، هتحصل على رابط مثل:
```
https://admit-anjal.vercel.app
```
أو
```
https://admit-anjal-xxxxx.vercel.app
```

#### 6.2 اختبار الموقع
1. اضغط على الرابط أو انسخه وافتحه في متصفح
2. يجب أن تشاهد الصفحة الرئيسية مع شعار الأنجال
3. جرب تسجيل الدخول:

**Super Admin:**
```
رقم الهوية: 1111111111
كلمة المرور: Test@1234
```

**طالب:**
```
رقم الهوية: 5555550000
PIN: 1234
```

---

## 🔄 خطوات ما بعد النشر

### **1. تشغيل Seed Script (مهم!)**

قاعدة البيانات فارغة! لازم نملاها ببيانات تجريبية:

**من جهازك المحلي:**
```powershell
# تأكد من وجود .env.local
# يحتوي على MONGODB_URI

# شغل seed
npm run seed
```

**سيملأ القاعدة بـ:**
- ✅ Roles (أدوار)
- ✅ Schools (مدارس)
- ✅ Programs & Grades
- ✅ Users (مستخدمين تجريبيين)
- ✅ Students (طلاب)
- ✅ Questions (أسئلة)

### **2. ربط دومين خاص (اختياري - لاحقاً)**

لو عايز دومين خاص (مثل: `exams.alanjal.com`):
1. اشتري دومين
2. في Vercel: **Settings** → **Domains**
3. اضف الدومين
4. اتبع التعليمات لإعداد DNS

---

## 🐛 حل المشاكل الشائعة

### ❌ **Error: Please define MONGODB_URI**

**السبب:** نسيت تضيف Environment Variables  
**الحل:**
1. اذهب إلى Vercel Project
2. **Settings** → **Environment Variables**
3. أضف المتغيرات كما في الخطوة 4
4. اذهب إلى **Deployments** → اضغط **"Redeploy"**

---

### ❌ **Error: Cannot connect to MongoDB**

**السبب:** MongoDB Network Access مش مضبوط  
**الحل:**
1. افتح MongoDB Atlas: [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. اذهب إلى **Network Access**
3. تأكد من وجود `0.0.0.0/0` (يسمح لكل IPs)
4. لو مش موجود، اضغط **"Add IP Address"**
5. اختر **"Allow Access from Anywhere"**
6. اضغط **"Confirm"**

---

### ❌ **Build Failed: Type errors**

**السبب:** أخطاء TypeScript  
**الحل:**
- شوف الـ error في Build Logs
- ابعتلي الـ error وهصلحهولك

---

### ❌ **404 بعد النشر**

**السبب:** الموقع مش مبني صح  
**الحل:**
1. تأكد من Environment Variables موجودة
2. اعمل Redeploy
3. انتظر البناء يخلص
4. جرب الرابط مرة أخرى

---

## 📊 Vercel Dashboard - أهم الأقسام

### **Overview**
- آخر deployment
- حالة الموقع (Ready / Error)
- رابط الموقع

### **Deployments**
- قائمة بكل الـ deployments
- تاريخ كل deployment
- إمكانية Redeploy أو Rollback

### **Analytics** (اختياري)
- عدد الزوار
- الصفحات الأكثر زيارة
- أداء الموقع

### **Settings**
- **Environment Variables** ⭐ (الأهم)
- Domains
- Functions
- Git

### **Logs**
- Function Logs (أخطاء وقت التشغيل)
- Build Logs (أخطاء البناء)

---

## ✅ Checklist النهائي

**قبل النشر:**
- [x] المشروع على GitHub
- [ ] حساب Vercel تم إنشاؤه
- [ ] المشروع تم استيراده من GitHub
- [ ] MONGODB_URI تم إضافته
- [ ] JWT_SECRET تم إضافته
- [ ] اخترت Production + Preview + Development للمتغيرات

**أثناء النشر:**
- [ ] ضغطت Deploy
- [ ] راقبت Build Logs
- [ ] Build نجح بدون errors
- [ ] ظهر "Deployment Ready"

**بعد النشر:**
- [ ] حصلت على رابط الموقع
- [ ] فتحت الموقع في المتصفح
- [ ] شغلت seed script (محلياً)
- [ ] جربت تسجيل الدخول
- [ ] كل شيء يعمل! 🎉

---

## 📞 محتاج مساعدة؟

**لو حصل أي مشكلة:**
1. صورلي الـ Build Logs
2. صورلي الـ Environment Variables (بدون القيم!)
3. قولي إيه بالضبط اللي حصل

**هساعدك فوراً! 💪**

---

## 🎯 الهدف النهائي

**موقع Live على الإنترنت:**
```
https://admit-anjal.vercel.app
```

**مميزات:**
- ✅ مجاني 100%
- ✅ HTTPS آمن
- ✅ سريع جداً
- ✅ تحديث تلقائي مع كل push على GitHub
- ✅ جاهز للاستخدام الفعلي

---

**يلا نبدأ! 🚀**

**ابدأ من الخطوة 1 واتبع الخطوات بالترتيب!**

© 2025 مدارس الأنجال - قسم الحاسب الآلي


