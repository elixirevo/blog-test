<script lang="ts">
	import LocalizedHomePage from '$lib/components/LocalizedHomePage.svelte';
	import { getUiCopy } from '$lib/i18n';
	import { getSiteConfig } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = 'en' as const;
	const site = getSiteConfig(locale);
	const ui = getUiCopy(locale);
</script>

<LocalizedHomePage {locale} {site} {ui} posts={data.posts} />
