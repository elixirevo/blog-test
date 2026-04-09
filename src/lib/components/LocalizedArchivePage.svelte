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

	const postHref = (slug: string) =>
		resolve(locale === 'en' ? '/en/blog/[slug]' : '/blog/[slug]', { slug });
</script>

<svelte:head>
	<title>Blog | {site.title}</title>
	<meta name="description" content={site.description} />
</svelte:head>

<section class="section-stack">
	<div class="section-head">
		<div>
			<p class="eyebrow">{ui.archive.eyebrow}</p>
			<h1>{ui.archive.title}</h1>
		</div>
		<p class="section-copy">
			{ui.archive.description}
		</p>
	</div>

	<div class="archive-grid">
		{#each posts as post (post.slug)}
			<a class="archive-card" href={postHref(post.slug)}>
				<div class="post-meta">
					<span>{post.category}</span>
					<span>{post.formattedDate}</span>
					<span>{post.readingTime}</span>
				</div>
				<h2>{post.title}</h2>
				<p>{post.description}</p>
				<span class="text-link">{ui.archive.readArticle}</span>
			</a>
		{/each}
	</div>
</section>
