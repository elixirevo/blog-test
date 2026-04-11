---
title: مدونة SvelteKit المنشورة على GitHub Pages
description: >-
  فيما يلي ملخص للبنية الأساسية لنشر SvelteKit على GitHub Pages باستخدام إعدادات
  adapter-static وprerender.
date: '2026-04-08'
published: true
category: Technical
locale: ar
sourcePath: src/content/posts/2026-04-08-github-pages-first-post.md
sourceHash: fb7606d5741efc2a33de6fb86862ddc67b1e5da54407d042d984ac231709c55a
sourceLocale: ko
translationSchemaVersion: markdown-xml-v2
translationSource: deepl
translatedAt: '2026-04-11T04:30:16.326Z'
cover: /uploads/covers/editorial-grid.svg
---
نظرًا لأن GitHub Pages لا توفر بيئة تشغيل خادم، يجب **بناء مشروع SvelteKit بالكامل كموقع ثابت** لنشره.

في هذا المشروع، تم استخدام `@sveltejs/adapter-static` لإجراء عرض مسبق لجميع الصفحات، وتم تكوين GitHub Actions لنشر الناتج `build/` على Pages.

## ما يتضمنه هذا الإعداد

- تحويل `adapter-static`
- معالجة المسار الأساسي لـ GitHub Pages
- إعداد `trailingSlash = 'always'`
- قراءة المنشور بالكامل من Markdown لإنشاء صفحة ثابتة
- `.pages.yml` الذي يمكن تحريره مباشرة في Pages CMS

## لماذا نحتاج إلى الشرطة المائلة في النهاية

في GitHub Pages، من السهل التعامل مع عناوين URL المستندة إلى الدلائل مثل `/blog/post/`.  
باستخدام `trailingSlash = 'always'`، يتم إخراج كل منشور على شكل `index.html`، مما يضمن فتحه بشكل مستقر حتى عند التحديث أو الوصول المباشر.

## أين يوجد المحتوى

يتم حفظ المنشورات كملفات Markdown في `src/content/posts`.  
يتكون كل ملف من مقدمة (frontmatter) ونص رئيسي، ويتم إنشاء صفحة القائمة وصفحة التفاصيل عند البناء.

## الخطوة التالية

الآن يمكنك تحميل المستودع على GitHub وتعيين Pages على `GitHub Actions`.  
بعد ذلك، عند تسجيل الدخول إلى Pages CMS، سيتم قراءة `.pages.yml` ويمكنك تحرير المنشور وإعدادات الموقع مباشرةً.
