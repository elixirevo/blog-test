import type { Locale } from '$lib/i18n';
import { toHomePath, toPostPath, toRssPath } from '$lib/routes';
import { toAbsoluteUrl } from '$lib/seo';
import { getAllPosts } from '$lib/server/content';
import { createXmlResponse, escapeXml } from '$lib/server/xml';
import { getSiteConfig } from '$lib/site';

export const createRssResponse = (locale: Locale) => {
	const siteConfig = getSiteConfig(locale);
	const posts = getAllPosts(locale);
	const channelLink = toAbsoluteUrl(siteConfig, toHomePath(locale));
	const feedLink = toAbsoluteUrl(siteConfig, toRssPath(locale));
	const lastBuildDate = posts[0]?.date ?? new Date().toISOString();

	const items = posts
		.map((post) => {
			const link = toAbsoluteUrl(siteConfig, toPostPath(locale, post.slug));
			const categories = [post.category, ...post.tags]
				.map((category) => `		<category>${escapeXml(category)}</category>`)
				.join('\n');

			return `<item>
		<title>${escapeXml(post.title)}</title>
	<link>${escapeXml(link)}</link>
	<guid>${escapeXml(link)}</guid>
		<description>${escapeXml(post.excerpt)}</description>
		<pubDate>${new Date(post.date).toUTCString()}</pubDate>
${categories}
	</item>`;
		})
		.join('\n');

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
	<title>${escapeXml(siteConfig.title)}</title>
	<link>${escapeXml(channelLink)}</link>
	<description>${escapeXml(siteConfig.description)}</description>
	<language>${escapeXml(siteConfig.language)}</language>
	<lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>
	<atom:link href="${escapeXml(feedLink)}" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

	return createXmlResponse(rss, 'application/rss+xml');
};
