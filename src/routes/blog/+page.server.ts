import { siteConfig } from '$lib/site';
import { getAllPosts } from '$lib/server/content';

export const load = () => ({
	posts: getAllPosts(),
	site: siteConfig
});
