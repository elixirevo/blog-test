import { error } from '@sveltejs/kit';
import { siteConfig } from '$lib/site';
import { getAllPosts, getPost } from '$lib/server/content';

export const load = ({ params }) => {
	const post = getPost(params.slug);

	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post,
		relatedPosts: getAllPosts()
			.filter(({ slug }) => slug !== params.slug)
			.slice(0, 3),
		site: siteConfig
	};
};
