---
name: repo-source-code-review
description: Review pull requests and source code changes in /library/src/. Use when reviewing PRs, validating implementation patterns, or checking code quality before merging. Covers code quality checks, type safety, documentation review, test coverage, and common issues to watch for.
---

# Reviewing Source Code Changes

Guide for reviewing PRs and source code changes in `/library/src/`.

## When to Use This Guide

- Reviewing pull requests modifying library source
- Validating implementation patterns before merging
- Checking code quality, types, documentation, and tests

## Review Process

1. **Understand the change** — Read PR description, identify affected files
2. **Check patterns** — Verify code follows existing conventions
3. **Verify types** — Ensure type safety and proper inference
4. **Review docs** — Confirm JSDoc is complete and accurate
5. **Check tests** — Validate runtime and type test coverage

## What to Review

### Code Quality

| Check             | Requirement                                                           |
| ----------------- | --------------------------------------------------------------------- |
| Naming            | Matches existing patterns (`StringSchema`, `minLength`, `_parse`)     |
| Purity annotation | `// @__NO_SIDE_EFFECTS__` before pure factory functions               |
| Import extensions | All imports use `.ts` extension                                       |
| Interface vs type | Use `interface` for object shapes, `type` for unions/aliases          |
| Folder structure  | Each API has: `name.ts`, `name.test.ts`, `name.test-d.ts`, `index.ts` |

**Good — purity annotation:**

```typescript
// @__NO_SIDE_EFFECTS__
export function string(message?: ErrorMessage<StringIssue>): StringSchema {
  return {
    /* ... */
  };
}
```

**Bad — missing annotation:**

```typescript
export function string(message?: ErrorMessage<StringIssue>): StringSchema {
  return {
    /* ... */
  };
}
```

### Type Safety

| Check             | Requirement                                           |
| ----------------- | ----------------------------------------------------- |
| Generic inference | Types infer correctly without explicit annotations    |
| Constraints       | Generic parameters have appropriate `extends` clauses |
| Return types      | Explicit return types on exported functions           |
| Type tests        | `.test-d.ts` file covers type inference scenarios     |

**Good — constrained generic:**

```typescript
export function minLength<
  TInput extends LengthInput,
  TRequirement extends number,
>(
  requirement: TRequirement,
  message?: ErrorMessage<MinLengthIssue<TInput, TRequirement>>
): MinLengthAction<TInput, TRequirement>;
```

### Documentation

| Check          | Requirement                                       |
| -------------- | ------------------------------------------------- |
| JSDoc present  | All exported functions have JSDoc                 |
| First line     | Action verb matching function purpose (see below) |
| `@param` tags  | Every parameter documented                        |
| `@returns` tag | Return value documented                           |
| Overloads      | Every overload has its own complete JSDoc block   |

**First line patterns by category:**

| Category       | Pattern                                        |
| -------------- | ---------------------------------------------- |
| Schemas        | `Creates a ... schema.`                        |
| Actions        | `Creates a ... action.`                        |
| Parse methods  | `Parses ...`                                   |
| Type guards    | `Checks if ...`                                |
| Unwrap methods | `Unwraps ...`                                  |
| Other methods  | `Creates a ...`, `Returns ...`, `Forwards ...` |

See `repo-source-code-document` skill for full documentation rules.

### Tests

| Check          | Requirement                                                |
| -------------- | ---------------------------------------------------------- |
| Runtime tests  | `.test.ts` covers success cases, failure cases, edge cases |
| Type tests     | `.test-d.ts` validates type inference with `expectTypeOf`  |
| Issue messages | Tests verify correct error messages and issue structure    |

## Common Issues

| Issue                     | What to Look For                                             |
| ------------------------- | ------------------------------------------------------------ |
| Missing purity annotation | Factory function without `// @__NO_SIDE_EFFECTS__`           |
| Incomplete JSDoc          | Missing `@param` or `@returns`, wrong description format     |
| No type tests             | New API without `.test-d.ts` file                            |
| Wrong import extension    | Imports without `.ts` suffix                                 |
| Inconsistent naming       | Schema not ending in `Schema`, action not ending in `Action` |
| Side effects in pure code | Mutations, I/O, or global state in schema/action creation    |

## Checklist

- [ ] Implementation follows existing patterns in similar files
- [ ] `// @__NO_SIDE_EFFECTS__` on pure factory functions
- [ ] All imports use `.ts` extension
- [ ] `interface` used for object shapes
- [ ] JSDoc complete on all exports
- [ ] Runtime tests in `.test.ts`
- [ ] Type tests in `.test-d.ts`
- [ ] Naming conventions followed

## Related Skills

- `repo-structure-navigate` — Navigate the codebase
- `repo-source-code-document` — JSDoc requirements
