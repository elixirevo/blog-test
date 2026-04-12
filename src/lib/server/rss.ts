import { toLocalePathname, type Locale } from '$lib/i18n';
import { toAbsoluteUrl } from '$lib/seo';
import { getAllPosts } from '$lib/server/content';
import { getSiteConfig } from '$lib/site';

const escapeXml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');

const getRssPath = (locale: Locale) => toLocalePathname('/rss.xml', locale);

export const createRssResponse = (locale: Locale) => {
	const siteConfig = getSiteConfig(locale);
	const posts = getAllPosts(locale);
	const channelLink = toAbsoluteUrl(siteConfig, toLocalePathname('/', locale));
	const feedLink = toAbsoluteUrl(siteConfig, getRssPath(locale));
	const lastBuildDate = posts[0]?.date ?? new Date().toISOString();

	const items = posts
		.map((post) => {
			const link = toAbsoluteUrl(siteConfig, toLocalePathname(`/blog/${post.slug}/`, locale));
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

	return new Response(rss, {
		headers: {
			'Cache-Control': 'max-age=0, s-maxage=3600',
			'Content-Type': 'application/rss+xml; charset=utf-8'
		}
	});
};
