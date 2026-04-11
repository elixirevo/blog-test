import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { getTranslationLocales } from '$lib/locales';

export const entries = () => getTranslationLocales().map((locale) => ({ locale }));

export const load = ({ params }) => {
	throw redirect(308, resolve(`/${params.locale}/` as '/en/'));
};
