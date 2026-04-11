<script lang="ts">
	import LocalizedSearchPage from '$lib/components/LocalizedSearchPage.svelte';
	import { getUiCopy } from '$lib/i18n';
	import { sourceLocale } from '$lib/locales';
	import { getSiteConfig } from '$lib/site';

	const locale = sourceLocale;
	const site = getSiteConfig(locale);
	const ui = getUiCopy(locale);
</script>

<LocalizedSearchPage {locale} {site} {ui} />
