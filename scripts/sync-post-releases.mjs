import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourceDir = path.join(projectRoot, 'src/content/posts');
const translationDir = path.join(projectRoot, 'src/content/translations/en/posts');
const siteConfigPath = path.join(projectRoot, 'src/content/site.json');
const githubApiBaseUrl = 'https://api.github.com';

const repoFullName = process.env.GITHUB_REPOSITORY?.trim() ?? '';
const githubToken = process.env.GITHUB_TOKEN?.trim() ?? '';
const targetCommitish = process.env.GITHUB_SHA?.trim() ?? 'main';
const changedPostFiles = (process.env.CHANGED_POST_FILES ?? '')
	.split(/\r?\n/)
	.map((value) => value.trim())
	.filter(Boolean);
const releaseUseTranslations = /^(1|true|yes|on)$/i.test(
	process.env.RELEASE_USE_TRANSLATIONS?.trim() ?? ''
);

if (repoFullName === '' || githubToken === '') {
	throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required to sync post releases.');
}

const readJsonFile = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'));

const siteConfig = await readJsonFile(siteConfigPath);
const siteUrl = typeof siteConfig.url === 'string' ? siteConfig.url.trim().replace(/\/+$/, '') : '';

const toAbsolutePath = (filePath) =>
	path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);

const isTruthy = (value) => value !== false;

const readPostDocument = async (filePath, localeFallback) => {
	const raw = await readFile(filePath, 'utf8');
	const { data, content } = matter(raw);
	const title = typeof data.title === 'string' ? data.title.trim() : '';
	const description = typeof data.description === 'string' ? data.description.trim() : '';
	const date = typeof data.date === 'string' ? data.date.trim() : String(data.date ?? '').trim();
	const category =
		typeof data.category === 'string' && data.category.trim() !== '' ? data.category : 'Notes';
	const locale = data.locale === 'en' ? 'en' : localeFallback;

	if (title === '' || description === '' || date === '') {
		throw new Error(`Missing required frontmatter in ${path.relative(projectRoot, filePath)}`);
	}

	return {
		filePath,
		slug: path.basename(filePath, '.md'),
		title,
		description,
		date,
		category,
		content: content.trim(),
		locale,
		published: isTruthy(data.published),
		sourcePath: typeof data.sourcePath === 'string' ? data.sourcePath : null
	};
};

const buildSiteUrl = (pathname) => {
	if (siteUrl === '') {
		return null;
	}

	return `${siteUrl}/${pathname.replace(/^\/+/, '')}`;
};

const buildReleaseBody = (post) => {
	const postUrl = buildSiteUrl(
		post.locale === 'en' ? `/en/blog/${post.slug}` : `/blog/${post.slug}`
	);
	const originalUrl = buildSiteUrl(`/blog/${post.slug}`);
	const translatedUrl = buildSiteUrl(`/en/blog/${post.slug}`);
	const lines = [
		post.description,
		'',
		`- Date: ${post.date}`,
		`- Category: ${post.category}`,
		`- Locale: ${post.locale}`
	];

	if (postUrl) {
		lines.push(`- Published URL: ${postUrl}`);
	}

	if (post.locale === 'en' && originalUrl) {
		lines.push(`- Original URL: ${originalUrl}`);
	}

	if (post.locale === 'ko' && translatedUrl) {
		lines.push(`- English URL: ${translatedUrl}`);
	}

	lines.push('', '---');

	if (post.content !== '') {
		lines.push('', post.content);
	}

	return lines.join('\n');
};

const requestGitHub = async (pathname, init = {}) => {
	const response = await fetch(`${githubApiBaseUrl}${pathname}`, {
		...init,
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${githubToken}`,
			'Content-Type': 'application/json',
			'User-Agent': 'post-release-sync',
			...init.headers
		}
	});

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		throw new Error(`GitHub API request failed (${response.status}): ${await response.text()}`);
	}

	if (response.status === 204) {
		return null;
	}

	return response.json();
};

const upsertRelease = async (post) => {
	const tagName = `post-${post.slug}`;
	const releasePayload = {
		tag_name: tagName,
		target_commitish: targetCommitish,
		name: post.title,
		body: buildReleaseBody(post),
		draft: !post.published,
		prerelease: false
	};
	const existingRelease = await requestGitHub(
		`/repos/${repoFullName}/releases/tags/${encodeURIComponent(tagName)}`
	);

	if (!existingRelease) {
		await requestGitHub(`/repos/${repoFullName}/releases`, {
			method: 'POST',
			body: JSON.stringify(releasePayload)
		});
		console.log(`Created release ${tagName} from ${path.relative(projectRoot, post.filePath)}`);
		return;
	}

	await requestGitHub(`/repos/${repoFullName}/releases/${existingRelease.id}`, {
		method: 'PATCH',
		body: JSON.stringify(releasePayload)
	});
	console.log(`Updated release ${tagName} from ${path.relative(projectRoot, post.filePath)}`);
};

if (changedPostFiles.length === 0) {
	console.log('No changed source posts found. Skipping release sync.');
	process.exit(0);
}

const syncedSlugs = new Set();

for (const changedFile of changedPostFiles) {
	const sourceFile = toAbsolutePath(changedFile);
	const slug = path.basename(sourceFile, '.md');

	if (syncedSlugs.has(slug)) {
		continue;
	}

	syncedSlugs.add(slug);

	const translationFile = path.join(translationDir, `${slug}.md`);
	const releaseSourceFile =
		releaseUseTranslations && (await Bun.file(translationFile).exists())
			? translationFile
			: sourceFile;
	const releaseSourceLocale = releaseSourceFile === translationFile ? 'en' : 'ko';
	const post = await readPostDocument(releaseSourceFile, releaseSourceLocale);

	await upsertRelease(post);
}
