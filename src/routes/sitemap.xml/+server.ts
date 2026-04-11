import { toLocalePathname } from '$lib/i18n';
import { getConfiguredLocales, getHreflang, sourceLocale, type Locale } from '$lib/locales';
import { getSiteConfig } from '$lib/site';
import { toAbsoluteUrl } from '$lib/seo';
import { getAllPosts, getPostLocales } from '$lib/server/content';

export const prerender = true;
export const trailingSlash = 'never';

const siteConfig = getSiteConfig(sourceLocale);

const escapeXml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');

type AlternateLink = {
	hreflang: string;
	href: string;
};

type SitemapEntry = {
	loc: string;
	lastmod?: string;
	changefreq?: string;
	priority?: string;
	alternates?: AlternateLink[];
};

const formatLastmod = (date: string) => new Date(date).toISOString().slice(0, 10);

const toPostPath = (locale: Locale, slug: string) => toLocalePathname(`/blog/${slug}/`, locale);

const renderAlternates = (alternates: AlternateLink[] = []) =>
	alternates
		.map(
			({ hreflang, href }) =>
				`		<xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}" />`
		)
		.join('\n');

const renderEntry = ({ loc, lastmod, changefreq, priority, alternates }: SitemapEntry) => {
	const alternateXml = renderAlternates(alternates);

	return `	<url>
		<loc>${escapeXml(loc)}</loc>${lastmod ? `\n		<lastmod>${escapeXml(lastmod)}</lastmod>` : ''}${
			changefreq ? `\n		<changefreq>${escapeXml(changefreq)}</changefreq>` : ''
		}${priority ? `\n		<priority>${escapeXml(priority)}</priority>` : ''}${
			alternateXml ? `\n${alternateXml}` : ''
		}
	</url>`;
};

export const GET = () => {
	const locales = getConfiguredLocales();

	const homeAlternates = locales.map((locale) => ({
		hreflang: getHreflang(locale),
		href: toAbsoluteUrl(siteConfig, toLocalePathname('/', locale))
	}));
	homeAlternates.push({
		hreflang: 'x-default',
		href: toAbsoluteUrl(siteConfig, toLocalePathname('/', sourceLocale))
	});

	const entries: SitemapEntry[] = locales.map((locale) => ({
		loc: toAbsoluteUrl(siteConfig, toLocalePathname('/', locale)),
		changefreq: 'daily',
		priority: locale === sourceLocale ? '1.0' : '0.9',
		alternates: homeAlternates
	}));

	for (const locale of locales) {
		for (const post of getAllPosts(locale)) {
			const alternateLocales = getPostLocales(post.slug);
			const alternates = alternateLocales.map((alternateLocale) => ({
				hreflang: getHreflang(alternateLocale),
				href: toAbsoluteUrl(siteConfig, toPostPath(alternateLocale, post.slug))
			}));

			if (alternateLocales.includes(sourceLocale)) {
				alternates.push({
					hreflang: 'x-default',
					href: toAbsoluteUrl(siteConfig, toPostPath(sourceLocale, post.slug))
				});
			}

			entries.push({
				loc: toAbsoluteUrl(siteConfig, toPostPath(locale, post.slug)),
				lastmod: formatLastmod(post.date),
				changefreq: 'weekly',
				priority: locale === sourceLocale ? '0.8' : '0.7',
				alternates
			});
		}
	}

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(renderEntry).join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Cache-Control': 'max-age=0, s-maxage=3600',
			'Content-Type': 'application/xml; charset=utf-8'
		}
	});
};
