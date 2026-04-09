---
title: SvelteKit blog deploying to GitHub Pages
description: >-
  the adapter-static and prerender settings organize the basic structure of
  putting SvelteKit on GitHub Pages.
date: '2026-04-08'
published: true
category: Technical
locale: en
sourcePath: src/content/posts/2026-04-08-github-pages-first-post.md
sourceHash: fb7606d5741efc2a33de6fb86862ddc67b1e5da54407d042d984ac231709c55a
translationSource: deepl
translatedAt: '2026-04-09T00:36:32.780Z'
cover: /uploads/covers/editorial-grid.svg
---

Because GitHub Pages does not provide a server runtime, you must **build it completely as a static site** to publish a SvelteKit project.

for this project, we used `@sveltejs/adapter-static` to prerender all pages, and configured GitHub Actions to deploy the output of `build/` to Pages.

## This setup includes

- `adapter-static` conversion
- Base path handling for GitHub Pages
- Setting up `trailingSlash = 'always'`
- read the full post in Markdown to create a static page
- `.pages.yml` for editing directly in the Pages CMS

## Why trailing slash?

In GitHub Pages, directory-based URLs like `/blog/post/` are easier to handle.
With `trailingSlash = 'always'`, each post is output as `index.html` so that it opens reliably on refresh or direct access.

## Where is the content?

posts are stored as Markdown files in `src/content/posts`.  
each file consists of a frontmatter and body, and a list page and detail page are generated at build time.

## Next steps

now we just need to get the repository up on GitHub and set Pages to `GitHub Actions`.  
then, when you log in to the Pages CMS, read `.pages.yml` so you can edit your posts and site settings right away.
