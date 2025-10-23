# 🚀 إصلاح Vercel Environment Variables - خطوة بخطوة

## ✅ **الطريقة الأولى: من خلال Vercel Dashboard (الأسهل)**

### **خطوات مفصلة مع صور:**

#### **1️⃣ افتح Vercel Dashboard:**
```
https://vercel.com/dashboard
```

#### **2️⃣ اختر المشروع:**
- ابحث عن: `Admit_Anjal` أو `admission-tests`
- اضغط عليه

#### **3️⃣ اذهب للإعدادات:**
- في الأعلى، اضغط على تبويب **Settings**

#### **4️⃣ Environment Variables:**
- من القائمة الجانبية، اضغط على **Environment Variables**

#### **5️⃣ ابحث عن MONGODB_URI:**
- ستجد متغير اسمه `MONGODB_URI`
- اضغط على الثلاث نقاط `...` بجانبه
- اختر **Edit**

#### **6️⃣ عدّل القيمة:**
**القيمة القديمة (غلط):**
```
mongodb+srv://a7md7gr_db_user:cV3sXCyMMz3Lbmb3@ahmeddb.ipeioqo.mongodb.net/admission-tests?retryWrites=true&w=majority&appName=AhmedDB
```

**القيمة الجديدة (صح):**
```
mongodb+srv://a7md7gr_db_user:cV3sXCyMMz3Lbmb3@ahmeddb.ipeioqo.mongodb.net/admission_tests?retryWrites=true&w=majority&appName=AhmedDB
```

**⚠️ الفرق:**
- القديم: `admission-tests` (بـ dash -)
- الجديد: `admission_tests` (بـ underscore _)

#### **7️⃣ احفظ التعديل:**
- اضغط **Save**
- اختر **All Environments** (Production, Preview, Development)

#### **8️⃣ أعد النشر:**
- ارجع لتبويب **Deployments**
- اضغط على آخر deployment
- اضغط على الثلاث نقاط `...`
- اختر **Redeploy**
- أكد بالضغط على **Redeploy**

#### **9️⃣ انتظر (2-3 دقائق):**
- انتظر حتى ينتهي الـ Build
- ستظهر رسالة: **Ready** ✅

#### **🔟 افتح الموقع:**
```
https://your-project.vercel.app
```

---

## 🔧 **الطريقة الثانية: من خلال Vercel CLI**

### **الخطوات:**

#### **1️⃣ تسجيل الدخول:**
```powershell
vercel login
```
- اتبع التعليمات وسجل دخول

#### **2️⃣ ربط المشروع:**
```powershell
vercel link
```
- اختر: **Link to existing project**
- اختر: **a7md7gr-hue/Admit_Anjal**

#### **3️⃣ حذف المتغير القديم:**
```powershell
vercel env rm MONGODB_URI production
vercel env rm MONGODB_URI preview
vercel env rm MONGODB_URI development
```

#### **4️⃣ إضافة المتغير الجديد:**
```powershell
# للـ Production
vercel env add MONGODB_URI production

# للـ Preview
vercel env add MONGODB_URI preview

# للـ Development
vercel env add MONGODB_URI development
```

**عند كل أمر، الصق القيمة الصحيحة:**
```
mongodb+srv://a7md7gr_db_user:cV3sXCyMMz3Lbmb3@ahmeddb.ipeioqo.mongodb.net/admission_tests?retryWrites=true&w=majority&appName=AhmedDB
```

#### **5️⃣ أعد النشر:**
```powershell
vercel --prod
```

---

## 📋 **نسخة سريعة للـ MONGODB_URI الصحيح:**

```
mongodb+srv://a7md7gr_db_user:cV3sXCyMMz3Lbmb3@ahmeddb.ipeioqo.mongodb.net/admission_tests?retryWrites=true&w=majority&appName=AhmedDB
```

**⚠️ تأكد من:**
- ✅ `admission_tests` (بـ underscore)
- ❌ ليس `admission-tests` (بـ dash)

---

## 🎯 **التحقق من النجاح:**

بعد التعديل، افتح:
```
https://your-vercel-url.vercel.app
```

**يجب أن تظهر:**
- ✅ الصفحة الرئيسية (بدون 404)
- ✅ شعار مدارس الأنجال
- ✅ أزرار "تسجيل دخول طالب" و "تسجيل دخول موظف"

**جرّب تسجيل الدخول:**
```
الرقم الوطني: 1234567890
الرمز: 1234
```

---

## 🔍 **لو المشكلة لسه موجودة:**

افتح Vercel Deployment Logs:
1. Vercel Dashboard → Deployments
2. اضغط على آخر deployment
3. اضغط على **View Function Logs**
4. ابحث عن أي أخطاء

**أرسل لي صورة من:**
- ✅ Environment Variables page
- ✅ Deployment logs
- ✅ رسالة الخطأ اللي تظهر

---

**قسم الحاسب الآلي - إشراف: أستاذ هشام يسري**  
**مدارس الأنجال الأهلية والدولية**

