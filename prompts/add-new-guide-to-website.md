# Adding Guides to Website

Guide for creating conceptual documentation at `website/src/routes/guides/`.

## Directory Structure

```
website/src/routes/guides/
├── menu.md                    # Navigation menu
├── (get-started)/             # Intro, installation, quick start
├── (main-concepts)/           # Schemas, pipelines, parsing
├── (schemas)/                 # Objects, arrays, unions
├── (advanced)/                # Async, i18n, JSON Schema
├── (migration)/               # Version upgrades, Zod migration
└── (category)/guide-slug/
    └── index.mdx              # Guide content
```

Note: Category folders use parentheses (Qwik route grouping).

## Process

1. Review 2-3 existing guides in the target category to understand style
2. Choose category from existing or create new
3. Create folder: `(category)/guide-slug/`
4. Create `index.mdx` with content
5. Update `menu.md`

## index.mdx Template

```mdx
---
title: Guide Title
description: >-
  A concise description of what this guide covers.
contributors:
  - github-username
---

import { ApiList, Link } from '~/components';

# Guide Title

Opening paragraph explaining what the reader will learn.

## Section Heading

Content with clear, concise language.

\`\`\`ts
import \* as v from 'valibot';

const Schema = v.object({
name: v.string(),
email: v.pipe(v.string(), v.email()),
});
\`\`\`

## Another Section

Continue with additional sections as needed.

Use <Link href="/api/pipe/">\`pipe\`</Link> for internal links.
```

## Frontmatter

Required fields:

- **title**: Page title and navigation label
- **description**: SEO description (use `>-` for multi-line)
- **contributors**: Array of GitHub usernames

## Content Guidelines

### Code Examples

- Use TypeScript (`ts` language)
- Import as `import * as v from 'valibot';`
- Include comments for complex code

### Links

Internal links use the `Link` component:

```mdx
<Link href="/guides/schemas/">schemas guide</Link>
<Link href="/api/pipe/">\`pipe\`</Link>
```

### Components

```mdx
<ApiList label="Related schemas" items={['object', 'array', 'string']} />
```

### Formatting

- `inline code` for API names, variables, file names
- **bold** for emphasis
- Proper heading hierarchy (h1 title, h2 sections, h3 subsections)

### Images

Place images in the same folder as `index.mdx`:

```mdx
![Alt text](./diagram-light.jpg)
```

Consider light/dark theme variants if applicable (e.g., `diagram-light.jpg`, `diagram-dark.jpg`).

## Update menu.md

Add to `/website/src/routes/guides/menu.md`:

```markdown
## Category Name

- [Existing Guide](/guides/existing/)
- [New Guide Title](/guides/guide-slug/)
```

Maintain logical ordering within categories.

## Checklist

- [ ] Reviewed existing guides in the same category
- [ ] Folder structure: `(category)/guide-slug/index.mdx`
- [ ] Frontmatter: title, description, contributors
- [ ] Internal links use `Link` component
- [ ] Code examples use `import * as v from 'valibot';`
- [ ] Added to `menu.md`
- [ ] Style matches existing guides
