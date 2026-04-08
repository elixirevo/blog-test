<script lang="ts">
	import '../app.css';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import { siteConfig } from '$lib/site';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import SearchModal from '$lib/components/SearchModal.svelte';

	let { children } = $props();

	const currentYear = new Date().getFullYear();
	let isDarkMode = $state(false);
	let isSearchOpen = $state(false);

	afterNavigate(() => {
		isSearchOpen = false;
	});

	onMount(() => {
		if (
			localStorage.theme === 'dark' ||
			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
		) {
			document.documentElement.classList.add('dark');
			isDarkMode = true;
		} else {
			document.documentElement.classList.remove('dark');
			isDarkMode = false;
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
</script>

<svelte:head>
	<title>{siteConfig.title}</title>
	<meta name="description" content={siteConfig.description} />
	<meta name="theme-color" content="#f9f9f9" />
	<link rel="icon" href={favicon} />
	<link
		rel="alternate"
		type="application/rss+xml"
		title={siteConfig.title}
		href={resolve('/rss.xml')}
	/>
</svelte:head>

<div class="app-shell">
	<div class="bg-decorator"></div>

	<nav class="navbar">
		<div class="container">
			<a class="nav-brand" href={resolve('/')}>
				{siteConfig.title}
			</a>
			<div class="nav-actions">
				<button class="search-box" onclick={() => isSearchOpen = true} aria-label="Search posts">
					<span class="material-symbols-outlined" data-icon="search">search</span>
					<span class="ui-font">Search archive...</span>
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
				{siteConfig.title}. Built for clarity.
			</span>
			<div class="footer-links font-label">
				<a href={resolve('/rss.xml')}>RSS</a>
				<a href="https://x.com" target="_blank">X</a>
				<a href="https://github.com" target="_blank">GitHub</a>
			</div>
		</div>
	</footer>
</div>

<SearchModal isOpen={isSearchOpen} onClose={() => { isSearchOpen = false; }} />
