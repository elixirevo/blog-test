import { env as publicEnv } from '$env/dynamic/public';

export type Locale = string;

type LocaleMetadata = {
	label: string;
	languageTag: string;
};

const localeMetadata: Record<string, LocaleMetadata> = {
	ar: {
		label: 'AR',
		languageTag: 'ar'
	},
	de: {
		label: 'DE',
		languageTag: 'de'
	},
	en: {
		label: 'EN',
		languageTag: 'en-US'
	},
	es: {
		label: 'ES',
		languageTag: 'es'
	},
	fr: {
		label: 'FR',
		languageTag: 'fr'
	},
	it: {
		label: 'IT',
		languageTag: 'it'
	},
	ja: {
		label: 'JA',
		languageTag: 'ja'
	},
	ko: {
		label: 'KO',
		languageTag: 'ko-KR'
	},
	pt: {
		label: 'PT',
		languageTag: 'pt-PT'
	},
	'pt-br': {
		label: 'PT-BR',
		languageTag: 'pt-BR'
	},
	zh: {
		label: 'ZH',
		languageTag: 'zh-CN'
	},
	'zh-hans': {
		label: 'ZH',
		languageTag: 'zh-CN'
	},
	'zh-hant': {
		label: 'ZH-TW',
		languageTag: 'zh-TW'
	}
};

export const normalizeLocale = (value: string | undefined, fallback = 'ko'): Locale => {
	const normalized = value?.trim().replaceAll('_', '-').toLowerCase() ?? '';

	return normalized === '' ? fallback : normalized;
};

export const parseLocaleList = (value: string | undefined): Locale[] => {
	const seen = new Set<Locale>();

	return (value ?? '')
		.split(',')
		.map((locale) => normalizeLocale(locale, ''))
		.filter((locale) => {
			if (locale === '' || seen.has(locale)) {
				return false;
			}

			seen.add(locale);
			return true;
		});
};

export const sourceLocale = normalizeLocale(publicEnv.PUBLIC_SOURCE_LOCALE, 'en');

export const translationLocales = parseLocaleList(
	publicEnv.PUBLIC_TRANSLATION_LOCALES ?? publicEnv.PUBLIC_TRANSLATION_LOCALE ?? ''
).filter((locale) => locale !== sourceLocale);

export const configuredLocales = [sourceLocale, ...translationLocales];

export const getConfiguredLocales = (): Locale[] => configuredLocales;

export const getTranslationLocales = (): Locale[] => translationLocales;

export const isSourceLocale = (locale: string): boolean => normalizeLocale(locale) === sourceLocale;

export const isTranslationLocale = (locale: string | undefined): locale is Locale =>
	locale !== undefined && translationLocales.includes(normalizeLocale(locale));

export const isConfiguredLocale = (locale: string | undefined): locale is Locale =>
	locale !== undefined && configuredLocales.includes(normalizeLocale(locale));

export const getLocaleMetadata = (locale: Locale): LocaleMetadata => {
	const normalized = normalizeLocale(locale);
	const base = normalized.split('-')[0] ?? normalized;

	return (
		localeMetadata[normalized] ??
		localeMetadata[base] ?? {
			label: normalized.toUpperCase(),
			languageTag: normalized
		}
	);
};

export const getLanguageTag = (locale: Locale): string => getLocaleMetadata(locale).languageTag;

export const getLocaleLabel = (locale: Locale): string => getLocaleMetadata(locale).label;

export const getHreflang = (locale: Locale): string => {
	const languageTag = getLanguageTag(locale);

	return languageTag === '' ? locale : languageTag;
};
