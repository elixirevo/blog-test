export const supportedLocales = ['ko', 'en'] as const;

export type Locale = (typeof supportedLocales)[number];

export type UiCopy = {
	nav: {
		searchButton: string;
		searchAriaLabel: string;
		localeSwitch: string;
	};
	home: {
		allCategory: string;
		emptyState: string;
		viewAll: string;
	};
	archive: {
		eyebrow: string;
		title: string;
		description: string;
		readArticle: string;
	};
	article: {
		backToArchive: string;
		continueReading: string;
		relatedTitle: string;
		contents: string;
	};
	comments: {
		label: string;
		title: string;
		emptyMessage: string;
	};
	search: {
		eyebrow: string;
		title: string;
		description: string;
		placeholder: string;
		ariaLabel: string;
		loading: string;
		missingTitle: string;
		missingHint: string;
	};
	modal: {
		close: string;
		categories: string;
		select: string;
		navigate: string;
	};
	footer: {
		rss: string;
	};
};

export const defaultLocale: Locale = 'ko';

const uiCopy: Record<Locale, UiCopy> = {
	ko: {
		nav: {
			searchButton: '검색',
			searchAriaLabel: '글 검색 열기',
			localeSwitch: 'EN'
		},
		home: {
			allCategory: '전체',
			emptyState: '아직 이 섹션에는 글이 없습니다.',
			viewAll: '전체 보기'
		},
		archive: {
			eyebrow: 'Archive',
			title: 'All posts',
			description:
				'GitHub Pages에 prerender되는 전체 포스트 목록입니다. Pages CMS에서 새 글을 추가하면 번역 생성 후 다음 배포에서 자동 반영됩니다.',
			readArticle: '글 읽기'
		},
		article: {
			backToArchive: '아카이브로 돌아가기',
			continueReading: 'Continue reading',
			relatedTitle: '다음 글도 준비되어 있습니다',
			contents: '목차'
		},
		comments: {
			label: 'Conversation',
			title: '의견을 남겨보세요',
			emptyMessage:
				'`site.json`에 `giscusRepo`, `giscusRepoId`, `giscusCategory`, `giscusCategoryId`를 채우면 댓글이 활성화됩니다.'
		},
		search: {
			eyebrow: 'Search',
			title: '아카이브 검색',
			description:
				'제목, 설명, 본문 전체를 기준으로 검색합니다. 카테고리 필터는 Pagefind 인덱스에서 바로 계산됩니다.',
			placeholder: '아카이브 검색',
			ariaLabel: '아카이브 검색',
			loading: '검색 인덱스를 불러오는 중입니다.',
			missingTitle: 'Pagefind 인덱스를 아직 찾지 못했습니다.',
			missingHint: '로컬에서는 `bun run build` 후 `bun run preview`에서 검색을 확인할 수 있습니다.'
		},
		modal: {
			close: '검색 닫기',
			categories: '카테고리',
			select: '선택',
			navigate: '이동'
		},
		footer: {
			rss: 'RSS'
		}
	},
	en: {
		nav: {
			searchButton: 'Search',
			searchAriaLabel: 'Open search',
			localeSwitch: 'KO'
		},
		home: {
			allCategory: 'All',
			emptyState: 'No entries in this section yet.',
			viewAll: 'View all'
		},
		archive: {
			eyebrow: 'Archive',
			title: 'All posts',
			description:
				'This is the full translated archive prerendered for GitHub Pages. Posts authored in Pages CMS are translated automatically before deployment.',
			readArticle: 'Read article'
		},
		article: {
			backToArchive: 'Back to archive',
			continueReading: 'Continue reading',
			relatedTitle: 'More posts in English',
			contents: 'Contents'
		},
		comments: {
			label: 'Conversation',
			title: 'Join the discussion',
			emptyMessage:
				'Fill in `giscusRepo`, `giscusRepoId`, `giscusCategory`, and `giscusCategoryId` in `site.json` to enable comments.'
		},
		search: {
			eyebrow: 'Search',
			title: 'Search the archive',
			description:
				'Search across translated titles, descriptions, and article bodies. Category filters are computed directly from the Pagefind index.',
			placeholder: 'Search the archive',
			ariaLabel: 'Archive search',
			loading: 'Loading the search index.',
			missingTitle: 'Pagefind index not found yet.',
			missingHint: 'For local verification, run `bun run build` and then `bun run preview`.'
		},
		modal: {
			close: 'Close search',
			categories: 'Categories',
			select: 'Select',
			navigate: 'Navigate'
		},
		footer: {
			rss: 'RSS'
		}
	}
};

export const getUiCopy = (locale: Locale): UiCopy => uiCopy[locale];

export const getLocaleFromPathname = (pathname: string): Locale =>
	pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'ko';

export const stripLocalePrefix = (pathname: string): string => {
	if (pathname === '/en') {
		return '/';
	}

	if (pathname.startsWith('/en/')) {
		return pathname.slice(3) || '/';
	}

	return pathname || '/';
};

export const toLocalePathname = (pathname: string, locale: Locale): string => {
	const normalized = stripLocalePrefix(pathname);

	if (locale === 'en') {
		return normalized === '/' ? '/en/' : `/en${normalized}`;
	}

	return normalized;
};

export const stripBasePath = (pathname: string, basePath: string): string => {
	if (basePath !== '' && pathname.startsWith(basePath)) {
		return pathname.slice(basePath.length) || '/';
	}

	return pathname || '/';
};

export const withBasePath = (pathname: string, basePath: string): string =>
	basePath === '' ? pathname : `${basePath}${pathname === '/' ? '/' : pathname}`;

export const getPreferredLocale = (languages: readonly string[]): Locale => {
	const first = languages[0]?.toLowerCase() ?? '';
	return first.startsWith('ko') ? 'ko' : 'en';
};

export const isLocale = (value: string): value is Locale =>
	supportedLocales.includes(value as Locale);
