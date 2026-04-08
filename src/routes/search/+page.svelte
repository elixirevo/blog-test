<script lang="ts">
	import PagefindSearch from '$lib/components/PagefindSearch.svelte';
	import { siteConfig } from '$lib/site';
</script>

<svelte:head>
	<title>Search | {siteConfig.title}</title>
	<meta
		name="description"
		content="Pagefind 기반으로 아카이브 전체 글을 검색할 수 있는 페이지입니다."
	/>
</svelte:head>

<section class="section-stack">
	<div class="section-head">
		<div>
			<p class="eyebrow">Search</p>
			<h1>Search the archive</h1>
		</div>
		<p class="section-copy">
			제목, 설명, 본문 전체를 기준으로 검색합니다. 카테고리 필터는 Pagefind 인덱스에서 바로
			계산됩니다.
		</p>
	</div>

	<PagefindSearch />
</section>
