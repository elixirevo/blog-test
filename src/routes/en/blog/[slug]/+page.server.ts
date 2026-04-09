import { loadPostPage } from '$lib/server/post-loaders';
import { getAllPosts } from '$lib/server/content';

export const entries = () => getAllPosts('en').map(({ slug }) => ({ slug }));
export const load = ({ params }) => loadPostPage('en', params.slug);
