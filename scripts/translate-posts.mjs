import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourceDir = path.join(projectRoot, 'src/content/posts');
const targetDir = path.join(projectRoot, 'src/content/translations/en/posts');

const apiKey = process.env.DEEPL_API_KEY?.trim() ?? '';

const defaultApiUrl = (() => {
	if (process.env.DEEPL_API_URL?.trim()) {
		return process.env.DEEPL_API_URL.trim().replace(/\/+$/, '');
	}

	if (apiKey.endsWith(':fx')) {
		return 'https://api-free.deepl.com';
	}

	return 'https://api.deepl.com';
})();

const translateEndpoint = `${defaultApiUrl}/v2/translate`;
const translationChunkLimit = 20_000;

const hashContent = (value) => createHash('sha256').update(value).digest('hex');

const formatFrontmatterDate = (value) => {
	if (typeof value === 'string') {
		return value.trim();
	}

	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString().slice(0, 10);
	}

	return '';
};

const toPosixPath = (value) => value.split(path.sep).join('/');

const normalizeEnglishTitle = (value) =>
	value.replace(/^([^\p{Letter}]*)(\p{Letter}+)/u, (match, prefix, word) => {
		if (word !== word.toLowerCase() || word === word.toUpperCase()) {
			return match;
		}

		const [firstChar, ...restChars] = Array.from(word);
		return `${prefix}${firstChar?.toUpperCase() ?? ''}${restChars.join('')}`;
	});

const listMarkdownFiles = async (dir) => {
	try {
		const entries = await readdir(dir, { withFileTypes: true });
		return entries
			.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
			.map((entry) => path.join(dir, entry.name))
			.sort((left, right) => left.localeCompare(right));
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
			return [];
		}

		throw error;
	}
};

const inferTranslationState = async (targetFile) => {
	try {
		const raw = await readFile(targetFile, 'utf8');
		const { data } = matter(raw);
		return {
			exists: true,
			sourceHash: typeof data.sourceHash === 'string' ? data.sourceHash : null
		};
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
			return {
				exists: false,
				sourceHash: null
			};
		}

		throw error;
	}
};

const normalizeStoredTranslationTitle = async (targetFile) => {
	const raw = await readFile(targetFile, 'utf8');
	const { data, content } = matter(raw);

	if (typeof data.title !== 'string' || data.title === '') {
		return false;
	}

	const normalizedTitle = normalizeEnglishTitle(data.title);
	if (normalizedTitle === data.title) {
		return false;
	}

	data.title = normalizedTitle;
	await writeFile(targetFile, matter.stringify(content, data), 'utf8');
	return true;
};

const splitMarkdownForTranslation = (content) => {
	const parts = content.split(/(\n{2,})/);
	const chunks = [];
	let current = '';

	for (const part of parts) {
		if (part.length > translationChunkLimit) {
			if (current !== '') {
				chunks.push(current);
				current = '';
			}

			for (let index = 0; index < part.length; index += translationChunkLimit) {
				chunks.push(part.slice(index, index + translationChunkLimit));
			}

			continue;
		}

		if (current.length + part.length > translationChunkLimit && current !== '') {
			chunks.push(current);
			current = part;
			continue;
		}

		current += part;
	}

	if (current !== '') {
		chunks.push(current);
	}

	return chunks.length > 0 ? chunks : [''];
};

const protectMarkdown = (content) => {
	let tokenIndex = 0;
	const replacements = [];

	const createToken = (value) => {
		const token = `ZXQPL_KEEP_${String(tokenIndex).padStart(4, '0')}_ZXQPL`;
		tokenIndex += 1;
		replacements.push([token, value]);
		return token;
	};

	let nextContent = content;

	nextContent = nextContent.replace(/```[\s\S]*?```/g, (match) => createToken(match));
	nextContent = nextContent.replace(/`[^`\n]+`/g, (match) => createToken(match));
	nextContent = nextContent.replace(/<!--[\s\S]*?-->/g, (match) => createToken(match));
	nextContent = nextContent.replace(
		/(!?\[[^\]]*]\()([^)]+)(\))/g,
		(_, prefix, destination, suffix) => `${prefix}${createToken(destination)}${suffix}`
	);
	nextContent = nextContent.replace(/^\[[^\]]+]:\s+\S+.*$/gm, (match) => createToken(match));
	nextContent = nextContent.replace(/https?:\/\/[^\s)]+/g, (match) => createToken(match));

	return {
		text: nextContent,
		restore: (translated) =>
			replacements.reduce(
				(current, [token, original]) => current.replaceAll(token, original),
				translated
			)
	};
};

const translateTexts = async (texts) => {
	const response = await fetch(translateEndpoint, {
		method: 'POST',
		headers: {
			Authorization: `DeepL-Auth-Key ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			source_lang: 'KO',
			target_lang: 'EN-US',
			preserve_formatting: true,
			text: texts
		})
	});

	if (!response.ok) {
		throw new Error(`DeepL request failed (${response.status}): ${await response.text()}`);
	}

	const payload = await response.json();

	if (!Array.isArray(payload.translations)) {
		throw new Error('DeepL response did not include a translations array');
	}

	return payload.translations.map((entry) => entry.text);
};

const translatePost = async (sourceFile, sourceRaw, sourceHash) => {
	const { data, content } = matter(sourceRaw);
	const title = typeof data.title === 'string' ? data.title.trim() : '';
	const description = typeof data.description === 'string' ? data.description.trim() : '';
	const date = formatFrontmatterDate(data.date);

	if (title === '' || description === '' || date === '') {
		throw new Error(
			`Missing required frontmatter in ${toPosixPath(path.relative(projectRoot, sourceFile))}`
		);
	}

	const bodyChunks = splitMarkdownForTranslation(content);
	const protectedChunks = bodyChunks.map((chunk) => protectMarkdown(chunk));
	const translated = await translateTexts([
		title,
		description,
		...protectedChunks.map((chunk) => chunk.text)
	]);

	const translatedBody = protectedChunks
		.map((chunk, index) => chunk.restore(translated[index + 2] ?? ''))
		.join('');

	const nextData = {
		title: normalizeEnglishTitle(translated[0] ?? ''),
		description: translated[1],
		date,
		published: data.published !== false,
		category:
			typeof data.category === 'string' && data.category.trim() !== '' ? data.category : 'Notes',
		locale: 'en',
		sourcePath: toPosixPath(path.relative(projectRoot, sourceFile)),
		sourceHash,
		translationSource: 'deepl',
		translatedAt: new Date().toISOString()
	};

	if (typeof data.cover === 'string' && data.cover.trim() !== '') {
		nextData.cover = data.cover;
	}

	return matter.stringify(translatedBody, nextData);
};

await mkdir(targetDir, { recursive: true });

const sourceFiles = await listMarkdownFiles(sourceDir);
const targetFiles = await listMarkdownFiles(targetDir);
const sourceByName = new Map(sourceFiles.map((file) => [path.basename(file), file]));

let removedCount = 0;
for (const targetFile of targetFiles) {
	if (sourceByName.has(path.basename(targetFile))) {
		continue;
	}

	await rm(targetFile);
	removedCount += 1;
	console.log(`Removed orphan translation: ${toPosixPath(path.relative(projectRoot, targetFile))}`);
}

const pending = [];
let skippedCount = 0;

for (const sourceFile of sourceFiles) {
	const sourceRaw = await readFile(sourceFile, 'utf8');
	const sourceHash = hashContent(sourceRaw);
	const targetFile = path.join(targetDir, path.basename(sourceFile));
	const targetState = await inferTranslationState(targetFile);

	if (targetState.sourceHash === sourceHash) {
		skippedCount += 1;
		continue;
	}

	pending.push({
		sourceFile,
		sourceRaw,
		sourceHash,
		targetFile,
		needsUpdate: targetState.exists
	});
}

if (pending.length > 0 && apiKey === '') {
	throw new Error(
		'DEEPL_API_KEY is missing. Add the repository secret before deploying new or changed Korean posts.'
	);
}

let translatedCount = 0;
for (const job of pending) {
	const translatedPost = await translatePost(job.sourceFile, job.sourceRaw, job.sourceHash);
	await writeFile(job.targetFile, translatedPost, 'utf8');
	translatedCount += 1;
	console.log(
		`${job.needsUpdate ? 'Updated' : 'Created'} translation: ${toPosixPath(
			path.relative(projectRoot, job.targetFile)
		)}`
	);
}

const currentTargetFiles = await listMarkdownFiles(targetDir);
let normalizedCount = 0;

for (const targetFile of currentTargetFiles) {
	if (!(await normalizeStoredTranslationTitle(targetFile))) {
		continue;
	}

	normalizedCount += 1;
	console.log(`Normalized title casing: ${toPosixPath(path.relative(projectRoot, targetFile))}`);
}

console.log(
	`DeepL sync complete. created_or_updated=${translatedCount} skipped=${skippedCount} normalized=${normalizedCount} removed=${removedCount}`
);
