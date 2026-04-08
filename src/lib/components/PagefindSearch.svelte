<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	type SearchStatus = 'loading' | 'ready' | 'missing';
	type SearchState = {
		query: string;
		categoryCounts: Record<string, number>;
	};

	interface Props {
		splitResults?: boolean;
		selectedCategories?: string[];
		onSearchStateChange?: (state: SearchState) => void;
	}

	type PagefindWindow = Window & {
		PagefindUI?: new (options: Record<string, unknown>) => {
			triggerFilters: (filters: Record<string, string[] | string>) => void;
			destroy: () => void;
		};
	};

	type PagefindApi = {
		search: (
			term: string | null,
			options?: { filters?: Record<string, unknown> }
		) => Promise<{
			filters?: Record<string, Record<string, number>>;
			totalFilters?: Record<string, Record<string, number>>;
			results?: Array<{
				id?: string;
				data: () => Promise<{
					meta?: Record<string, string>;
					url?: string;
					excerpt?: string;
				}>;
			}>;
		}>;
		destroy: () => Promise<void> | void;
	};

	let {
		splitResults = false,
		selectedCategories = [],
		onSearchStateChange = () => {}
	}: Props = $props();

	const bundlePath = `${base}/pagefind/`;
	const baseUrl = base === '' ? '/' : `${base}/`;

	let status = $state<SearchStatus>('loading');
	let searchMount = $state<HTMLDivElement | undefined>(undefined);
	let resultsHost = $state<HTMLDivElement | undefined>(undefined);
	let pagefindUi = $state<{
		triggerFilters: (filters: Record<string, string[] | string>) => void;
		destroy: () => void;
	} | null>(null);
	let pagefindApi = $state<PagefindApi | null>(null);
	let searchInput = $state<HTMLInputElement | undefined>(undefined);
	let searchQuery = $state('');
	let categoryCounts = $state<Record<string, number>>({});

	const emitSearchState = () => {
		onSearchStateChange({
			query: searchQuery,
			categoryCounts
		});
	};

	const moveDrawerToResultsHost = (target: HTMLElement) => {
		if (!splitResults || !resultsHost) {
			return;
		}

		const drawer = target.querySelector<HTMLElement>('.pagefind-ui__drawer');

		if (drawer && drawer.parentElement !== resultsHost) {
			// Pagefind renders its drawer inside its own root, so the modal re-homes it intentionally.
			// eslint-disable-next-line svelte/no-dom-manipulating
			resultsHost.append(drawer);
		}
	};

	const ensurePagefindApi = async () => {
		if (pagefindApi) {
			return pagefindApi;
		}

		const pagefindModule = (await import(/* @vite-ignore */ `${bundlePath}pagefind.js`)) as {
			createInstance: (options: Record<string, unknown>) => PagefindApi;
		};

		pagefindApi = pagefindModule.createInstance({
			basePath: bundlePath
		});

		return pagefindApi;
	};

	let searchStateRequest = 0;
	let searchStateTimer: ReturnType<typeof setTimeout> | undefined;

	const deriveCategoryCountsFromResults = async (
		results: Array<{
			data: () => Promise<{
				meta?: Record<string, string>;
			}>;
		}>
	) => {
		const counts: Record<string, number> = {};
		const fragments = await Promise.all(results.map((result) => result.data()));

		for (const fragment of fragments) {
			const category = fragment.meta?.Category;

			if (!category) {
				continue;
			}

			counts[category] = (counts[category] ?? 0) + 1;
		}

		return counts;
	};

	const refreshSearchData = async () => {
		const trimmedQuery = searchQuery.trim();

		if (searchStateTimer) {
			clearTimeout(searchStateTimer);
		}

		if (trimmedQuery === '') {
			categoryCounts = {};
			emitSearchState();
			return;
		}

		const requestId = ++searchStateRequest;
		searchStateTimer = setTimeout(async () => {
			const api = await ensurePagefindApi();
			const countsResponse = await api.search(searchQuery, { filters: {} });

			if (requestId !== searchStateRequest) {
				return;
			}

			const filterCounts = countsResponse.filters?.Category;
			const totalFilterCounts = countsResponse.totalFilters?.Category;

			categoryCounts =
				filterCounts && Object.keys(filterCounts).length > 0
					? filterCounts
					: totalFilterCounts && Object.keys(totalFilterCounts).length > 0
						? totalFilterCounts
						: await deriveCategoryCountsFromResults(countsResponse.results ?? []);

			emitSearchState();
		}, 180);
	};

	const handleSearchInput = (event: Event) => {
		searchQuery = (event.currentTarget as HTMLInputElement).value;
		void refreshSearchData();
	};

	const syncSearchInput = (target: HTMLElement) => {
		const nextInput = target.querySelector<HTMLInputElement>('.pagefind-ui__search-input') ?? undefined;

		if (searchInput === nextInput) {
			return;
		}

		if (searchInput) {
			searchInput.removeEventListener('input', handleSearchInput);
		}

		searchInput = nextInput;

		if (searchInput) {
			searchInput.addEventListener('input', handleSearchInput);
			searchQuery = searchInput.value;
			void refreshSearchData();
		}
	};

	const applySelectedCategories = () => {
		if (!pagefindUi) {
			return;
		}

		if (selectedCategories.length === 0) {
			pagefindUi.triggerFilters({});
			return;
		}

		pagefindUi.triggerFilters({
			Category: selectedCategories
		});
	};

	const ensureStylesheet = (href: string) => {
		if (document.querySelector(`link[data-pagefind-ui="true"][href="${href}"]`)) {
			return;
		}

		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		link.dataset.pagefindUi = 'true';
		document.head.append(link);
	};

	const loadScript = async (src: string) =>
		new Promise<void>((resolve, reject) => {
			const pagefindWindow = window as PagefindWindow;

			if (pagefindWindow.PagefindUI) {
				resolve();
				return;
			}

			const existing = document.querySelector<HTMLScriptElement>(
				`script[data-pagefind-ui="true"][src="${src}"]`
			);

			const handleLoad = () => resolve();
			const handleError = () => reject(new Error(`Failed to load ${src}`));

			if (existing) {
				existing.addEventListener('load', handleLoad, { once: true });
				existing.addEventListener('error', handleError, { once: true });
				return;
			}

			const script = document.createElement('script');
			script.src = src;
			script.async = true;
			script.dataset.pagefindUi = 'true';
			script.addEventListener('load', handleLoad, { once: true });
			script.addEventListener('error', handleError, { once: true });
			document.head.append(script);
		});

	onMount(() => {
		let cancelled = false;
		let drawerObserver: MutationObserver | undefined;

		const initSearch = async () => {
			try {
				ensureStylesheet(`${bundlePath}pagefind-ui.css`);
				await loadScript(`${bundlePath}pagefind-ui.js`);

				if (cancelled) {
					return;
				}

				const target = searchMount;
				const PagefindUI = (window as PagefindWindow).PagefindUI;

				if (!target || !PagefindUI) {
					throw new Error('Pagefind UI is unavailable');
				}

				target.innerHTML = '';

				pagefindUi = new PagefindUI({
					element: target,
					bundlePath,
					baseUrl,
					showImages: false,
					showSubResults: false,
					showEmptyFilters: false
				});

				moveDrawerToResultsHost(target);
				syncSearchInput(target);
				applySelectedCategories();

				drawerObserver = new MutationObserver(() => {
					syncSearchInput(target);
					if (splitResults && resultsHost) {
						moveDrawerToResultsHost(target);
					}
				});
				drawerObserver.observe(target.parentElement ?? target, {
					childList: true,
					subtree: true
				});

				status = 'ready';
			} catch (error) {
				console.error(error);
				if (!cancelled) {
					status = 'missing';
				}
			}
		};

		void initSearch();

		return () => {
			cancelled = true;
			if (searchStateTimer) {
				clearTimeout(searchStateTimer);
			}
			drawerObserver?.disconnect();
			searchInput?.removeEventListener('input', handleSearchInput);
			searchInput = undefined;
			pagefindUi?.destroy();
			pagefindUi = null;
			void pagefindApi?.destroy();
			pagefindApi = null;
		};
	});

	$effect(() => {
		const selectedCategoryCount = selectedCategories.length;
		void selectedCategoryCount;
		void refreshSearchData();
		applySelectedCategories();
	});
</script>

<div
	class="search-panel"
	role="search"
	aria-label="Archive search"
	data-split-results={splitResults ? 'true' : 'false'}
>
	<div class="search-shell">
		<div bind:this={searchMount}></div>
		{#if splitResults}
			<div class="search-results-host" bind:this={resultsHost}></div>
		{/if}
	</div>

	{#if status === 'loading'}
		<p class="search-status" data-state="loading">검색 인덱스를 불러오는 중입니다.</p>
	{:else if status === 'missing'}
		<div class="search-status" data-state="missing">
			<p>Pagefind 인덱스를 아직 찾지 못했습니다.</p>
			<p class="search-hint">
				로컬에서는 <code>bun run build</code> 후 <code>bun run preview</code>에서 검색을 확인할 수
				있습니다.
			</p>
		</div>
	{/if}
</div>
