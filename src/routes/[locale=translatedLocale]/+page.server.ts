import { getTranslationLocales } from '$lib/locales';
import { loadPostListPage } from '$lib/server/post-loaders';

export const entries = () => getTranslationLocales().map((locale) => ({ locale }));

export const load = ({ params }) => loadPostListPage(params.locale);
