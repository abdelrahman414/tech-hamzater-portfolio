# Abdelrahman Hamza Portfolio

Static portfolio and media-kit website for Abdelrahman Hamza, known as Tech Hamzater.

## Deploy-ready status

This folder is ready to be used as a GitHub repository and imported into Vercel as a static site. Deployment notes are in `DEPLOYMENT.md`.

## افتح الموقع

السيرفر المحلي:

```bash
python3 -m http.server 5173
```

افتح:

`http://127.0.0.1:5173/`

## تعديل البيانات

كل المحتوى الأساسي موجود في:

`content.js`

أهم الحاجات:

- `profile.name`: الاسم الأساسي.
- `profile.creatorName`: اسم البراند الشخصي.
- `profile.email`: إيميل التواصل.
- `socials`: لينكات Instagram وTikTok وYouTube.
- `metrics`: أرقام الجمهور والتعاونات.
- `pillars`: أنواع المحتوى.
- `collaborations`: الشركات واللوجوهات.
- `projects`: campaign angles.
- `services`: الخدمات.
- `process`: خطوات العمل.

## إضافة لوجو جديد

حط صورة اللوجو في:

`assets/logos/`

وبعدين في `content.js`، جوه `collaborations` ضيف:

```js
{ name: "New Brand", category: "Category", logo: "./assets/logos/new-brand.png" },
```

الأفضل تكون PNG بخلفية شفافة. لو الصورة محتاجة تنظيف أو قص، ابعتها هنا وأنا أظبطها بنفس شكل باقي اللوجوهات.

## تغيير صورة Abdelrahman في الـ hero

بدل الصورة دي بصورة PNG بخلفية شفافة:

`assets/images/boody-portrait-cutout.png`

خلي الاسم زي ما هو عشان الموقع يلقطها تلقائيًا.

## النشر على Vercel

1. ارفع فولدر `creator-media-kit` على GitHub.
2. افتح Vercel واعمل Import للمشروع.
3. سيب الإعدادات الافتراضية لأن الموقع static.
4. بعد النشر هتاخد لينك portfolio جاهز للمشاركة مع البراندات.
