<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Locale, UiCopy } from '$lib/i18n';
	import type { SiteConfig } from '$lib/site';
	import type { PostSummary } from '$lib/server/content';

	interface Props {
		locale: Locale;
		site: SiteConfig;
		ui: UiCopy;
		posts: PostSummary[];
	}

	let { locale, site, ui, posts }: Props = $props();

	let activeCategory = $state('');

	const categories = $derived([
		ui.home.allCategory,
		...new Set(
			posts
				.map((post) => post.category)
				.filter(Boolean)
				.sort()
		)
	]);

	const filteredPosts = $derived(
		posts.filter(
			(post) => activeCategory === ui.home.allCategory || post.category === activeCategory
		)
	);

	$effect(() => {
		if (activeCategory === '') {
			activeCategory = ui.home.allCategory;
		}
	});

	const postHref = (slug: string) =>
		resolve(locale === 'en' ? '/en/blog/[slug]' : '/blog/[slug]', { slug });
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
</svelte:head>

<div class="container-small">
	<header>
		<div class="filter-group">
			{#each categories as category (category)}
				<button
					type="button"
					class="filter-btn font-label {category === activeCategory ? 'active' : ''}"
					onclick={() => {
						activeCategory = category;
					}}
				>
					{category}
				</button>
			{/each}
		</div>
	</header>

	<section class="post-list" aria-label="Recent posts">
		{#if filteredPosts.length > 0}
			{#each filteredPosts as post (post.slug)}
				<article class="post-item">
					<time class="post-date font-label" datetime={post.date}>
						{post.formattedDate}
					</time>
					<h2 class="post-title font-body">
						<a href={postHref(post.slug)}>{post.title}</a>
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
						activeCategory = ui.home.allCategory;
					}}
				>
					{ui.home.viewAll}
				</button>
			</div>
		{/if}
	</section>
</div>
