import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const postsDir = path.join(projectRoot, 'src/content/posts');
const categoriesDir = path.join(projectRoot, 'src/content/categories');
const pagesConfigPath = path.join(projectRoot, '.pages.yml');
const defaultCategories = ['Archive', 'Essays', 'History', 'Notes', 'Technical'];

const hashFragment = (value) => createHash('sha1').update(value).digest('hex').slice(0, 8);

const slugifyFileName = (value) => {
	const normalized = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
	const safeFragment = normalized
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');

	return safeFragment === '' ? `category-${hashFragment(value)}.md` : `${safeFragment}.md`;
};

const quoteYamlString = (value) => `'${String(value).replaceAll("'", "''")}'`;

const listMarkdownFiles = async (directoryPath) => {
	try {
		const entries = await readdir(directoryPath, { withFileTypes: true });
		return entries
			.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
			.map((entry) => path.join(directoryPath, entry.name))
			.sort((left, right) => left.localeCompare(right));
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
			return [];
		}

		throw error;
	}
};

const readFrontmatter = async (filePath) => {
	const raw = await readFile(filePath, 'utf8');
	return matter(raw).data;
};

const normalizeCategory = (value) => {
	if (typeof value !== 'string') {
		return null;
	}

	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
};

const collectPostCategories = async () => {
	const categories = new Set();
	const postFiles = await listMarkdownFiles(postsDir);

	for (const postFile of postFiles) {
		const frontmatter = await readFrontmatter(postFile);
		const category = normalizeCategory(frontmatter.category);

		if (category) {
			categories.add(category);
		}
	}

	return categories;
};

const collectExistingCategoryFiles = async () => {
	const existingByName = new Map();
	const categoryFiles = await listMarkdownFiles(categoriesDir);

	for (const categoryFile of categoryFiles) {
		const frontmatter = await readFrontmatter(categoryFile);
		const categoryName = normalizeCategory(frontmatter.name);

		if (categoryName) {
			existingByName.set(categoryName, categoryFile);
		}
	}

	return existingByName;
};

const ensureCategoryFiles = async (categoryNames, existingByName) => {
	await mkdir(categoriesDir, { recursive: true });

	const usedFileNames = new Set(
		Array.from(existingByName.values(), (filePath) => path.basename(filePath).toLowerCase())
	);
	let createdCount = 0;

	for (const categoryName of categoryNames) {
		if (existingByName.has(categoryName)) {
			continue;
		}

		const baseFileName = slugifyFileName(categoryName);
		let fileName = baseFileName;

		if (usedFileNames.has(fileName.toLowerCase())) {
			const extension = path.extname(baseFileName);
			const nameWithoutExtension = baseFileName.slice(0, -extension.length);
			fileName = `${nameWithoutExtension}-${hashFragment(categoryName)}${extension}`;
		}

		const filePath = path.join(categoriesDir, fileName);
		const source = `---\nname: ${quoteYamlString(categoryName)}\n---\n`;
		await writeFile(filePath, source, 'utf8');
		existingByName.set(categoryName, filePath);
		usedFileNames.add(fileName.toLowerCase());
		createdCount += 1;
	}

	return createdCount;
};

const syncPagesConfig = async (categoryNames) => {
	const source = await readFile(pagesConfigPath, 'utf8');
	const valuesBlock = categoryNames
		.map((category) => `            - ${quoteYamlString(category)}`)
		.join('\n');
	const categoryFieldBlock = [
		'      - name: category',
		'        label: Category',
		'        type: select',
		'        options:',
		'          values:',
		valuesBlock,
		'          creatable: true',
		'          placeholder: Select or create a category'
	].join('\n');
	const nextSource = source.replace(
		/\n      - name: category[\s\S]*?\n      - name: cover/,
		`\n${categoryFieldBlock}\n      - name: cover`
	);

	if (nextSource === source) {
		return false;
	}

	await writeFile(pagesConfigPath, nextSource, 'utf8');
	return true;
};

const existingByName = await collectExistingCategoryFiles();
const postCategories = await collectPostCategories();
const allCategories = Array.from(
	new Set([...defaultCategories, ...existingByName.keys(), ...postCategories])
).sort((left, right) => left.localeCompare(right, 'en'));

const createdCount = await ensureCategoryFiles(allCategories, existingByName);
const configUpdated = await syncPagesConfig(allCategories);

console.log(
	`Synced categories: total=${allCategories.length} created=${createdCount} configUpdated=${configUpdated ? 1 : 0}`
);
