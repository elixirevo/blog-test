<script lang="ts">
	import LocalizedArchivePage from '$lib/components/LocalizedArchivePage.svelte';
	import { getUiCopy } from '$lib/i18n';
	import { getSiteConfig } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = 'en' as const;
	const site = getSiteConfig(locale);
	const ui = getUiCopy(locale);
</script>

<LocalizedArchivePage {locale} {site} {ui} posts={data.posts} />
