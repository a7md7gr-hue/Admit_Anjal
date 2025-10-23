# 🚀 دليل رفع المشروع على السيرفر

## 📋 المتطلبات الأساسية

### 1️⃣ متطلبات السيرفر
- **Node.js**: الإصدار 18.17 أو أحدث
- **npm** أو **yarn** أو **pnpm**
- **RAM**: على الأقل 2GB
- **Storage**: على الأقل 5GB مساحة فارغة

### 2️⃣ قاعدة البيانات
- **MongoDB Atlas** (مجانية) ✅
- أو **MongoDB محلية** على السيرفر
- تأكد من وجود اتصال آمن (SSL/TLS)

### 3️⃣ متغيرات البيئة (Environment Variables)
يجب تجهيز ملف `.env.local` أو `.env` يحتوي على:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/admission-tests?retryWrites=true&w=majority

# JWT Secret (استخدم مفتاح عشوائي قوي)
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars

# Next.js
NODE_ENV=production
```

---

## 🌐 خيارات النشر (Deployment Options)

### الخيار 1️⃣: Vercel (الأسهل والأسرع - مجاني) ⭐ مُوصى به

#### المميزات:
- ✅ نشر تلقائي من GitHub
- ✅ SSL مجاني
- ✅ CDN عالمي
- ✅ Zero Configuration
- ✅ مجاني تماماً

#### خطوات النشر:
1. **رفع المشروع على GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/admission-tests.git
   git push -u origin main
   ```

2. **اذهب إلى [Vercel](https://vercel.com)**
   - سجل حساب جديد (أو سجل دخول)
   - اضغط "Import Project"
   - اختر الريبو من GitHub
   - أضف Environment Variables:
     - `MONGODB_URI`
     - `JWT_SECRET`
   - اضغط "Deploy"

3. **انتظر 2-3 دقائق** وموقعك جاهز! 🎉

---

### الخيار 2️⃣: Netlify (سهل ومجاني)

#### خطوات النشر:
1. **رفع على GitHub** (نفس الخطوة السابقة)
2. **اذهب إلى [Netlify](https://www.netlify.com)**
3. **اختر "Add new site" → Import from Git**
4. **اختر الريبو وأضف:**
   - Build Command: `npm run build`
   - Publish Directory: `.next`
5. **أضف Environment Variables في Settings**

---

### الخيار 3️⃣: VPS (سيرفر خاص) - مثل DigitalOcean, AWS, Azure

#### المتطلبات:
- Ubuntu 20.04 أو أحدث
- Nginx (Web Server)
- PM2 (Process Manager)
- Domain name (اختياري)

#### خطوات النشر:

##### 1. تحضير السيرفر
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت PM2
sudo npm install -g pm2

# تثبيت Nginx
sudo apt install nginx -y
```

##### 2. رفع المشروع
```bash
# استنساخ المشروع
cd /var/www
sudo git clone https://github.com/yourusername/admission-tests.git
cd admission-tests

# تثبيت الحزم
sudo npm install

# إنشاء ملف .env
sudo nano .env.local
# (أضف MONGODB_URI و JWT_SECRET)

# بناء المشروع
sudo npm run build
```

##### 3. تشغيل المشروع بـ PM2
```bash
# إنشاء ملف PM2
sudo nano ecosystem.config.js
```

محتوى الملف:
```javascript
module.exports = {
  apps: [{
    name: 'admission-tests',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/admission-tests',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

```bash
# تشغيل المشروع
sudo pm2 start ecosystem.config.js

# جعله يعمل تلقائياً عند إعادة تشغيل السيرفر
sudo pm2 startup
sudo pm2 save
```

##### 4. إعداد Nginx
```bash
sudo nano /etc/nginx/sites-available/admission-tests
```

محتوى الملف:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # أو IP السيرفر

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/admission-tests /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

##### 5. إضافة SSL (اختياري لكن مهم) 🔒
```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx -y

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com
```

---

### الخيار 4️⃣: Render (سهل ومجاني)

1. **اذهب إلى [Render](https://render.com)**
2. **اختر "New Web Service"**
3. **اربط GitHub واختر الريبو**
4. **إعدادات:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. **أضف Environment Variables**

---

## 🔧 إعدادات ما بعد النشر

### 1. تشغيل السكريبت الأولي (Seeding)
```bash
npm run seed
```

### 2. التحقق من الاتصال بقاعدة البيانات
- تأكد من إضافة IP السيرفر في MongoDB Atlas Network Access
- أو استخدم `0.0.0.0/0` (أي IP) للتطوير

### 3. تغيير كلمات المرور
⚠️ **مهم جداً**: غيّر جميع كلمات المرور الافتراضية!

### 4. النسخ الاحتياطي
- فعّل النسخ الاحتياطي التلقائي في MongoDB Atlas
- أو استخدم `mongodump` يومياً:
```bash
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)
```

---

## 📊 المراقبة والصيانة

### مراقبة PM2
```bash
# عرض حالة العمليات
pm2 status

# عرض السجلات
pm2 logs admission-tests

# إعادة تشغيل
pm2 restart admission-tests

# إيقاف
pm2 stop admission-tests
```

### تحديث المشروع
```bash
cd /var/www/admission-tests
sudo git pull origin main
sudo npm install
sudo npm run build
sudo pm2 restart admission-tests
```

---

## 🔐 نصائح الأمان

1. ✅ **استخدم HTTPS دائماً** (SSL/TLS)
2. ✅ **غيّر `JWT_SECRET` إلى قيمة عشوائية قوية** (على الأقل 32 حرف)
3. ✅ **فعّل Rate Limiting** لمنع هجمات DDoS
4. ✅ **استخدم Firewall** (UFW على Ubuntu)
5. ✅ **احذف ملفات الـ credentials من السيرفر**
6. ✅ **فعّل MongoDB Authentication**
7. ✅ **راجع السجلات (Logs) بانتظام**

---

## 🆘 حل المشاكل الشائعة

### المشكلة: الموقع لا يعمل بعد النشر
**الحل:**
```bash
# تحقق من السجلات
pm2 logs

# تحقق من متغيرات البيئة
pm2 env 0
```

### المشكلة: خطأ في الاتصال بقاعدة البيانات
**الحل:**
- تأكد من صحة `MONGODB_URI`
- تأكد من إضافة IP السيرفر في MongoDB Atlas
- تحقق من اتصال الإنترنت

### المشكلة: صفحات 404
**الحل:**
- تأكد من تشغيل `npm run build` قبل `npm start`
- راجع إعدادات Nginx

---

## 📞 التواصل للدعم

إذا واجهت أي مشكلة:
1. راجع السجلات (Logs)
2. تحقق من متغيرات البيئة
3. تأكد من تشغيل MongoDB
4. تواصل مع الدعم الفني

---

**بالتوفيق! 🚀💪**


