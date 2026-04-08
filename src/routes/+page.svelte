<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeCategory = $state('All');

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});

	const categoryOrder = ['All', 'Essays', 'Technical', 'History', 'Archive'] as const;

	const categories = $derived(
		categoryOrder.filter(
			(category) => category === 'All' || data.posts.some((post) => post.category === category)
		)
	);

	const filteredPosts = $derived(
		data.posts.filter((post) => activeCategory === 'All' || post.category === activeCategory)
	);
</script>

<svelte:head>
	<title>{data.site.title}</title>
	<meta name="description" content={data.site.description} />
</svelte:head>

<div class="container-small">
	<!-- Category Filtering -->
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

	<!-- Post List Section -->
	<section class="post-list" aria-label="Recent posts">
		{#if filteredPosts.length > 0}
			{#each filteredPosts as post (post.slug)}
				<article class="post-item">
					<time class="post-date font-label" datetime={post.date}>
						{dateFormatter.format(new Date(post.date))}
					</time>
					<h2 class="post-title font-body">
						<a href={resolve('/blog/[slug]', { slug: post.slug })}>{post.title}</a>
					</h2>
				</article>
			{/each}
		{:else}
			<div class="empty-state">
				<p class="font-label">No entries in this section yet.</p>
				<button
					type="button"
					class="font-label"
					onclick={() => {
						activeCategory = 'All';
					}}
				>
					View all
				</button>
			</div>
		{/if}
	</section>
</div>
