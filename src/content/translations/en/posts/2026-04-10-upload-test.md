---
title: This is a test upload.
description: This is a test upload.
date: '2026-04-10'
published: true
category: History
locale: en
sourcePath: src/content/posts/2026-04-10-upload-test.md
sourceHash: 25f75cbe7d3c5316afa75f365ce53f0bea2c707dbe95185739bdce3fb4cf1496
translationSchemaVersion: markdown-xml-v1
translationSource: deepl
translatedAt: '2026-04-10T01:25:48.009Z'
cover: /uploads/ishot2026-03-31155954.png
---
# Elixir Journal

This is a static blog template based on SvelteKit. It is configured to prerender the entire site using `@sveltejs/adapter-static`, deploy to GitHub Pages via GitHub Actions, and allow editing of Markdown content in Pages CMS.

## Stack

- SvelteKit + `@sveltejs/adapter-static`
- GitHub Pages deployment via `.github/workflows/deploy.yml`
- Pages CMS via root `.pages.yml`
- Markdown posts in `src/content/posts`
- DeepL translation sync into `src/content/translations/en/posts`

## Local development

```sh
bun install
bun run dev
```

The `Pagefind` search index is generated after a static build. To verify the search functionality, follow the steps below.

```sh
bun run build
bun run preview
```

To update the English translation files locally, enter your DeepL API key and run the command below.
