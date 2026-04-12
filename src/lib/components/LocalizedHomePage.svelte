<script lang="ts">
	import { resolve } from '$app/paths';
	import { toLocalePathname, type Locale, type UiCopy } from '$lib/i18n';
	import { getConfiguredLocales, getHreflang, sourceLocale } from '$lib/locales';
	import { toAbsoluteUrl, toJsonLdScript } from '$lib/seo';
	import type { SiteConfig } from '$lib/site';
	import type { PostSummary } from '$lib/server/content';

	interface Props {
		locale: Locale;
		site: SiteConfig;
		ui: UiCopy;
		posts: PostSummary[];
	}

	let { locale, site, ui, posts }: Props = $props();

	let activeCategory = $state<string | null>(null);
	let activeTag = $state<string | null>(null);
	const selectedCategory = $derived(activeCategory ?? ui.home.allCategory);
	const canonicalPath = $derived(toLocalePathname('/', locale));
	const canonicalUrl = $derived(toAbsoluteUrl(site, canonicalPath));
	const alternateLinks = $derived(
		getConfiguredLocales().map((alternateLocale) => ({
			hreflang: getHreflang(alternateLocale),
			href: toAbsoluteUrl(site, toLocalePathname('/', alternateLocale))
		}))
	);
	const xDefaultUrl = $derived(toAbsoluteUrl(site, toLocalePathname('/', sourceLocale)));

	const categories = $derived([
		ui.home.allCategory,
		...new Set(
			posts
				.map((post) => post.category)
				.filter(Boolean)
				.sort()
		)
	]);

	const tags = $derived([
		...new Set(
			posts
				.flatMap((post) => post.tags)
				.filter(Boolean)
				.sort((left, right) => left.localeCompare(right))
		)
	]);

	const filteredPosts = $derived(
		posts.filter(
			(post) =>
				(selectedCategory === ui.home.allCategory || post.category === selectedCategory) &&
				(!activeTag || post.tags.includes(activeTag))
		)
	);

	const postPath = (postLocale: Locale, slug: string) =>
		toLocalePathname(`/blog/${slug}/`, postLocale);

	const jsonLd = $derived(
		toJsonLdScript({
			'@context': 'https://schema.org',
			'@type': 'Blog',
			name: site.title,
			description: site.description,
			url: canonicalUrl,
			inLanguage: site.language,
			publisher: {
				'@type': 'Person',
				name: site.author
			},
			blogPost: posts.slice(0, 10).map((post) => ({
				'@type': 'BlogPosting',
				headline: post.title,
				description: post.description,
				datePublished: post.date,
				url: toAbsoluteUrl(site, postPath(locale, post.slug))
			}))
		})
	);
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
	<link rel="canonical" href={canonicalUrl} />
	{#each alternateLinks as alternateLink (alternateLink.hreflang)}
		<link rel="alternate" hreflang={alternateLink.hreflang} href={alternateLink.href} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={xDefaultUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.title} />
	<meta property="og:title" content={site.title} />
	<meta property="og:description" content={site.description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={site.title} />
	<meta name="twitter:description" content={site.description} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLd}
</svelte:head>

<div class="container-small">
	<header>
		<div class="filter-group category-filter-group {tags.length > 0 ? 'has-tag-filter' : ''}">
			{#each categories as category (category)}
				<button
					type="button"
					class="filter-btn font-label {category === selectedCategory ? 'active' : ''}"
					onclick={() => {
						activeCategory = category;
					}}
				>
					{category}
				</button>
			{/each}
		</div>
		{#if tags.length > 0}
			<div class="filter-group tag-filter-group" aria-label="Tags">
				{#each tags as tag (tag)}
					<button
						type="button"
						class="filter-btn tag-filter-btn font-label {tag === activeTag ? 'active' : ''}"
						onclick={() => {
							activeTag = activeTag === tag ? null : tag;
						}}
					>
						{tag}
					</button>
				{/each}
			</div>
		{/if}
	</header>

	<section class="post-list" aria-label="Recent posts">
		{#if filteredPosts.length > 0}
			{#each filteredPosts as post (post.slug)}
				<article class="post-item">
					<time class="post-date font-label" datetime={post.date}>
						{post.formattedDate}
					</time>
					<h2 class="post-title font-body">
						<a href={resolve(postPath(locale, post.slug) as `/blog/${string}`)}>{post.title}</a>
					</h2>
					{#if post.tags.length > 0}
						<div class="post-tags font-label">
							{#each post.tags as tag (tag)}
								<span class="post-tag">{tag}</span>
							{/each}
						</div>
					{/if}
				</article>
			{/each}
		{:else}
			<div class="empty-state">
				<p class="font-label">{ui.home.emptyState}</p>
				<button
					type="button"
					class="font-label"
					onclick={() => {
						activeCategory = null;
						activeTag = null;
					}}
				>
					{ui.home.viewAll}
				</button>
			</div>
		{/if}
	</section>
</div>
