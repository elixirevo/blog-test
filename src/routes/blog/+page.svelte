<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Blog | {data.site.title}</title>
	<meta name="description" content={data.site.description} />
</svelte:head>

<section class="section-stack">
	<div class="section-head">
		<div>
			<p class="eyebrow">Archive</p>
			<h1>All posts</h1>
		</div>
		<p class="section-copy">
			GitHub Pages에 prerender되는 전체 포스트 목록입니다. Pages CMS에서 새 글을 추가하면 다음
			배포에서 자동 반영됩니다.
		</p>
	</div>

	<div class="archive-grid">
		{#each data.posts as post (post.slug)}
			<a class="archive-card" href={resolve('/blog/[slug]', { slug: post.slug })}>
				<div class="post-meta">
					<span>{post.category}</span>
					<span>{post.formattedDate}</span>
					<span>{post.readingTime}</span>
				</div>
				<h2>{post.title}</h2>
				<p>{post.description}</p>
				<span class="text-link">Read article</span>
			</a>
		{/each}
	</div>
</section>
