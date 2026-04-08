import matter from 'gray-matter';
import { marked } from 'marked';
import { siteConfig } from '$lib/site';

marked.use({
	gfm: true,
	breaks: false
});

const postFiles = import.meta.glob('/src/content/posts/*.md', {
	eager: true,
	import: 'default',
	query: '?raw'
}) as Record<string, string>;

type Frontmatter = {
	title?: string;
	description?: string;
	date?: string;
	published?: boolean;
	category?: string;
	cover?: string;
};

type ParsedPost = {
	slug: string;
	title: string;
	description: string;
	date: string;
	published: boolean;
	formattedDate: string;
	readingTime: string;
	category: string;
	cover: string | null;
	excerpt: string;
	html: string;
	timestamp: number;
};

export type BlogPost = Omit<ParsedPost, 'published' | 'timestamp'>;
export type PostSummary = Omit<ParsedPost, 'html' | 'published' | 'timestamp'>;

const formatter = new Intl.DateTimeFormat(siteConfig.language, {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
});

const toSlug = (path: string) => path.split('/').at(-1)?.replace(/\.md$/, '') ?? path;

const normalizeCover = (cover: unknown) => {
	if (typeof cover !== 'string' || cover.trim() === '') {
		return null;
	}

	return cover.startsWith('/') ? cover : `/${cover.replace(/^\/+/, '')}`;
};

const stripMarkdown = (content: string) =>
	content
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/^>\s?/gm, '')
		.replace(/^#+\s+/gm, '')
		.replace(/[*_~]/g, '')
		.replace(/\s+/g, ' ')
		.trim();

const estimateReadingTime = (content: string) => {
	const wordCount = stripMarkdown(content).split(/\s+/).filter(Boolean).length;
	return `${Math.max(1, Math.ceil(wordCount / 220))} min read`;
};

const createExcerpt = (description: string, content: string) => {
	if (description.trim() !== '') {
		return description;
	}

	return `${stripMarkdown(content).slice(0, 160)}...`;
};

const parsePost = (path: string, source: string): ParsedPost => {
	const slug = toSlug(path);
	const { content, data } = matter(source);
	const frontmatter = data as Frontmatter;

	if (!frontmatter.title || !frontmatter.description || !frontmatter.date) {
		throw new Error(`Missing required frontmatter in ${path}`);
	}

	const timestamp = Date.parse(frontmatter.date);

	if (Number.isNaN(timestamp)) {
		throw new Error(`Invalid date in ${path}: ${frontmatter.date}`);
	}

	return {
		slug,
		title: frontmatter.title,
		description: frontmatter.description,
		date: frontmatter.date,
		published: frontmatter.published !== false,
		formattedDate: formatter.format(new Date(timestamp)),
		readingTime: estimateReadingTime(content),
		category: frontmatter.category?.trim() || 'Notes',
		cover: normalizeCover(frontmatter.cover),
		excerpt: createExcerpt(frontmatter.description, content),
		html: marked.parse(content) as string,
		timestamp
	};
};

const posts = Object.entries(postFiles)
	.map(([path, source]) => parsePost(path, source))
	.filter(({ published }) => published)
	.sort((left, right) => right.timestamp - left.timestamp);

const toSummary = (post: ParsedPost): PostSummary => ({
	slug: post.slug,
	title: post.title,
	description: post.description,
	date: post.date,
	formattedDate: post.formattedDate,
	readingTime: post.readingTime,
	category: post.category,
	cover: post.cover,
	excerpt: post.excerpt
});

const toBlogPost = (post: ParsedPost): BlogPost => ({
	...toSummary(post),
	html: post.html
});

export const getAllPosts = (): PostSummary[] => posts.map(toSummary);

export const getPost = (slug: string): BlogPost | undefined => {
	const post = posts.find((entry) => entry.slug === slug);

	if (!post) {
		return undefined;
	}

	return toBlogPost(post);
};
