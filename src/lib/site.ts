import { env as publicEnv } from '$env/dynamic/public';
import site from '../content/site.json';
import type { Locale } from '$lib/i18n';

const preferPublicEnv = (value: string | undefined, fallback: string) => {
	const trimmed = value?.trim() ?? '';
	return trimmed === '' ? fallback : trimmed;
};

const siteWithPublicEnv = {
	...site,
	giscusRepo: preferPublicEnv(publicEnv.PUBLIC_GISCUS_REPO, site.giscusRepo),
	giscusRepoId: preferPublicEnv(publicEnv.PUBLIC_GISCUS_REPO_ID, site.giscusRepoId),
	giscusCategory: preferPublicEnv(publicEnv.PUBLIC_GISCUS_CATEGORY, site.giscusCategory),
	giscusCategoryId: preferPublicEnv(publicEnv.PUBLIC_GISCUS_CATEGORY_ID, site.giscusCategoryId)
};

const localizedSiteCopy = {
	ko: {
		description: siteWithPublicEnv.description,
		tagline: siteWithPublicEnv.tagline,
		footer: siteWithPublicEnv.footer,
		language: siteWithPublicEnv.language
	},
	en: {
		description:
			'A static journal built with SvelteKit, GitHub Pages, Pages CMS, and DeepL. Posts are written in Korean and published with English translations automatically.',
		tagline: 'Static publishing for product notes and experiments',
		footer: 'Built with SvelteKit, GitHub Pages, Pages CMS, and DeepL.',
		language: 'en-US'
	}
} as const;

export type SiteConfig = typeof siteWithPublicEnv & {
	locale: Locale;
};

export const getSiteConfig = (locale: Locale): SiteConfig => ({
	...siteWithPublicEnv,
	...localizedSiteCopy[locale],
	locale
});

export const siteConfig = getSiteConfig('ko');
