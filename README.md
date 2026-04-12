# Elixir Evo Journal

SvelteKit 기반 정적 블로그 템플릿입니다. `@sveltejs/adapter-static`으로 전체 사이트를 prerender하고, GitHub Pages에 GitHub Actions로 배포하며, Pages CMS에서 Markdown 콘텐츠를 편집할 수 있게 구성되어 있습니다.

## Stack

- SvelteKit + `@sveltejs/adapter-static`
- GitHub Pages deployment via `.github/workflows/deploy.yml`
- Pages CMS via root `.pages.yml`
- Markdown posts in `src/content/posts`
- DeepL translation sync into `src/content/translations/<locale>/posts`

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

등록된 번역 언어 파일까지 로컬에서 갱신하려면 DeepL API 키를 넣고 아래 명령을 실행합니다.

```sh
DEEPL_API_KEY=your-key bun run translate:posts
```

## Content structure

- `src/content/site.json`: 사이트 제목, 설명, URL 같은 메타 정보
- `src/content/posts/*.md`: frontmatter + Markdown 본문
- `src/content/translations/<locale>/posts/*.md`: DeepL이 생성하고 커밋하는 언어별 번역본
- `static/uploads`: CMS 업로드 이미지

## Search

- `/search`: Pagefind 기반 전체 검색 페이지
- `/<locale>/search`: 등록된 번역 언어별 검색 페이지
- 게시글 상세 페이지의 제목, 설명, 본문이 검색 인덱스에 포함됩니다.
- 카테고리와 로케일은 Pagefind filter로 노출됩니다.

## GitHub Pages setup

1. 저장소를 GitHub에 푸시합니다.
2. GitHub 저장소의 `Settings > Pages`에서 `Source`를 `GitHub Actions`로 설정합니다.
3. 기본 브랜치가 `main`인지 확인합니다.
4. `src/content/site.json`의 `url`을 실제 배포 URL로 바꿉니다.
5. 저장소 `Secrets and variables > Actions`에 `DEEPL_API_KEY`를 추가합니다.
6. DeepL Free를 쓰면 선택적으로 `DEEPL_API_URL=https://api-free.deepl.com`도 추가합니다.
7. 공개 설정 파일 [`.env.production`](/Users/elixir/dev/project/elixirevo/blog/.env.production)에 원문/번역 언어와 릴리즈 언어를 등록합니다.

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

현재 CMS 설정은 아래 운영 규칙을 포함합니다.

- 새 글 파일명: `YYYY-MM-DD-title.md`
- 업로드 파일명: safe slug로 정규화
- 카테고리: `Categories` 컬렉션에서 먼저 생성한 뒤 게시글에서 선택
- 발행일: 초 단위까지 포함한 datetime 입력
- 글 목록: 최신 `date` 기준으로 기본 정렬

## Translation workflow

1. Pages CMS에서 원문을 `src/content/posts/*.md`에 저장합니다.
2. GitHub Actions가 `bun run translate:posts`를 실행합니다.
3. `.env.production`의 `PUBLIC_TRANSLATION_LOCALES`에 등록된 각 언어별로 번역본이 없거나 원문 해시가 바뀌었거나 번역 스키마 버전이 달라진 경우에만 DeepL을 호출합니다.
4. 본문 Markdown은 구조화 XML로 변환해 `tag_handling=xml`, `tag_handling_version=v2`, `ignore_tags` 기반으로 번역하므로 헤딩, 리스트, 코드블록 보존이 더 안정적입니다.
5. frontmatter `date`는 DeepL에 보내지지 않고 원문 값을 그대로 복사하므로 게시 시각까지 유지됩니다.
6. DeepL 요청에는 마크다운 구조와 frontmatter 의미를 보존하라는 custom instruction도 포함됩니다.
7. 생성된 번역 파일은 `src/content/translations/<locale>/posts/*.md`에 커밋됩니다.
8. 같은 워크플로에서 정적 빌드와 Pagefind 인덱싱이 이어서 실행됩니다.

번역 언어는 공개 env로 관리합니다. 아래 예시는 한국어 원문을 영어, 중국어 간체, 일본어, 아랍어로 번역합니다.

```sh
PUBLIC_SOURCE_LOCALE=ko
PUBLIC_TRANSLATION_LOCALES=en,zh,ja,ar
PUBLIC_RELEASE_LOCALE=en
PUBLIC_RELEASE_USE_TRANSLATIONS=true
```

DeepL 언어 코드는 기본 매핑을 사용합니다. 필요하면 `DEEPL_SOURCE_LANG_<LOCALE>` 또는 `DEEPL_TARGET_LANG_<LOCALE>` 환경변수로 특정 언어만 덮어쓸 수 있습니다. DeepL `custom_instructions`는 일부 target 언어에서만 지원되므로, 아랍어처럼 미지원 언어는 해당 옵션을 빼고 번역합니다.

## Release workflow

- `main`에 반영된 포스트 파일마다 GitHub 태그 규칙에 맞게 정규화한 `post-...` 태그로 GitHub Release가 생성되거나 갱신됩니다. 공백, `.`, 한글처럼 태그에 바로 쓸 수 없는 문자가 있으면 안전한 slug와 짧은 해시 조합으로 바뀝니다.
- 기본값은 원문을 Release 본문으로 사용합니다.
- 공개 env 값 `PUBLIC_RELEASE_USE_TRANSLATIONS=true`가 설정되어 있으면 `PUBLIC_RELEASE_LOCALE`에 대응되는 `src/content/translations/<locale>/posts/*.md`가 있을 때 해당 번역본으로 Release 본문과 제목을 갱신합니다.
- 번역본이 없으면 번역 릴리스 모드에서도 자동으로 원문으로 fallback 합니다.

브라우저 첫 접속 시 기본 로케일은 다음 규칙으로 결정됩니다.

- `/` 루트에 처음 접근했을 때만 브라우저 선호 언어 또는 `localStorage.preferredLocale`을 확인합니다.
- 선호 언어가 `PUBLIC_TRANSLATION_LOCALES`에 있으면 `/<locale>/`로 이동하고, 원문 언어이면 루트 경로를 유지합니다.
- 이미 `/en/...`, `/zh/...`처럼 명시적인 언어 경로로 접근한 경우에는 강제로 원문 경로로 바꾸지 않습니다.
- 상단 언어 선택 값을 바꾸면 선택이 `localStorage.preferredLocale`에 저장됩니다.

## Giscus comments setup

포스트 상세 페이지에는 Giscus 댓글 영역이 연결되어 있습니다. 이 프로젝트는 공개 가능한 Giscus 설정을 루트의 `.env.production` 파일로 관리합니다.

- `PUBLIC_GISCUS_REPO`: `owner/repo` 형식의 GitHub 저장소
- `PUBLIC_GISCUS_REPO_ID`: Giscus가 요구하는 저장소 ID
- `PUBLIC_GISCUS_CATEGORY`: 댓글을 저장할 GitHub Discussions 카테고리 이름
- `PUBLIC_GISCUS_CATEGORY_ID`: 해당 카테고리 ID

현재 값은 이미 [`.env.production`](/Users/elixir/dev/project/elixirevo/blog/.env.production)에 들어 있습니다. 이 파일은 공개 설정 전용으로 커밋됩니다.

```sh
.env.production

PUBLIC_GISCUS_REPO=elixirevo/blog-test
PUBLIC_GISCUS_REPO_ID=R_kgDOR9vpNw
PUBLIC_GISCUS_CATEGORY=General
PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDOR9vpN84C6b0s
PUBLIC_SOURCE_LOCALE=ko
PUBLIC_TRANSLATION_LOCALES=en,zh,ja,ar
PUBLIC_RELEASE_LOCALE=en
PUBLIC_RELEASE_USE_TRANSLATIONS=true
```

로컬에서 같은 값을 임시로 덮어쓰고 싶다면 셸 환경변수로 넘길 수도 있습니다.

```sh
PUBLIC_GISCUS_CATEGORY=Announcements \
bun run build
```

설정 절차:

1. 저장소에서 GitHub Discussions를 활성화합니다.
2. [giscus.app](https://giscus.app)에서 저장소와 카테고리를 선택합니다.
3. 생성된 값 중 `repo`, `repoId`, `category`, `categoryId`를 `.env.production`에 복사합니다.

사이트의 다크모드 토글은 Giscus iframe 테마와 자동으로 동기화됩니다.

배포 워크플로는 `post:<slug>`를 giscus `specific` mapping term으로 쓰고, `scripts/sync-giscus-discussions.mjs`로 원문 포스트별 Discussion을 미리 생성합니다. 이렇게 하면 번역 경로(`/en`, `/ja`, `/ar` 등)가 모두 같은 댓글 thread를 공유하고, 첫 댓글/반응 시점에 Discussion이 뒤늦게 생성되어 iframe을 새로고침해야 하는 상황을 피할 수 있습니다.
