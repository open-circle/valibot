# Guide: Adding a New Documentation Guide

This document provides instructions for AI agents on how to add a new documentation guide to the Valibot website.

## Prerequisites

Before adding a new guide:

1. Read the `menu.md` file at `website/src/routes/guides/menu.md` to understand the current structure
2. Understand which category the new guide belongs to (Get started, Main concepts, Schemas, Advanced, Migration, or a new category)
3. Review similar existing guides to understand the style and structure

## Directory Structure

Guides are organized under `website/src/routes/guides/` with the following structure:

```
website/src/routes/guides/
├── menu.md                           # Navigation menu definition
├── layout.tsx                        # Layout wrapper for all guides
├── index.tsx                         # Root redirect
├── (category-name)/                  # Route group folder (with parentheses)
│   └── guide-name/                   # Individual guide folder
│       └── index.mdx                 # Guide content (MDX format)
│       └── [additional-assets]       # Optional: images, etc.
```

**Important**: Category folders use Qwik's route grouping syntax with parentheses, e.g., `(get-started)`, `(main-concepts)`, `(schemas)`, `(advanced)`, `(migration)`.

## Step-by-Step Process

### 1. Choose the Category

Determine which category the guide belongs to:

- **(get-started)**: Introductory content for new users
- **(main-concepts)**: Core concepts of the library
- **(schemas)**: Specific schema types and their usage
- **(advanced)**: Advanced features and techniques
- **(migration)**: Migration guides between versions or from other libraries

If none fit, you may need to create a new category folder.

### 2. Create the Guide Directory

Create a new folder structure:

```
website/src/routes/guides/(category-name)/guide-slug/
```

Where:

- `category-name` is an existing category or new category (with parentheses)
- `guide-slug` is a kebab-case URL-friendly name for the guide

### 3. Create the MDX File

Create an `index.mdx` file in the guide directory with the following structure:

````mdx
---
title: Guide Title
description: >-
  A concise description of what this guide covers. Can span multiple lines.
  Use the `>-` syntax for multi-line descriptions.
contributors:
  - github-username
---

import { Link } from '~/components';

# Guide Title

Opening paragraph that introduces the topic and explains what the reader will learn.

## Section Heading

Content explaining the topic. Use clear, concise language.

### Subsection Heading

More detailed content.

```ts
// Code example ...
```

## Another Section

Continue with additional sections as needed.
````

#### Frontmatter Requirements

The frontmatter (between `---` markers) must include:

- **title**: The guide title (appears in navigation and page header)
- **description**: A brief description (for SEO and previews, use `>-` for multi-line)
- **contributors**: Array of GitHub usernames (use a placeholder if unknown)

### 4. Content Guidelines

Follow these guidelines when writing content:

#### Imports

- Always import `Link` from `~/components` for internal links
- Import other components as needed (e.g., `ApiList` from `~/components`)

#### Internal Links

Use the `Link` component for linking to other documentation:

```mdx
<Link href="/guides/schemas/">schemas guide</Link>
<Link href="/api/pipe/">`pipe`</Link>
```

#### Code Blocks

- Use TypeScript (`ts`) for code examples
- Always import valibot as `import * as v from 'valibot';`
- Include comments to explain complex code
- Use proper syntax highlighting with triple backticks

#### Formatting

- Use **bold** for emphasis
- Use `inline code` for API names, variables, file names
- Use proper heading hierarchy (h1 for title, h2 for sections, h3 for subsections)
- Keep paragraphs concise and focused

#### Structure

- Start with an introduction explaining the topic
- Break content into logical sections with clear headings
- Include practical examples throughout
- Consider adding subsections for variations or special cases
- End with related links or next steps when appropriate

#### Special Components

You may use special documentation components:

```mdx
<ApiList label="Description" items={['apiName1', 'apiName2']} />
```

### 5. Add Assets (Optional)

If your guide needs images or other assets:

- Place them in the same directory as `index.mdx`
- Use descriptive filenames (e.g., `mental-model-light.jpg`)
- Consider light/dark theme variants if applicable
- Reference them in the MDX file:

```mdx
![Alt text](./image-name.jpg)
```

### 6. Update the Menu

Add an entry to `website/src/routes/guides/menu.md`:

```markdown
## Category Name

- [Existing Guide](/guides/existing/)
- [New Guide Title](/guides/guide-slug/)
```

Important:

- Add the new guide in the appropriate category section
- Use the correct URL path (must match the folder structure)
- Maintain alphabetical or logical ordering within the category
- If creating a new category, add a new `## Category Name` heading

### 7. Alternative: Redirect Files

If you need to create a redirect (e.g., when a guide is moved or renamed):

Create an `index.tsx` file instead of `index.mdx`:

```tsx
import { component$ } from '@qwik.dev/core';
import { routeLoader$ } from '@qwik.dev/router';

export const useRedirect = routeLoader$(({ redirect }) => {
  throw redirect(302, '/guides/new-location/');
});

export default component$(() => {
  useRedirect();
  return null;
});
```

## Verification Checklist

Before submitting, verify:

- [ ] Directory structure follows the pattern: `(category-name)/guide-slug/index.mdx`
- [ ] Frontmatter includes title, description, and contributors
- [ ] All internal links use the `Link` component
- [ ] Code examples follow the valibot conventions
- [ ] Guide is added to `menu.md` in the correct category
- [ ] Content is clear, concise, and follows existing guide patterns
- [ ] TypeScript code examples are properly typed
- [ ] No spelling or grammatical errors

## Common Patterns

### Linking to API Documentation

```mdx
<Link href="/api/string/">`string`</Link>
<Link href="/api/pipe/">`pipe`</Link>
```

### Code Examples with Explanations

`````mdx
The following example shows how to validate an object:

````ts
import * as v from 'valibot';

const Schema = v.object({
  name: v.string(),
  age: v.number(),
});
\```

This schema validates objects with `name` and `age` properties.
````
`````

`````

### Multiple Code Variations

When showing alternatives, use clear headings:

````mdx
### Basic usage

\```ts
const Schema = v.string();
\```

### With pipeline

\```ts
const Schema = v.pipe(v.string(), v.email());
\```
`````

## Examples from Existing Guides

### Simple Guide Structure

See `(get-started)/quick-start/index.mdx`:

- Clear introduction
- Basic concept section
- Progressive complexity
- Usage examples
- Links to related content

### Complex Guide Structure

See `(schemas)/objects/index.mdx`:

- Multiple related concepts
- Subsections for variations
- Pipeline validation examples
- Special cases section

### Migration Guide Structure

See `(migration)/migrate-to-v0.31.0/index.mdx`:

- Clear version information
- Automatic upgrade options
- Step-by-step manual migration
- Comparison tables
- Special cases section

## Tips for AI Agents

1. **Read existing guides first**: Always examine 2-3 similar guides to understand the style
2. **Follow conventions**: Use the established patterns for imports, links, and code examples
3. **Be consistent**: Match the tone and structure of existing documentation
4. **Keep it focused**: Each guide should cover one main topic thoroughly
5. **Use examples**: Include practical, runnable code examples
6. **Cross-reference**: Link to related guides and API documentation
7. **Consider the audience**: Write for users at the appropriate skill level for the category
8. **Test links**: Ensure all internal links point to valid routes

## Notes

- The website uses Qwik framework with file-based routing
- Route groups (folders with parentheses) don't affect the URL structure
- MDX files support JSX components alongside Markdown
- The `layout.tsx` file provides consistent styling for all guides
- The `menu.md` file is used to generate the navigation sidebar
