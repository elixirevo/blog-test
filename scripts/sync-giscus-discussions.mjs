import { existsSync, readFileSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourceDir = path.join(projectRoot, 'src/content/posts');
const githubApiUrl = 'https://api.github.com/graphql';

const loadEnvFile = (filePath) => {
	if (!existsSync(filePath)) {
		return;
	}

	for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
		const trimmed = line.trim();
		if (trimmed === '' || trimmed.startsWith('#')) {
			continue;
		}

		const separatorIndex = trimmed.indexOf('=');
		if (separatorIndex === -1) {
			continue;
		}

		const key = trimmed.slice(0, separatorIndex).trim();
		const value = trimmed
			.slice(separatorIndex + 1)
			.trim()
			.replace(/^"|"$/g, '')
			.replace(/^'|'$/g, '');

		if (process.env[key] === undefined) {
			process.env[key] = value;
		}
	}
};

loadEnvFile(path.join(projectRoot, '.env.production'));

const githubToken = process.env.GITHUB_TOKEN?.trim() ?? '';
const repoFullName =
	process.env.PUBLIC_GISCUS_REPO?.trim() || process.env.GITHUB_REPOSITORY?.trim() || '';
const repositoryId = process.env.PUBLIC_GISCUS_REPO_ID?.trim() ?? '';
const categoryId = process.env.PUBLIC_GISCUS_CATEGORY_ID?.trim() ?? '';
const siteUrl =
	process.env.PUBLIC_SITE_URL?.trim().replace(/\/+$/, '') ||
	'https://elixirevo.github.io/blog-test';

if (repoFullName === '' || repositoryId === '' || categoryId === '') {
	console.log('Giscus repository or category settings are missing. Skipping discussion sync.');
	process.exit(0);
}

if (githubToken === '') {
	throw new Error('GITHUB_TOKEN is required to sync giscus discussions.');
}

const [repoOwner, repoName] = repoFullName.split('/');

if (!repoOwner || !repoName) {
	throw new Error(`Invalid PUBLIC_GISCUS_REPO value: ${repoFullName}`);
}

const graphql = async (query, variables = {}) => {
	const response = await fetch(githubApiUrl, {
		method: 'POST',
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${githubToken}`,
			'Content-Type': 'application/json',
			'User-Agent': 'giscus-discussion-sync'
		},
		body: JSON.stringify({
			query,
			variables
		})
	});

	if (!response.ok) {
		throw new Error(`GitHub GraphQL request failed (${response.status}): ${await response.text()}`);
	}

	const payload = await response.json();

	if (payload.errors?.length > 0) {
		throw new Error(`GitHub GraphQL returned errors: ${JSON.stringify(payload.errors)}`);
	}

	return payload.data;
};

const listMarkdownFiles = async (dir) => {
	const entries = await readdir(dir, { withFileTypes: true });

	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
		.map((entry) => path.join(dir, entry.name))
		.sort((left, right) => left.localeCompare(right));
};

const isTruthy = (value) => value !== false;

const encodeSlugForUrl = (slug) =>
	slug
		.split('/')
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join('/');

const readSourcePosts = async () => {
	const files = await listMarkdownFiles(sourceDir);
	const posts = [];

	for (const filePath of files) {
		const raw = await readFile(filePath, 'utf8');
		const { data } = matter(raw);

		if (!isTruthy(data.published)) {
			continue;
		}

		const slug = path.basename(filePath, '.md');
		const title = typeof data.title === 'string' && data.title.trim() !== '' ? data.title : slug;
		const description =
			typeof data.description === 'string' && data.description.trim() !== ''
				? data.description
				: title;

		posts.push({
			description,
			slug,
			title
		});
	}

	return posts;
};

const fetchExistingDiscussionTitles = async () => {
	const titles = new Set();
	let cursor = null;

	do {
		const data = await graphql(
			`
				query ExistingGiscusDiscussions($owner: String!, $name: String!, $cursor: String) {
					repository(owner: $owner, name: $name) {
						discussions(
							first: 100
							after: $cursor
							orderBy: { field: CREATED_AT, direction: DESC }
						) {
							nodes {
								title
							}
							pageInfo {
								hasNextPage
								endCursor
							}
						}
					}
				}
			`,
			{
				cursor,
				name: repoName,
				owner: repoOwner
			}
		);

		const discussions = data.repository.discussions;
		for (const discussion of discussions.nodes) {
			titles.add(discussion.title);
		}

		cursor = discussions.pageInfo.hasNextPage ? discussions.pageInfo.endCursor : null;
	} while (cursor);

	return titles;
};

const buildDiscussionBody = (post) => {
	const canonicalUrl = `${siteUrl}/blog/${encodeSlugForUrl(post.slug)}/`;

	return [
		`Comment thread for "${post.title}".`,
		'',
		post.description,
		'',
		`Canonical URL: ${canonicalUrl}`,
		'',
		`giscus term: post:${post.slug}`
	].join('\n');
};

const createDiscussion = async (post) => {
	const term = `post:${post.slug}`;

	await graphql(
		`
			mutation CreateGiscusDiscussion(
				$repositoryId: ID!
				$categoryId: ID!
				$title: String!
				$body: String!
			) {
				createDiscussion(
					input: {
						repositoryId: $repositoryId
						categoryId: $categoryId
						title: $title
						body: $body
					}
				) {
					discussion {
						id
					}
				}
			}
		`,
		{
			body: buildDiscussionBody(post),
			categoryId,
			repositoryId,
			title: term
		}
	);
};

const posts = await readSourcePosts();
const existingTitles = await fetchExistingDiscussionTitles();
let createdCount = 0;
let skippedCount = 0;

for (const post of posts) {
	const term = `post:${post.slug}`;

	if (existingTitles.has(term)) {
		skippedCount += 1;
		continue;
	}

	await createDiscussion(post);
	existingTitles.add(term);
	createdCount += 1;
	console.log(`Created giscus discussion: ${term}`);
}

console.log(
	`Giscus discussion sync complete. created=${createdCount} skipped=${skippedCount} total=${posts.length}`
);
