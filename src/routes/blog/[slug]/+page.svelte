<script lang="ts">
	import LocalizedArticlePage from '$lib/components/LocalizedArticlePage.svelte';
	import { getUiCopy } from '$lib/i18n';
	import { getSiteConfig } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = 'ko' as const;
	const site = getSiteConfig(locale);
	const ui = getUiCopy(locale);
</script>

<LocalizedArticlePage {locale} {site} {ui} post={data.post} relatedPosts={data.relatedPosts} />
