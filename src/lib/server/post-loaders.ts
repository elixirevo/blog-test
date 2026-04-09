import { error } from '@sveltejs/kit';
import type { Locale } from '$lib/i18n';
import { getAllPosts, getPost } from '$lib/server/content';

export const loadPostListPage = (locale: Locale) => ({
	posts: getAllPosts(locale)
});

export const loadPostPage = (locale: Locale, slug: string) => {
	const post = getPost(slug, locale);

	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post,
		relatedPosts: getAllPosts(locale)
			.filter((entry) => entry.slug !== slug)
			.slice(0, 3)
	};
};
