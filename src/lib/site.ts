import { env as publicEnv } from '$env/dynamic/public';
import site from '../content/site.json';
import { getLanguageTag, normalizeLocale, sourceLocale, type Locale } from '$lib/locales';

const preferPublicEnv = (value: string | undefined, fallback: string) => {
	const trimmed = value?.trim() ?? '';
	return trimmed === '' ? fallback : trimmed;
};

const siteWithPublicEnv = {
	...site,
	url: preferPublicEnv(publicEnv.PUBLIC_SITE_URL, site.url),
	giscusRepo: preferPublicEnv(publicEnv.PUBLIC_GISCUS_REPO, site.giscusRepo),
	giscusRepoId: preferPublicEnv(publicEnv.PUBLIC_GISCUS_REPO_ID, site.giscusRepoId),
	giscusCategory: preferPublicEnv(publicEnv.PUBLIC_GISCUS_CATEGORY, site.giscusCategory),
	giscusCategoryId: preferPublicEnv(publicEnv.PUBLIC_GISCUS_CATEGORY_ID, site.giscusCategoryId)
};

const sourceSiteCopy = {
	description: siteWithPublicEnv.description,
	tagline: siteWithPublicEnv.tagline,
	footer: siteWithPublicEnv.footer
};

const localizedSiteCopy = {
	ar: {
		description:
			'يوميات ثابتة مبنية باستخدام SvelteKit وGitHub Pages وPages CMS وDeepL، مع نشر المقالات بلغات متعددة.',
		tagline: 'نشر ثابت للملاحظات والتجارب',
		footer: 'تم البناء باستخدام SvelteKit وGitHub Pages وPages CMS وDeepL.'
	},
	en: {
		description:
			'A static journal built with SvelteKit, GitHub Pages, Pages CMS, and DeepL. Posts are published with multilingual translations automatically.',
		tagline: 'Static publishing for product notes and experiments',
		footer: 'Built with SvelteKit, GitHub Pages, Pages CMS, and DeepL.'
	},
	ja: {
		description:
			'SvelteKit、GitHub Pages、Pages CMS、DeepLで構築した静的ジャーナルです。記事は多言語翻訳付きで自動公開されます。',
		tagline: 'プロダクトノートと実験のための静的パブリッシング',
		footer: 'SvelteKit、GitHub Pages、Pages CMS、DeepLで構築。'
	},
	ko: {
		description:
			'SvelteKit, GitHub Pages, Pages CMS, DeepL로 구성한 정적 저널입니다. 글은 다국어 번역과 함께 자동으로 발행됩니다.',
		tagline: '제품 노트와 실험을 위한 정적 퍼블리싱',
		footer: 'SvelteKit, GitHub Pages, Pages CMS, DeepL로 구축했습니다.'
	},
	zh: {
		description:
			'使用 SvelteKit、GitHub Pages、Pages CMS 和 DeepL 构建的静态日志，文章会自动发布为多语言版本。',
		tagline: '用于产品笔记和实验的静态发布',
		footer: '由 SvelteKit、GitHub Pages、Pages CMS 和 DeepL 构建。'
	}
} as const;

export type SiteConfig = typeof siteWithPublicEnv & {
	locale: Locale;
};

export const getSiteConfig = (locale: Locale): SiteConfig => {
	const normalizedLocale = normalizeLocale(locale, sourceLocale);
	const baseLocale = normalizedLocale.split('-')[0] ?? normalizedLocale;
	const localizedCopy =
		normalizedLocale === sourceLocale
			? sourceSiteCopy
			: (localizedSiteCopy[normalizedLocale as keyof typeof localizedSiteCopy] ??
				localizedSiteCopy[baseLocale as keyof typeof localizedSiteCopy] ??
				localizedSiteCopy.en);

	return {
		...siteWithPublicEnv,
		...localizedCopy,
		language: getLanguageTag(normalizedLocale),
		locale: normalizedLocale
	};
};

export const siteConfig = getSiteConfig(sourceLocale);
