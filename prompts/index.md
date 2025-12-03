# Valibot AI Agent Prompt Index

This index lists all available prompt guides for AI agents working with the Valibot repository. Reference this file first to determine which guides are relevant for your task.

---

## Repository & Structure Guides

### [`repository-structure.md`](./repository-structure.md)

**Use when:** You need to understand the repository structure, navigate the monorepo, or locate specific code

**Contains:**

- Complete repository structure overview (monorepo with library, packages, codemod, website)
- Core library architecture (schemas, actions, methods, utilities)
- Package descriptions (i18n, to-json-schema)
- Common development tasks (adding schemas/actions, running tests, building)
- Code pattern guidelines and best practices
- Directory navigation for tests, documentation, and configuration

---

## Source Code Documentation Guides

### [`document-source-code.md`](./document-source-code.md)

**Use when:** Writing, reviewing, or fixing JSDoc and inline comments in Valibot library source code

**Contains:**

- JSDoc patterns for interfaces, types, functions, and overloads
- Inline comment patterns (section headers, conditional logic, operations)
- @**NO_SIDE_EFFECTS** usage rules
- Article omission rules (no "the", "a", "an" except in Hint comments)
- Complete documentation checklist and AI agent workflow
- Examples from actual Valibot source files

**Valibot-specific patterns:**

- Interface first line: `[Name] [category] interface.`
- Function overloads: `Creates a [name] [category].`
- Property docs: `The [description].`
- Inline comments: No articles, no periods (except Hints)

---

## Website Documentation Guides

### [`add-new-api-to-website.md`](./add-new-api-to-website.md)

**Use when:** Adding new API reference documentation for a schema, action, method, or utility to valibot.dev

**Contains:**

- Complete step-by-step process for creating new API routes
- Property component patterns and TypeScript definitions
- How to read source code and extract documentation
- Creating `index.mdx` and `properties.ts` files
- Updating navigation and related files
- Writing effective code examples
- Consistency checklist for uniformity across API docs

**Covers:** schemas (string, object, array), actions (email, minLength), methods (parse, safeParse), utilities

### [`update-api-on-website.md`](./update-api-on-website.md)

**Use when:** Updating existing API reference documentation after source code changes

**Contains:**

- When and how to sync documentation with source code changes
- Handling signature changes (new parameters, type changes, generics)
- Updating behavior descriptions and examples
- Deprecation and migration documentation
- Verification steps to ensure accuracy
- Common update scenarios with examples

**Key principle:** Source code is single source of truth; documentation must match implementation

### [`add-new-guide-to-website.md`](./add-new-guide-to-website.md)

**Use when:** Adding a new conceptual guide or tutorial to the Valibot website documentation

**Contains:**

- Guide directory structure and organization
- Category grouping (Get started, Main concepts, Schemas, Advanced, Migration)
- Qwik routing conventions (route groups with parentheses)
- MDX content structure and frontmatter
- Updating navigation menu (`menu.md`)
- Writing style guidelines for guides
- Code example patterns

**Note:** This is for conceptual guides (tutorials, explanations), not API reference pages

---

## Quick Decision Tree

1. **Need to navigate/understand repository?** → `repository-structure.md`

2. **Working with Valibot source code comments?** → `document-source-code.md`

3. **Working with Formisch source code?** → `documentation-guide-for-formisch.md`

4. **Adding new API reference page?** → `add-new-api-to-website.md`

5. **Updating existing API page after code change?** → `update-api-on-website.md`

6. **Adding tutorial/conceptual guide?** → `add-new-guide-to-website.md`

---

## Important Notes

- **Source code vs Website:** `document-source-code.md` is for library source code comments; website guides are for valibot.dev documentation.

- **Always verify:** When updating documentation, always check the actual source code to ensure accuracy.

- **Consistency matters:** Follow patterns exactly to maintain uniformity across the codebase and documentation.

---

## Getting Started

1. Read this index to identify relevant guides
2. Open the specific guide(s) for your task
3. Follow the step-by-step instructions and checklists
4. Verify your work against the documented patterns

For questions about which guide to use, consider:

- **What am I working on?** (source code, API docs, guides, repository structure)
- **What am I doing?** (creating new, updating existing, understanding/navigating)
