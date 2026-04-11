---
title: GitHub PagesにデプロイするSvelteKitブログ
description: adapter-staticとprerenderの設定を用いて、SvelteKitをGitHub Pagesに公開するための基本構成をまとめます。
date: '2026-04-08'
published: true
category: Technical
locale: ja
sourcePath: src/content/posts/2026-04-08-github-pages-first-post.md
sourceHash: fb7606d5741efc2a33de6fb86862ddc67b1e5da54407d042d984ac231709c55a
sourceLocale: ko
translationSchemaVersion: markdown-xml-v2
translationSource: deepl
translatedAt: '2026-04-11T04:28:09.759Z'
cover: /uploads/covers/editorial-grid.svg
---
GitHub Pagesはサーバーランタイムを提供していないため、SvelteKitプロジェクトを公開するには、**完全に静的サイトとしてビルド**する必要があります。

今回のプロジェクトでは、`@sveltejs/adapter-static`を使用してすべてのページをプリレンダリングし、GitHub Actionsが`build/`の出力物をPagesにデプロイするように構成しました。

## 今回の設定に含まれるもの

- `adapter-static` ビルド
- GitHub Pages用のベースパス処理
- `trailingSlash = 'always'`の設定
- Markdownから記事全体を読み込んで静的ページを生成
- Pages CMSから直接編集可能な`.pages.yml`

## なぜ末尾のスラッシュが必要なのか

GitHub Pagesでは、`/blog/post/`のようなディレクトリベースのURLが扱いやすいです。 `trailingSlash = 'always'`を使用すると、各投稿が`index.html`として出力され、リロード時や直接アクセス時にも安定して開きます。

## コンテンツはどこにあるのか

投稿は `src/content/posts` に Markdown ファイルとして保存されます。 各ファイルはフロントマターと本文で構成され、ビルド時に一覧ページと詳細ページが生成されます。

## 次のステップ

あとはリポジトリをGitHubにアップロードし、Pagesを`GitHub Actions`に設定するだけです。その後、Pages CMSにログインすると、`.pages.yml`を読み込み、投稿やサイト設定をすぐに編集できます。
