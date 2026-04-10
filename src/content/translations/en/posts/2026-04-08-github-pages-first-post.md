---
title: A SvelteKit blog deployed to GitHub Pages
description: >-
  Here is an overview of the basic structure for deploying SvelteKit to GitHub
  Pages using the `adapter-static` and `prerender` settings.
date: '2026-04-08'
published: true
category: Technical
locale: en
sourcePath: src/content/posts/2026-04-08-github-pages-first-post.md
sourceHash: fb7606d5741efc2a33de6fb86862ddc67b1e5da54407d042d984ac231709c55a
translationSchemaVersion: markdown-xml-v1
translationSource: deepl
translatedAt: '2026-04-10T00:44:33.848Z'
cover: /uploads/covers/editorial-grid.svg
---

Since GitHub Pages does not provide a server runtime, you must **build your SvelteKit project as a fully static site** to host it.

For this project, I configured it to prerender all pages using `@sveltejs/adapter-static` and have GitHub Actions deploy the `build/` output to Pages.

## What this setup includes

- `adapter-static` transition
- Base path handling for GitHub Pages
- `trailingSlash = 'always'` configuration
- Reading the entire post from Markdown to generate static pages
- `.pages.yml`, which can be edited directly in Pages CMS

## Why is a trailing slash necessary?

On GitHub Pages, directory-based URLs like `/blog/post/` are easier to manage. If you use `trailingSlash = 'always'`, each post will be rendered as `index.html`, ensuring it opens reliably even when refreshing or accessing it directly.

## Where is the content?

Posts are stored as Markdown files in `src/content/posts`. Each file consists of frontmatter and body text, and during the build process, list pages and detail pages are generated.

## Next Steps

Now, simply push the repository to GitHub and set Pages to `GitHub Actions`. Then, when you log in to Pages CMS, it will read `.pages.yml`, allowing you to edit posts and site settings immediately.
