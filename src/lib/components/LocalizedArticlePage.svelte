<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { base, resolve } from '$app/paths';
	import ArticleTableOfContents from '$lib/components/ArticleTableOfContents.svelte';
	import GiscusComments from '$lib/components/GiscusComments.svelte';
	import RelatedPosts from '$lib/components/RelatedPosts.svelte';
	import SeoLinks from '$lib/components/SeoLinks.svelte';
	import { type Locale, type UiCopy } from '$lib/i18n';
	import { toHomePath, toPostPath } from '$lib/routes';
	import { toAbsoluteUrl, toAlternateLinks, toJsonLdScript, toXDefaultUrl } from '$lib/seo';
	import type { SiteConfig } from '$lib/site';
	import type { BlogPost, PostSummary } from '$lib/server/content';

	interface Props {
		locale: Locale;
		site: SiteConfig;
		ui: UiCopy;
		post: BlogPost;
		availableLocales: Locale[];
		relatedPosts: PostSummary[];
	}

	let { locale, site, ui, post, availableLocales, relatedPosts }: Props = $props();

	const withBasePath = (html: string, currentBase: string) =>
		currentBase ? html.replaceAll(/(src|href)="\/(?!\/)/g, `$1="${currentBase}/`) : html;

	const articleHtml = $derived(withBasePath(post.html, base));

	let headings = $state<{ id: string; text: string; level: number }[]>([]);
	let activeId = $state('post-title');
	let articleContent = $state<HTMLElement>();

	const canonicalPath = $derived(toPostPath(locale, post.slug));
	const canonicalUrl = $derived(toAbsoluteUrl(site, canonicalPath));
	const alternateLinks = $derived(
		toAlternateLinks(site, availableLocales, (alternateLocale) =>
			toPostPath(alternateLocale, post.slug)
		)
	);
	const xDefaultUrl = $derived(
		toXDefaultUrl(site, (postLocale) => toPostPath(postLocale, post.slug))
	);
	const coverUrl = $derived(post.cover ? toAbsoluteUrl(site, post.cover) : null);
	const jsonLd = $derived(
		toJsonLdScript({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: post.title,
			description: post.description,
			image: coverUrl ? [coverUrl] : undefined,
			datePublished: post.date,
			dateModified: post.date,
			articleSection: post.category,
			keywords: post.tags,
			inLanguage: site.language,
			url: canonicalUrl,
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': canonicalUrl
			},
			author: {
				'@type': 'Person',
				name: site.author
			},
			publisher: {
				'@type': 'Person',
				name: site.author
			}
		})
	);

	const createHeadingId = (seed: string, index: number, usedIds: Set<string>) => {
		const baseId =
			seed
				.trim()
				.toLocaleLowerCase()
				.normalize('NFKC')
				.replace(/[^\p{Letter}\p{Number}]+/gu, '-')
				.replace(/^-+|-+$/g, '') || `heading-${index + 1}`;
		let id = baseId;
		let suffix = 2;

		while (usedIds.has(id)) {
			id = `${baseId}-${suffix}`;
			suffix += 1;
		}

		usedIds.add(id);
		return id;
	};

	const syncHeadings = () => {
		if (!articleContent) {
			headings = [];
			activeId = 'post-title';
			return;
		}

		const usedIds = new Set<string>();
		const parsedHeadings = Array.from(
			articleContent.querySelectorAll<HTMLHeadingElement>('h2, h3')
		).map((el, index) => {
			const id = createHeadingId(el.id || el.textContent || '', index, usedIds);
			el.id = id;

			return {
				id,
				text: el.textContent || '',
				level: el.tagName === 'H2' ? 2 : 3
			};
		});

		headings = parsedHeadings;

		if (!headings.some((heading) => heading.id === activeId)) {
			activeId = 'post-title';
		}
	};

	$effect(() => {
		const currentArticleHtml = articleHtml;
		const currentArticleContent = articleContent;

		if (!currentArticleContent) {
			return;
		}

		void tick().then(() => {
			if (currentArticleHtml === articleHtml && currentArticleContent === articleContent) {
				syncHeadings();
			}
		});
	});

	onMount(() => {
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
	<meta property="og:type" content="article" />
	<meta property="og:site_name" content={site.title} />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="article:published_time" content={post.date} />
	<meta property="article:modified_time" content={post.date} />
	<meta property="article:author" content={site.author} />
	<meta property="article:section" content={post.category} />
	{#each post.tags as tag (tag)}
		<meta property="article:tag" content={tag} />
	{/each}
	{#if coverUrl}
		<meta property="og:image" content={coverUrl} />
	{/if}
	<meta name="twitter:card" content={coverUrl ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content={post.title} />
	<meta name="twitter:description" content={post.description} />
	{#if coverUrl}
		<meta name="twitter:image" content={coverUrl} />
	{/if}
	<meta data-pagefind-filter={`Category:${post.category}`} />
	<meta data-pagefind-filter={`Locale:${locale}`} />
	{#each post.tags as tag (tag)}
		<meta data-pagefind-filter={`Tag:${tag}`} />
	{/each}
	<meta data-pagefind-meta={`Category:${post.category}`} />
	<meta data-pagefind-meta={`Locale:${locale}`} />
	{#if post.tags.length > 0}
		<meta data-pagefind-meta={`Tags:${post.tags.join(', ')}`} />
	{/if}
	<meta data-pagefind-meta={`Published:${post.formattedDate}`} />
	<meta data-pagefind-sort={`date:${post.date}`} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLd}
</svelte:head>

<SeoLinks {canonicalUrl} {alternateLinks} {xDefaultUrl} />

<div class="container-large article-grid">
	<div class="article-spacer"></div>

	<article class="article-center">
		<header>
			<a href={resolve(toHomePath(locale) as '/')} class="article-back">
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
				{#if post.tags.length > 0}
					<div class="article-tags font-label">
						{#each post.tags as tag (tag)}
							<span class="article-tag">{tag}</span>
						{/each}
					</div>
				{/if}
			</div>
		</header>

		{#if post.cover}
			<figure class="article-figure" data-pagefind-body>
				<img alt={post.title} src={`${base}${post.cover}`} />
			</figure>
		{/if}

		<div bind:this={articleContent} class="article-content" data-pagefind-body>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html articleHtml}
		</div>

		{#key `${locale}:${post.giscusTerm}`}
			<GiscusComments {site} {ui} term={post.giscusTerm} />
		{/key}

		<RelatedPosts {locale} {ui} posts={relatedPosts} />
	</article>

	<ArticleTableOfContents
		title={post.title}
		contentsLabel={ui.article.contents}
		{headings}
		{activeId}
		onNavigate={scrollToHeading}
	/>
</div>
