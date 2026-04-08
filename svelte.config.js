import adapter from '@sveltejs/adapter-static';

const normalizeBase = (value) => {
	if (!value || value === '/') {
		return '';
	}

	return `/${value.replace(/^\/+|\/+$/g, '')}`;
};

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER ?? '';
const isProjectPages =
	repoName !== '' &&
	repoOwner !== '' &&
	repoName.toLowerCase() !== `${repoOwner.toLowerCase()}.github.io`;

const defaultBase =
	process.env.GITHUB_ACTIONS === 'true' && isProjectPages ? normalizeBase(repoName) : '';

const base = normalizeBase(process.env.SITE_BASE_PATH ?? defaultBase);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build'
		}),
		paths: {
			base
		}
	}
};

export default config;
