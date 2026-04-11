import { getTranslationLocales } from '$lib/locales';

export const entries = () => getTranslationLocales().map((locale) => ({ locale }));

export const load = ({ params }) => ({
	locale: params.locale
});
