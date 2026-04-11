import { getAllPosts } from '$lib/server/content';
import { loadPostPage } from '$lib/server/post-loaders';
import { getTranslationLocales } from '$lib/locales';

export const entries = () =>
	getTranslationLocales().flatMap((locale) =>
		getAllPosts(locale).map(({ slug }) => ({
			locale,
			slug
		}))
	);

export const load = ({ params }) => loadPostPage(params.locale, params.slug);
