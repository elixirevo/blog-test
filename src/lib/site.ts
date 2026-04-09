import site from '../content/site.json';
import type { Locale } from '$lib/i18n';

const localizedSiteCopy = {
	ko: {
		description: site.description,
		tagline: site.tagline,
		footer: site.footer,
		language: site.language
	},
	en: {
		description:
			'A static journal built with SvelteKit, GitHub Pages, Pages CMS, and DeepL. Posts are written in Korean and published with English translations automatically.',
		tagline: 'Static publishing for product notes and experiments',
		footer: 'Built with SvelteKit, GitHub Pages, Pages CMS, and DeepL.',
		language: 'en-US'
	}
} as const;

export type SiteConfig = typeof site & {
	locale: Locale;
};

export const getSiteConfig = (locale: Locale): SiteConfig => ({
	...site,
	...localizedSiteCopy[locale],
	locale
});

export const siteConfig = getSiteConfig('ko');
