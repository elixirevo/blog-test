import { base } from '$app/paths';
import { getSiteConfig } from '$lib/site';
import { getAllPosts } from '$lib/server/content';

export const prerender = true;
export const trailingSlash = 'never';

const escapeXml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');

const normalizeSiteUrl = (value: string) => value.replace(/\/+$/, '');

const withBase = (path: string) => `${base}${path}`;

const siteConfig = getSiteConfig('ko');

const toAbsoluteUrl = (path: string) =>
	new URL(withBase(path), `${normalizeSiteUrl(siteConfig.url)}/`).toString();

export const GET = () => {
	const posts = getAllPosts('ko');
	const channelLink = toAbsoluteUrl('/');
	const feedLink = toAbsoluteUrl('/rss.xml');
	const lastBuildDate = posts[0]?.date ?? new Date().toISOString();

	const items = posts
		.map((post) => {
			const link = toAbsoluteUrl(`/blog/${post.slug}/`);

			return `<item>
	<title>${escapeXml(post.title)}</title>
	<link>${escapeXml(link)}</link>
	<guid>${escapeXml(link)}</guid>
	<description>${escapeXml(post.excerpt)}</description>
	<pubDate>${new Date(post.date).toUTCString()}</pubDate>
	<category>${escapeXml(post.category)}</category>
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
