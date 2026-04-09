import { loadPostPage } from '$lib/server/post-loaders';
import { getAllPosts } from '$lib/server/content';

export const entries = () => getAllPosts('ko').map(({ slug }) => ({ slug }));
export const load = ({ params }) => loadPostPage('ko', params.slug);
