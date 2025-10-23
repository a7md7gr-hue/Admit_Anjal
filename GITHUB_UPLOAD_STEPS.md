# 📤 رفع المشروع على GitHub - خطوة بخطوة

## 🚨 المشكلة الحالية
Git غير مثبت على جهازك!

---

## ✅ الخطوة 1: تثبيت Git

### طريقة 1: تحميل من الموقع الرسمي (مفضل)

1. افتح الرابط: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. اضغط على **"64-bit Git for Windows Setup"**
3. شغل الملف المحمل
4. اضغط **Next** على كل الخيارات (الإعدادات الافتراضية تمام)
5. انتظر التثبيت
6. **أعد فتح PowerShell** (مهم!)

### طريقة 2: عن طريق Winget (إذا كان متاح)

```powershell
winget install --id Git.Git -e --source winget
```

### التأكد من التثبيت
بعد التثبيت وإعادة فتح PowerShell، جرب:
```powershell
git --version
```

يجب أن يظهر شيء مثل: `git version 2.43.0.windows.1`

---

## ✅ الخطوة 2: إعداد Git (أول مرة)

```powershell
# اكتب اسمك
git config --global user.name "Ahmed"

# اكتب إيميلك (نفس إيميل GitHub)
git config --global user.email "your-email@example.com"
```

---

## ✅ الخطوة 3: رفع المشروع على GitHub

### 3.1 تهيئة Git في المشروع

```powershell
# تأكد إنك في مجلد المشروع
cd C:\Users\a7md7\admission-tests

# تهيئة Git
git init

# إضافة كل الملفات
git add .

# عمل Commit
git commit -m "Initial commit - Al-Anjal Admission Tests"
```

### 3.2 ربط بـ GitHub

```powershell
# تغيير الفرع إلى main
git branch -M main

# ربط بالـ Repository
git remote add origin https://github.com/a7md7gr-hue/Admit_Anjal.git

# رفع المشروع
git push -u origin main
```

---

## 🔑 إذا طلب منك Username وPassword

GitHub لا يقبل كلمة المرور العادية! يجب استخدام **Personal Access Token**:

### إنشاء Token:

1. اذهب إلى GitHub → **Settings** (الخاص بحسابك)
2. اضغط **Developer settings** (آخر شيء في القائمة)
3. اضغط **Personal access tokens** → **Tokens (classic)**
4. اضغط **Generate new token** → **Generate new token (classic)**
5. اكتب Note: `Admit_Anjal Upload`
6. اختر **Expiration**: 90 days
7. اختر **Scopes**: فقط ☑️ `repo` (كل الصلاحيات تحته)
8. اضغط **Generate token**
9. **انسخ الـ Token فوراً!** (مثل: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### استخدام Token:

عند السؤال:
- **Username**: `a7md7gr-hue`
- **Password**: الصق الـ Token (مش كلمة مرورك!)

---

## 📋 الخطوات كاملة بالترتيب

```powershell
# ✅ 1. تأكد من تثبيت Git
git --version

# ✅ 2. إعداد Git (أول مرة فقط)
git config --global user.name "Ahmed"
git config --global user.email "your-email@example.com"

# ✅ 3. الانتقال لمجلد المشروع
cd C:\Users\a7md7\admission-tests

# ✅ 4. تهيئة Git
git init

# ✅ 5. إضافة الملفات
git add .

# ✅ 6. عمل Commit
git commit -m "Initial commit - Al-Anjal Admission Tests"

# ✅ 7. ربط بـ GitHub
git branch -M main
git remote add origin https://github.com/a7md7gr-hue/Admit_Anjal.git

# ✅ 8. رفع المشروع
git push -u origin main
```

---

## 🔧 حل المشاكل الشائعة

### ❌ مشكلة: "git is not recognized"
**الحل:** 
1. ثبت Git من الرابط أعلاه
2. أعد فتح PowerShell
3. جرب مرة أخرى

### ❌ مشكلة: "remote: Support for password authentication was removed"
**الحل:** استخدم Personal Access Token بدلاً من كلمة المرور

### ❌ مشكلة: "failed to push some refs"
**الحل:** 
```powershell
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 🎯 بعد الرفع

### التحقق من الرفع:
1. افتح: [https://github.com/a7md7gr-hue/Admit_Anjal](https://github.com/a7md7gr-hue/Admit_Anjal)
2. يجب أن تشاهد جميع الملفات

### الخطوة التالية: رفع على Vercel
راجع `START_DEPLOYMENT.md` → الخطوة 3

---

## 📊 معلومات المشروع

**GitHub Repository:**
```
https://github.com/a7md7gr-hue/Admit_Anjal.git
```

**MongoDB Connection String:**
```
mongodb+srv://a7md7gr_db_user:cV3sXCyMMz3Lbmb3@ahmeddb.ipeioqo.mongodb.net/admission-tests?retryWrites=true&w=majority&appName=AhmedDB
```

**Branch:** `main`

---

## ✅ Checklist

- [ ] Git مثبت
- [ ] Git معد (name & email)
- [ ] `git init` نفذ بنجاح
- [ ] `git add .` نفذ بنجاح
- [ ] `git commit` نفذ بنجاح
- [ ] `git remote add origin` نفذ بنجاح
- [ ] `git push` نفذ بنجاح
- [ ] الملفات ظهرت على GitHub

---

**يلا نبدأ! 🚀**

1. ثبت Git الأول
2. أعد فتح PowerShell
3. اتبع الخطوات أعلاه
4. لو في أي مشكلة، قولي! 💪

