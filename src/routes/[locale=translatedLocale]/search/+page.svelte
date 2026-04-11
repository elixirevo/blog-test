<script lang="ts">
	import LocalizedSearchPage from '$lib/components/LocalizedSearchPage.svelte';
	import { getUiCopy } from '$lib/i18n';
	import { getSiteConfig } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const site = $derived(getSiteConfig(locale));
	const ui = $derived(getUiCopy(locale));
</script>

<LocalizedSearchPage {locale} {site} {ui} />
