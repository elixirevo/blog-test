<script lang="ts">
	import { onMount } from 'svelte';
	import { base, resolve } from '$app/paths';
	import GiscusComments from '$lib/components/GiscusComments.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const withBasePath = (html: string, currentBase: string) =>
		currentBase ? html.replaceAll(/(src|href)="\/(?!\/)/g, `$1="${currentBase}/`) : html;

	const articleHtml = $derived(withBasePath(data.post.html, base));

	let headings = $state<{ id: string; text: string; level: number }[]>([]);
	let activeId = $state('post-title');

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

	const scrollToHeading = (id: string, e: Event) => {
		e.preventDefault();
		const el = document.getElementById(id);
		if (el) {
			const y = el.getBoundingClientRect().top + window.scrollY - 120;
			window.scrollTo({ top: y, behavior: 'smooth' });
			// Manually set active ID immediately after click for better UX feedback
			activeId = id;
		}
	};
</script>

<svelte:head>
	<title>{data.post.title} | {data.site.title}</title>
	<meta name="description" content={data.post.description} />
	<meta data-pagefind-filter={`Category:${data.post.category}`} />
	<meta data-pagefind-meta={`Category:${data.post.category}`} />
	<meta data-pagefind-meta={`Published:${data.post.formattedDate}`} />
	<meta data-pagefind-sort={`date:${data.post.date}`} />
</svelte:head>

<div class="container-large article-grid">
	<!-- Empty Spacer for Asymmetric Balancing -->
	<div class="article-spacer"></div>

	<!-- Central Article Column -->
	<article class="article-center">
		<header>
			<a href={resolve('/')} class="article-back">
				<span class="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
				Back to archive
			</a>

			<div data-pagefind-body>
				<div class="article-meta">
					<span>{data.post.category}</span>
					<span class="meta-divider"></span>
					<span>{data.post.formattedDate}</span>
					{#if data.post.readingTime}
						<span class="meta-divider"></span>
						<span>{data.post.readingTime}</span>
					{/if}
				</div>

				<h1 id="post-title" class="article-h1 font-headline">
					{data.post.title}
				</h1>

				<p class="article-desc font-body">
					"{data.post.description}"
				</p>
			</div>
		</header>

		{#if data.post.cover}
			<figure class="article-figure" data-pagefind-body>
				<img alt={data.post.title} src={`${base}${data.post.cover}`} />
			</figure>
		{/if}

		<div class="article-content" data-pagefind-body>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html articleHtml}
		</div>

		{#key data.post.slug}
			<GiscusComments site={data.site} />
		{/key}

		{#if data.relatedPosts.length > 0}
			<!-- Related Posts / Author boundary -->
			<div class="related-boundary">
				<div>
					<p class="related-label font-label">Continue reading</p>
					<h2 class="related-h2 font-headline">다음 글도 준비되어 있습니다</h2>
				</div>

				<div class="related-grid">
					{#each data.relatedPosts as post (post.slug)}
						<a class="related-post" href={resolve('/blog/[slug]', { slug: post.slug })}>
							<div class="related-meta font-label">
								<span>{post.category}</span>
								<span class="related-meta-div"></span>
								<span>{post.formattedDate}</span>
							</div>
							<h3 class="related-title font-headline">
								{post.title}
							</h3>
							<p class="related-desc font-body">
								{post.description}
							</p>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</article>

	<!-- Right Side Gutter / TOC -->
	<aside class="article-aside">
		{#if headings.length > 0}
			<div class="toc-container">
				<p class="toc-label font-label">Contents</p>

				<nav class="toc-nav">
					<!-- Post Title Link -->
					<a
						href="#post-title"
						onclick={(e) => scrollToHeading('post-title', e)}
						class="toc-link toc-link-top {activeId === 'post-title' ? 'active' : ''}"
					>
						<span>{data.post.title}</span>
					</a>

					{#each headings as heading (heading.id)}
						<a
							href={`#${heading.id}`}
							onclick={(e) => scrollToHeading(heading.id, e)}
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
