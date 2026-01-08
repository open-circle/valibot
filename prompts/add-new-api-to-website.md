# Adding API Documentation to Website

Guide for creating new API reference pages at `website/src/routes/api/`.

## Process Overview

1. Read source code in `/library/src/`
2. Create folder in `/website/src/routes/api/(category)/[name]/`
3. Create `properties.ts` with type definitions
4. Create `index.mdx` with documentation
5. Update `menu.md`
6. Create type documentation if needed (Issue, Schema/Action interfaces)

## File Structure

```
website/src/routes/api/
├── (schemas)/string/
│   ├── index.mdx        # Documentation content
│   └── properties.ts    # Type definitions for Property component
├── (actions)/email/
├── (methods)/parse/
├── (types)/StringSchema/
└── menu.md              # Navigation (alphabetical order)
```

Categories: `(schemas)`, `(actions)`, `(methods)`, `(types)`, `(utils)`, `(async)`, `(storages)`

## Reading Source Code

### What to Extract

From `/library/src/schemas/string/string.ts`:

```typescript
// 1. Issue interface → Document in (types)/StringIssue/
export interface StringIssue extends BaseIssue<unknown> { ... }

// 2. Schema interface → Document in (types)/StringSchema/
export interface StringSchema<TMessage extends ErrorMessage<StringIssue> | undefined>
  extends BaseSchema<string, string, StringIssue> { ... }

// 3. Function overloads → Main documentation
export function string(): StringSchema<undefined>;
export function string<const TMessage>(message: TMessage): StringSchema<TMessage>;

// 4. JSDoc → Description, hints, parameter docs
/**
 * Creates a string schema.
 *
 * Hint: This is an example hint.
 *
 * @param message The error message.
 *
 * @returns A string schema.
 */
```

**JSDoc hints** become blockquotes in the Explanation section:

```mdx
> This is an example hint.
```

### Extract for properties.ts

- Generic parameters and constraints (e.g., `TMessage extends ErrorMessage<...> | undefined`)
- Function parameters and types
- Return type

## properties.ts

Import and define properties matching source code:

```typescript
import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  // Generics (use modifier: 'extends')
  TMessage: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'ErrorMessage',
          href: '../ErrorMessage/',
          generics: [
            { type: 'custom', name: 'StringIssue', href: '../StringIssue/' },
          ],
        },
        'undefined',
      ],
    },
  },

  // Parameters (reference generic or direct type)
  message: {
    type: { type: 'custom', name: 'TMessage' },
  },

  // Return type
  Schema: {
    type: {
      type: 'custom',
      name: 'StringSchema',
      href: '../StringSchema/',
      generics: [{ type: 'custom', name: 'TMessage' }],
    },
  },
};
```

### DefinitionData Types

| Type            | Syntax                                                                         |
| --------------- | ------------------------------------------------------------------------------ |
| Primitive       | `'string'`, `'number'`, `'boolean'`, `'unknown'`, etc.                         |
| Literal string  | `{ type: 'string', value: 'email' }`                                           |
| Literal number  | `{ type: 'number', value: 5 }`                                                 |
| Custom/Named    | `{ type: 'custom', name: 'TypeName', href: '../TypeName/', generics: [...] }`  |
| Custom+modifier | `{ type: 'custom', modifier: 'typeof', name: 'string', href: '../string/' }`   |
| Union           | `{ type: 'union', options: [type1, type2] }`                                   |
| Intersect       | `{ type: 'intersect', options: [type1, type2] }`                               |
| Array           | `{ type: 'array', item: elementType }`                                         |
| Tuple           | `{ type: 'tuple', items: [type1, type2] }`                                     |
| Object          | `{ type: 'object', entries: [{ key: 'name', optional?: true, value: type }] }` |
| Function        | `{ type: 'function', params: [{ name: 'x', type: t }], return: retType }`      |
| Template        | `{ type: 'template', parts: [{ type: 'string', value: '>=' }, otherType] }`    |

## index.mdx Template

```mdx
---
title: functionName
description: One-line description from JSDoc.
source: /schemas/string/string.ts
contributors:
  - github-username
---

import { ApiList, Property } from '~/components';
import { properties } from './properties';

# functionName

Creates a string schema.

\`\`\`ts
const Schema = v.functionName<TMessage>(message);
\`\`\`

## Generics

- \`TMessage\` <Property {...properties.TMessage} />

## Parameters

- \`message\` <Property {...properties.message} />

### Explanation

With \`functionName\` you can validate... If the input does not match, you can use \`message\` to customize the error message.

## Returns

- \`Schema\` <Property {...properties.Schema} />

## Examples

The following examples show how \`functionName\` can be used.

### Email schema

Schema to validate an email.

\`\`\`ts
const EmailSchema = v.pipe(
v.string(),
v.nonEmpty('Please enter your email.'),
v.email('The email is badly formatted.')
);
\`\`\`

## Related

The following APIs can be combined with \`functionName\`.

### Schemas

<ApiList items={['array', 'object', 'string']} />

### Methods

<ApiList items={['parse', 'pipe', 'safeParse']} />

### Actions

<ApiList items={['email', 'minLength']} />

### Utils

<ApiList items={['isOfKind', 'isOfType']} />
```

**Related section order:** Schemas → Methods → Actions → Utils (omit empty sections)

## Key Conventions

### Naming

- Schema variables: `PascalCase` + `Schema` suffix: `EmailSchema`, `UserSchema`
- Action variables: `PascalCase` + `Action`: `MinLengthAction`
- Parse output: `output` or descriptive name

### Examples

- Always include error messages for validation actions
- Progress from simple to complex
- Use realistic, practical scenarios
- Start with `import * as v from 'valibot';` pattern

### Error Messages

Use friendly, actionable messages:

- ✅ "Your password is too short."
- ✅ "Please enter your email."
- ❌ "Invalid" or "Error"

### Links

- Use `href: '../TypeName/'` for type references (with trailing slash)
- Use `<Link href="/api/parse/">\`parse\`</Link>`in MDX prose (import from`~/components`)
- Link to related guides when relevant: `<Link href="/guides/objects/">object guide</Link>`

## Update Related Files

### menu.md

Add alphabetically to `/website/src/routes/api/menu.md`:

```markdown
## Schemas

- [any](/api/any/)
- [newSchema](/api/newSchema/) ← Add here
- [string](/api/string/)
```

### Related Sections of Other API Docs

Existing API pages have a `## Related` section with `<ApiList>` components. When adding a new API, update related APIs to include the new one.

**Rule:** An API is "related" if:

- It makes sense to use it as an argument of the other API, or vice versa
- It make sense to use them together in the same `pipe` (e.g., `v.pipe(v.string(), v.email())` → `string` and `email` are related)

Examples:

- `string` schema lists `email` action because they work together in a pipe
- `email` action lists `string` schema because it validates string input
- `pipe` method lists all schemas because any schema can be piped
- `minLength` action lists `string`, `array`, `tuple` because it validates their length

**Process:**

1. Review a few existing API docs in the same category to understand the pattern
2. Check `menu.md` to identify potentially related APIs
3. For each related API, edit its `index.mdx` and add the new API to the appropriate `<ApiList>`

### Concept Guides

Add the new API to the appropriate guide in `/website/src/routes/guides/`:

| API Category | Guide to Update                       |
| ------------ | ------------------------------------- |
| Schema       | `(main-concepts)/schemas/index.mdx`   |
| Action       | `(main-concepts)/pipelines/index.mdx` |
| Method       | `(main-concepts)/methods/index.mdx`   |

Also update topic-specific guides if relevant (e.g., `(schemas)/objects/`, `(schemas)/arrays/`, `(advanced)/async/`).

### Type Documentation

Create pages for new types in `(types)/`:

- Issue interfaces (e.g., `StringIssue`)
- Schema/Action interfaces (e.g., `StringSchema`)

Type pages differ from function docs:

- **No `source` field** in frontmatter
- **No Examples or Related sections**
- Use `## Definition` instead of `## Returns`

Type page structure:

```mdx
---
title: StringSchema
description: String schema interface.
contributors:
  - github-username
---

import { Property } from '~/components';
import { properties } from './properties';

# StringSchema

String schema interface.

## Generics

- \`TMessage\` <Property {...properties.TMessage} />

## Definition

- \`StringSchema\` <Property {...properties.BaseSchema} />
  - \`type\` <Property {...properties.type} />
  - \`reference\` <Property {...properties.reference} />
  - \`expects\` <Property {...properties.expects} />
  - \`message\` <Property {...properties.message} />
```

## Checklist

- [ ] Read source file completely
- [ ] `properties.ts` matches source types exactly
- [ ] `index.mdx` signature matches source
- [ ] All generics documented
- [ ] All parameters documented
- [ ] Examples are realistic with error messages
- [ ] `menu.md` updated (alphabetically)
- [ ] Related type pages created if needed
- [ ] Related API docs updated (add new API to their `## Related` sections)
- [ ] Concept guide updated (schemas/pipelines/methods)
- [ ] All `href` links valid with trailing slashes
