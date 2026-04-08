type CategorySummary = {
	name: string;
	count: number;
};

const postFiles = import.meta.glob('/src/content/posts/*.md', {
	eager: true,
	import: 'default',
	query: '?raw'
}) as Record<string, string>;

const readFrontmatterField = (source: string, field: string) => {
	const match = source.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
	return match?.[1]?.trim() ?? null;
};

const isPublished = (source: string) => readFrontmatterField(source, 'published') !== 'false';

const categoryCounts = new Map<string, number>();

for (const source of Object.values(postFiles)) {
	if (!isPublished(source)) {
		continue;
	}

	const category = readFrontmatterField(source, 'category') || 'Notes';
	categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
}

export const searchCategories: CategorySummary[] = Array.from(categoryCounts.entries())
	.map(([name, count]) => ({ name, count }))
	.sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
