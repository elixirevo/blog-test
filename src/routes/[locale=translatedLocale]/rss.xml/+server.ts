import { getTranslationLocales } from '$lib/locales';
import { createRssResponse } from '$lib/server/rss';

export const prerender = true;
export const trailingSlash = 'never';

export const entries = () => getTranslationLocales().map((locale) => ({ locale }));

export const GET = ({ params }) => createRssResponse(params.locale);
