import { loadPostPage } from '$lib/server/post-loaders';
import { getAllPosts } from '$lib/server/content';
import { sourceLocale } from '$lib/locales';

export const entries = () => getAllPosts(sourceLocale).map(({ slug }) => ({ slug }));
export const load = ({ params }) => loadPostPage(sourceLocale, params.slug);
