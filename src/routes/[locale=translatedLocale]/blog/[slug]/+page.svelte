<script lang="ts">
	import LocalizedArticlePage from '$lib/components/LocalizedArticlePage.svelte';
	import { getUiCopy } from '$lib/i18n';
	import { getSiteConfig } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const site = $derived(getSiteConfig(locale));
	const ui = $derived(getUiCopy(locale));
</script>

<LocalizedArticlePage
	{locale}
	{site}
	{ui}
	post={data.post}
	availableLocales={data.availableLocales}
	relatedPosts={data.relatedPosts}
/>
