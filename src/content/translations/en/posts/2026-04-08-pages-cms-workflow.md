---
title: Designing static content workflows with the Pages CMS
description: >-
  Here's an operational flow for managing your site settings and posts together,
  using your Git repository as a CMS as it is.
date: '2026-04-07'
published: true
category: Essays
locale: en
sourcePath: src/content/posts/2026-04-08-pages-cms-workflow.md
sourceHash: 6f627dcf99f78732704680f0a339a24832165bbb8de899ba0e20be971be92dc6
translationSource: deepl
translatedAt: '2026-04-09T00:36:33.757Z'
---

The Pages CMS works by **editing files in your GitHub repository directly** without a separate database.

in this project, `.pages.yml` in the root connects the following two things

## 1. a post collection

Register the `src/content/posts` folder as a collection, where you can create new posts and edit existing ones.  
Fields like `title`, `description`, `date`, `cover`, `body` can be manipulated in the UI, and the actual Markdown file will be committed when saved.

## 2. site settings file

`src/content/site.json` can be linked to a separate file editor to modify meta information like blog name, description, and URL in the CMS.

## Upload images

the upload path is `static/uploads`.  
the body image is saved under the path `/uploads/...` and can be accessed from GitHub Pages after the build with the same path.

## How it works

1. You edit a post in the Pages CMS.
2. the changes are committed to the repository.
3. They are pushed to the `main` branch, where GitHub Actions rebuilds them.
4. the latest static deliverables are deployed to GitHub Pages.

to summarize, the structure is such that the editor experience remains CMS-like, while the actual source of truth remains in Git.
