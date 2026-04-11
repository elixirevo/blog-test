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
		isLocale,
		stripBasePath,
		toLocalePathname,
		withBasePath
	} from '$lib/i18n';
	import { getConfiguredLocales, getLocaleLabel, type Locale } from '$lib/locales';
	import { getSiteConfig } from '$lib/site';
	import { onMount } from 'svelte';

	let { children } = $props();

	const currentYear = new Date().getFullYear();
	let isDarkMode = $state(false);
	let isSearchOpen = $state(false);

	const localeOptions = getConfiguredLocales();
	const routeLocale = $derived(getLocaleFromPathname(stripBasePath(page.url.pathname, base)));
	const site = $derived(getSiteConfig(routeLocale));
	const ui = $derived(getUiCopy(routeLocale));
	const homePath = $derived(toLocalePathname('/', routeLocale));

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

		const pathname = stripBasePath(window.location.pathname, base);
		const shouldRedirectFromRoot = pathname === '/' || pathname === '';

		if (!shouldRedirectFromRoot) {
			return;
		}

		const storedLocale = localStorage.getItem('preferredLocale');
		const preferredLocale =
			storedLocale && isLocale(storedLocale)
				? storedLocale
				: getPreferredLocale(window.navigator.languages);

		if (preferredLocale !== routeLocale) {
			const nextPath = withBasePath(toLocalePathname(pathname, preferredLocale), base);
			// eslint-disable-next-line svelte/no-navigation-without-resolve
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

	const persistLocale = (locale: Locale) => {
		localStorage.setItem('preferredLocale', locale);
	};

	const switchLocale = (locale: Locale) => {
		if (!isLocale(locale)) {
			return;
		}

		persistLocale(locale);
		const nextPath = withBasePath(
			toLocalePathname(stripBasePath(page.url.pathname, base), locale),
			base
		);
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		void goto(nextPath, {
			replaceState: false,
			noScroll: true,
			keepFocus: true
		});
	};

	const handleLocaleChange = (event: Event) => {
		const select = event.currentTarget as HTMLSelectElement;
		switchLocale(select.value);
	};
</script>

<svelte:head>
	<meta name="theme-color" content="#f9f9f9" />
	<link rel="icon" href={favicon} />
	<link rel="alternate" type="application/rss+xml" title={site.title} href={resolve('/rss.xml')} />
</svelte:head>

<div class="app-shell">
	<div class="bg-decorator"></div>

	<nav class="navbar">
		<div class="container">
			<a class="nav-brand" href={resolve(homePath as '/')}>
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
				<label class="visually-hidden" for="locale-select">{ui.nav.localeSwitch}</label>
				<select
					id="locale-select"
					class="locale-link locale-select ui-font"
					value={routeLocale}
					aria-label={ui.nav.localeSwitch}
					onchange={handleLocaleChange}
				>
					{#each localeOptions as localeOption (localeOption)}
						<option value={localeOption}>{getLocaleLabel(localeOption)}</option>
					{/each}
				</select>
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
