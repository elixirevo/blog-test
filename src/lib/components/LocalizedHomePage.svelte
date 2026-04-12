<script lang="ts">
	import { resolve } from '$app/paths';
	import PostFilters from '$lib/components/PostFilters.svelte';
	import SeoLinks from '$lib/components/SeoLinks.svelte';
	import { type Locale, type UiCopy } from '$lib/i18n';
	import { getConfiguredLocales } from '$lib/locales';
	import { toHomePath, toPostPath } from '$lib/routes';
	import { toAbsoluteUrl, toAlternateLinks, toJsonLdScript, toXDefaultUrl } from '$lib/seo';
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
	const canonicalPath = $derived(toHomePath(locale));
	const canonicalUrl = $derived(toAbsoluteUrl(site, canonicalPath));
	const alternateLinks = $derived(
		toAlternateLinks(site, getConfiguredLocales(), (alternateLocale) => toHomePath(alternateLocale))
	);
	const xDefaultUrl = $derived(toXDefaultUrl(site, toHomePath));

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
				url: toAbsoluteUrl(site, toPostPath(locale, post.slug))
			}))
		})
	);
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
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

<SeoLinks {canonicalUrl} {alternateLinks} {xDefaultUrl} />

<div class="container-small">
	<PostFilters
		{categories}
		{tags}
		{selectedCategory}
		{activeTag}
		onCategorySelect={(category) => {
			activeCategory = category;
		}}
		onTagToggle={(tag) => {
			activeTag = activeTag === tag ? null : tag;
		}}
	/>

	<section class="post-list" aria-label="Recent posts">
		{#if filteredPosts.length > 0}
			{#each filteredPosts as post (post.slug)}
				<article class="post-item">
					<time class="post-date font-label" datetime={post.date}>
						{post.formattedDate}
					</time>
					<h2 class="post-title font-body">
						<a href={resolve(toPostPath(locale, post.slug) as `/blog/${string}`)}>{post.title}</a>
					</h2>
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
