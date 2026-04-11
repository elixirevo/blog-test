import type { SiteConfig } from '$lib/site';

type SiteUrlConfig = Pick<SiteConfig, 'url'>;

const normalizeSiteUrl = (value: string) => value.replace(/\/+$/, '');

const toRelativePath = (pathname: string) => {
	if (pathname === '/' || pathname.trim() === '') {
		return '';
	}

	return pathname.replace(/^\/+/, '');
};

export const toAbsoluteUrl = (site: SiteUrlConfig, pathname: string) =>
	new URL(toRelativePath(pathname), `${normalizeSiteUrl(site.url)}/`).toString();

export const stringifyJsonLd = (value: unknown) => JSON.stringify(value).replaceAll('<', '\\u003c');

export const toJsonLdScript = (value: unknown) =>
	`<script type="application/ld+json">${stringifyJsonLd(value)}</script>`;
