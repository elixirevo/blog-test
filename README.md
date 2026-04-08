# Elixir Evo Journal

SvelteKit 기반 정적 블로그 템플릿입니다. `@sveltejs/adapter-static`으로 전체 사이트를 prerender하고, GitHub Pages에 GitHub Actions로 배포하며, Pages CMS에서 Markdown 콘텐츠를 편집할 수 있게 구성되어 있습니다.

## Stack

- SvelteKit + `@sveltejs/adapter-static`
- GitHub Pages deployment via `.github/workflows/deploy.yml`
- Pages CMS via root `.pages.yml`
- Markdown posts in `src/content/posts`

## Local development

```sh
bun install
bun run dev
```

`Pagefind` 검색 인덱스는 정적 빌드 후 생성됩니다. 검색 기능까지 확인하려면 아래 흐름을 사용합니다.

```sh
bun run build
bun run preview
```

## Content structure

- `src/content/site.json`: 사이트 제목, 설명, URL 같은 메타 정보
- `src/content/posts/*.md`: frontmatter + Markdown 본문
- `static/uploads`: CMS 업로드 이미지

## Search

- `/search`: Pagefind 기반 전체 검색 페이지
- 게시글 상세 페이지의 제목, 설명, 본문이 검색 인덱스에 포함됩니다.
- 카테고리는 Pagefind filter로 노출됩니다.

## GitHub Pages setup

1. 저장소를 GitHub에 푸시합니다.
2. GitHub 저장소의 `Settings > Pages`에서 `Source`를 `GitHub Actions`로 설정합니다.
3. 기본 브랜치가 `main`인지 확인합니다.
4. `src/content/site.json`의 `url`을 실제 배포 URL로 바꿉니다.

프로젝트 Pages 저장소라면 빌드 시 `GITHUB_REPOSITORY` 값을 읽어 자동으로 base path를 맞춥니다. 사용자/조직 루트 Pages 저장소라면 base path는 빈 문자열로 유지됩니다.

로컬에서도 base path를 강제로 맞춰 보고 싶다면 아래처럼 빌드할 수 있습니다.

```sh
SITE_BASE_PATH=blog bun run build
```

## Pages CMS setup

1. [Pages CMS](https://pagescms.org)에 GitHub 계정으로 로그인합니다.
2. 이 저장소를 선택합니다.
3. 루트 `.pages.yml`을 읽으면 `Posts`, `Site settings` 편집기가 자동으로 생성됩니다.
4. 글을 저장하면 저장소에 커밋되고, `main` 브랜치 푸시 시 GitHub Pages가 다시 배포됩니다.

`workflow_dispatch`가 열려 있으므로 Pages CMS에서 `Deploy GitHub Pages` 액션 버튼으로 수동 배포도 실행할 수 있습니다.

## Giscus comments setup

포스트 상세 페이지에는 Giscus 댓글 영역이 연결되어 있습니다. 실제 댓글을 활성화하려면 아래 값을 `src/content/site.json` 또는 Pages CMS의 `Site settings`에 채워야 합니다.

- `giscusRepo`: `owner/repo` 형식의 GitHub 저장소
- `giscusRepoId`: Giscus가 요구하는 저장소 ID
- `giscusCategory`: 댓글을 저장할 GitHub Discussions 카테고리 이름
- `giscusCategoryId`: 해당 카테고리 ID

설정 절차:

1. 저장소에서 GitHub Discussions를 활성화합니다.
2. [giscus.app](https://giscus.app)에서 저장소와 카테고리를 선택합니다.
3. 생성된 값 중 `repo`, `repoId`, `category`, `categoryId`를 위 필드에 복사합니다.

사이트의 다크모드 토글은 Giscus iframe 테마와 자동으로 동기화됩니다.
