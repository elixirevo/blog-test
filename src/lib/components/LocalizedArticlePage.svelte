<script lang="ts">
	import { onMount } from 'svelte';
	import { base, resolve } from '$app/paths';
	import GiscusComments from '$lib/components/GiscusComments.svelte';
	import type { Locale, UiCopy } from '$lib/i18n';
	import type { SiteConfig } from '$lib/site';
	import type { BlogPost, PostSummary } from '$lib/server/content';

	interface Props {
		locale: Locale;
		site: SiteConfig;
		ui: UiCopy;
		post: BlogPost;
		relatedPosts: PostSummary[];
	}

	let { locale, site, ui, post, relatedPosts }: Props = $props();

	const withBasePath = (html: string, currentBase: string) =>
		currentBase ? html.replaceAll(/(src|href)="\/(?!\/)/g, `$1="${currentBase}/`) : html;

	const articleHtml = $derived(withBasePath(post.html, base));

	let headings = $state<{ id: string; text: string; level: number }[]>([]);
	let activeId = $state('post-title');

	const homeHref = $derived(resolve(locale === 'en' ? '/en' : '/'));
	const postHref = (slug: string) =>
		resolve(locale === 'en' ? '/en/blog/[slug]' : '/blog/[slug]', { slug });

	onMount(() => {
		const contentEl = document.querySelector('.article-content');
		if (contentEl) {
			const els = contentEl.querySelectorAll('h2, h3');
			const parsedHeadings: typeof headings = [];

			els.forEach((el, index) => {
				if (!el.id) {
					const textInfo = el.textContent || '';
					el.id =
						textInfo
							.trim()
							.toLowerCase()
							.replace(/[^a-z0-9\uAC00-\uD7A3]+/g, '-') || `heading-${index}`;
				}
				parsedHeadings.push({
					id: el.id,
					text: el.textContent || '',
					level: el.tagName === 'H2' ? 2 : 3
				});
			});

			headings = parsedHeadings;
		}

		const handleScroll = () => {
			const scrollPos = window.scrollY + 160;
			const titleEl = document.getElementById('post-title');
			let current = 'post-title';

			if (titleEl && scrollPos >= titleEl.offsetTop) {
				current = 'post-title';
			}

			headings.forEach((heading) => {
				const el = document.getElementById(heading.id);
				if (el && scrollPos >= el.offsetTop) {
					current = heading.id;
				}
			});

			activeId = current;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		return () => window.removeEventListener('scroll', handleScroll);
	});

	const scrollToHeading = (id: string, event: Event) => {
		event.preventDefault();
		const el = document.getElementById(id);
		if (el) {
			const y = el.getBoundingClientRect().top + window.scrollY - 120;
			window.scrollTo({ top: y, behavior: 'smooth' });
			activeId = id;
		}
	};
</script>

<svelte:head>
	<title>{post.title} | {site.title}</title>
	<meta name="description" content={post.description} />
	<meta data-pagefind-filter={`Category:${post.category}`} />
	<meta data-pagefind-filter={`Locale:${locale}`} />
	<meta data-pagefind-meta={`Category:${post.category}`} />
	<meta data-pagefind-meta={`Locale:${locale}`} />
	<meta data-pagefind-meta={`Published:${post.formattedDate}`} />
	<meta data-pagefind-sort={`date:${post.date}`} />
</svelte:head>

<div class="container-large article-grid">
	<div class="article-spacer"></div>

	<article class="article-center">
		<header>
			<a href={homeHref} class="article-back">
				<span class="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
				{ui.article.backToArchive}
			</a>

			<div data-pagefind-body>
				<div class="article-meta">
					<span>{post.category}</span>
					<span class="meta-divider"></span>
					<span>{post.formattedDate}</span>
					{#if post.readingTime}
						<span class="meta-divider"></span>
						<span>{post.readingTime}</span>
					{/if}
				</div>

				<h1 id="post-title" class="article-h1 font-headline">
					{post.title}
				</h1>

				<p class="article-desc font-body">
					"{post.description}"
				</p>
			</div>
		</header>

		{#if post.cover}
			<figure class="article-figure" data-pagefind-body>
				<img alt={post.title} src={`${base}${post.cover}`} />
			</figure>
		{/if}

		<div class="article-content" data-pagefind-body>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html articleHtml}
		</div>

		{#key `${locale}:${post.slug}`}
			<GiscusComments {site} {ui} />
		{/key}

		{#if relatedPosts.length > 0}
			<div class="related-boundary">
				<div>
					<p class="related-label font-label">{ui.article.continueReading}</p>
					<h2 class="related-h2 font-headline">{ui.article.relatedTitle}</h2>
				</div>

				<div class="related-grid">
					{#each relatedPosts as relatedPost (relatedPost.slug)}
						<a class="related-post" href={postHref(relatedPost.slug)}>
							<div class="related-meta font-label">
								<span>{relatedPost.category}</span>
								<span class="related-meta-div"></span>
								<span>{relatedPost.formattedDate}</span>
							</div>
							<h3 class="related-title font-headline">
								{relatedPost.title}
							</h3>
							<p class="related-desc font-body">
								{relatedPost.description}
							</p>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</article>

	<aside class="article-aside">
		{#if headings.length > 0}
			<div class="toc-container">
				<p class="toc-label font-label">{ui.article.contents}</p>

				<nav class="toc-nav">
					<a
						href="#post-title"
						onclick={(event) => scrollToHeading('post-title', event)}
						class="toc-link toc-link-top {activeId === 'post-title' ? 'active' : ''}"
					>
						<span>{post.title}</span>
					</a>

					{#each headings as heading (heading.id)}
						<a
							href={`#${heading.id}`}
							onclick={(event) => scrollToHeading(heading.id, event)}
							class="toc-link {heading.level === 2 ? 'heading-2' : 'heading-3'} {activeId ===
							heading.id
								? 'active'
								: ''}"
						>
							<span>{heading.text}</span>
						</a>
					{/each}
				</nav>
			</div>
		{/if}
	</aside>
</div>
