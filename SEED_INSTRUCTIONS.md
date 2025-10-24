# 🌱 تعليمات ملء قاعدة البيانات

## 🚨 **المشكلة الحالية:**
قاعدة البيانات على Vercel فاضية، عشان كده مفيش حسابات ومحدش يقدر يسجل دخول!

---

## ✅ **الحل - افتح هذا الرابط في المتصفح:**

```
https://admission-tests-8h4qd82gl-ahmed-anjals-projects.vercel.app/api/seed
```

### **خطوات التنفيذ:**

1. **انسخ الرابط أعلاه**
2. **افتحه في أي متصفح (Chrome, Edge, Safari, Firefox)**
3. **انتظر حتى تظهر رسالة النجاح (JSON response)**
4. **ستظهر رسالة مثل:**
   ```json
   {
     "success": true,
     "message": "Database seeded successfully!",
     "summary": {
       "roles": 6,
       "schools": 6,
       "programs": 2,
       "grades": 6,
       "subjects": 5,
       "categories": 4,
       "users": {
         "owner": 1,
         "superAdmin": 1,
         "managers": 6,
         "teachers": 10,
         "students": 15
       },
       "questions": 30,
       "exams": 3
     }
   }
   ```

5. **بعد ظهور الرسالة، جرّب تسجيل الدخول!**

---

## 🔐 **بعد ملء قاعدة البيانات، استخدم هذه الحسابات:**

### **👨‍💼 Super Admin:**
```
الموقع: https://admission-tests-8h4qd82gl-ahmed-anjals-projects.vercel.app/auth/staff
الرقم الوطني: 1111111111
كلمة المرور: Test@1234
```

### **👨‍🎓 طالب:**
```
الموقع: https://admission-tests-8h4qd82gl-ahmed-anjals-projects.vercel.app/auth/student
الرقم الوطني: 5555550000
الرمز (PIN): 1000
```

---

## 📊 **ما سيتم إضافته:**

✅ **1** Super Admin  
✅ **6** Managers  
✅ **10** Teachers  
✅ **15** Students  
✅ **6** Schools  
✅ **2** Programs (عربي + دولي)  
✅ **6** Grades  
✅ **5** Subjects  
✅ **30** Questions  
✅ **3** Exams  

---

## ⚠️ **ملاحظات مهمة:**

1. **افتح الرابط مرة واحدة فقط!** (حتى لا تنشئ بيانات مكررة)
2. **إذا ظهرت رسالة خطأ، حاول مرة أخرى بعد دقيقة**
3. **إذا كانت قاعدة البيانات ممتلئة بالفعل، سيتم مسح البيانات القديمة واستبدالها**

---

## 🔄 **البديل - من PowerShell:**

إذا لم يعمل المتصفح، استخدم PowerShell:

```powershell
Invoke-WebRequest -Uri "https://admission-tests-8h4qd82gl-ahmed-anjals-projects.vercel.app/api/seed" -Method GET
```

---

## 🎯 **التحقق من النجاح:**

بعد ملء قاعدة البيانات:

1. **افتح الموقع:**
   ```
   https://admission-tests-8h4qd82gl-ahmed-anjals-projects.vercel.app
   ```

2. **اضغط "تسجيل دخول طالب"**

3. **أدخل:**
   - الرقم الوطني: `5555550000`
   - الرمز: `1000`

4. **إذا نجح تسجيل الدخول = قاعدة البيانات تم ملؤها! ✅**

---

**قسم الحاسب الآلي - إشراف: أستاذ هشام يسري**  
**مدارس الأنجال الأهلية والدولية**


