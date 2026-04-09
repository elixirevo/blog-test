<script lang="ts">
	import '../app.css';
	import { afterNavigate, goto } from '$app/navigation';
	import { base, resolve } from '$app/paths';
	import { page } from '$app/state';
	import SearchModal from '$lib/components/SearchModal.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import {
		getLocaleFromPathname,
		getPreferredLocale,
		getUiCopy,
		stripBasePath,
		toLocalePathname,
		withBasePath
	} from '$lib/i18n';
	import { getSiteConfig } from '$lib/site';
	import { onMount } from 'svelte';

	let { children } = $props();

	const currentYear = new Date().getFullYear();
	let isDarkMode = $state(false);
	let isSearchOpen = $state(false);

	const routeLocale = $derived(
		page.route.id?.startsWith('/en')
			? 'en'
			: getLocaleFromPathname(stripBasePath(page.url.pathname, base))
	);
	const site = $derived(getSiteConfig(routeLocale));
	const ui = $derived(getUiCopy(routeLocale));
	const alternateLocale = $derived(routeLocale === 'en' ? 'ko' : 'en');
	const alternatePath = $derived(
		toLocalePathname(stripBasePath(page.url.pathname, base), alternateLocale)
	);
	const alternateHref = $derived(withBasePath(alternatePath, base));

	const syncThemeFromStorage = () => {
		const prefersDark =
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

		document.documentElement.classList.toggle('dark', prefersDark);
		isDarkMode = prefersDark;
	};

	afterNavigate(() => {
		isSearchOpen = false;
		if (typeof document !== 'undefined') {
			document.documentElement.lang = site.language;
		}
	});

	onMount(() => {
		document.documentElement.lang = site.language;
		syncThemeFromStorage();

		const storedLocale = localStorage.getItem('preferredLocale');
		const preferredLocale =
			storedLocale === 'ko' || storedLocale === 'en'
				? storedLocale
				: getPreferredLocale(window.navigator.languages);

		if (preferredLocale !== routeLocale) {
			const nextPath = withBasePath(
				toLocalePathname(stripBasePath(window.location.pathname, base), preferredLocale),
				base
			);
			void goto(`${nextPath}${window.location.search}${window.location.hash}`, {
				replaceState: true,
				noScroll: true,
				keepFocus: true
			});
		}
	});

	const toggleTheme = () => {
		isDarkMode = !isDarkMode;
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
			localStorage.theme = 'dark';
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.theme = 'light';
		}
	};

	const persistLocale = (locale: 'ko' | 'en') => {
		localStorage.setItem('preferredLocale', locale);
	};

	const switchLocale = (locale: 'ko' | 'en') => {
		persistLocale(locale);
		void goto(alternateHref, {
			replaceState: false,
			noScroll: true,
			keepFocus: true
		});
	};
</script>

<svelte:head>
	<title>{site.title}</title>
	<meta name="description" content={site.description} />
	<meta name="theme-color" content="#f9f9f9" />
	<link rel="icon" href={favicon} />
	<link rel="alternate" type="application/rss+xml" title={site.title} href={resolve('/rss.xml')} />
</svelte:head>

<div class="app-shell">
	<div class="bg-decorator"></div>

	<nav class="navbar">
		<div class="container">
			<a class="nav-brand" href={resolve(routeLocale === 'en' ? '/en' : '/')}>
				{site.title}
			</a>
			<div class="nav-actions">
				<button
					class="search-box"
					onclick={() => (isSearchOpen = true)}
					aria-label={ui.nav.searchAriaLabel}
				>
					<span class="material-symbols-outlined" data-icon="search">search</span>
					<span class="ui-font">{ui.nav.searchButton}</span>
				</button>
				<button
					type="button"
					class="locale-link ui-font"
					onclick={() => switchLocale(alternateLocale)}
				>
					{ui.nav.localeSwitch}
				</button>
				<button onclick={toggleTheme} aria-label="Toggle theme" class="theme-toggle">
					<span
						class="material-symbols-outlined"
						data-icon={isDarkMode ? 'light_mode' : 'dark_mode'}
						>{isDarkMode ? 'light_mode' : 'dark_mode'}</span
					>
				</button>
			</div>
		</div>
	</nav>

	<main class="main-content">
		{@render children()}
	</main>

	<footer class="footer">
		<div class="container">
			<span class="footer-copy font-label">
				© {currentYear}
				{site.title}. {site.footer}
			</span>
			<div class="footer-links font-label">
				<a href={resolve('/rss.xml')}>{ui.footer.rss}</a>
				<a href="https://x.com" target="_blank">X</a>
				<a href="https://github.com" target="_blank">GitHub</a>
			</div>
		</div>
	</footer>
</div>

<SearchModal
	isOpen={isSearchOpen}
	locale={routeLocale}
	{ui}
	onClose={() => {
		isSearchOpen = false;
	}}
/>
