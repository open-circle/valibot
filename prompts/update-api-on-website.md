# Updating API Documentation

Guide for syncing API docs with source code changes.

**Prerequisite:** Read [add-new-api-to-website.md](./add-new-api-to-website.md) for `properties.ts` and `index.mdx` patterns.

## When to Update

Update documentation when source code changes:

- Function signatures (parameters, generics, return types)
- Interface properties
- JSDoc descriptions or hints
- Behavior changes affecting examples

**Do NOT update for:** Internal implementation changes (`~run` method), test changes, non-JSDoc comments.

## Process

1. **Read full source file** - Don't just look at diff; understand complete current state
2. **Identify changes** - Categorize as addition, removal, or modification
3. **Update `properties.ts`** - Match types exactly to source
4. **Update `index.mdx`** - Signature, generics, parameters, examples
5. **Update related files** - Type docs, `menu.md` if renamed

## Common Change Types

### New Parameter Added

```typescript
// Before: one overload
export function action<TInput>(requirement: TRequirement): Action<...>;

// After: two overloads (message is optional)
export function action<TInput>(requirement: TRequirement): Action<..., undefined>;
export function action<TInput, TMessage>(requirement: TRequirement, message: TMessage): Action<..., TMessage>;
```

Update:

1. Add `TMessage` generic to `properties.ts`
2. Add `message` parameter to `properties.ts`
3. Update signature in `index.mdx`
4. Add generic and parameter documentation
5. Update examples to show new parameter

### Parameter Removed (Breaking)

1. Remove from `properties.ts`
2. Update signature in `index.mdx`
3. Remove from Parameters section
4. Update all examples
5. Consider adding migration note in Explanation

### Type Constraint Changed

```typescript
// Before
TRequirement extends number

// After
TRequirement extends number | string
```

Update:

1. Update type in `properties.ts`
2. Update Explanation to mention both types
3. Add examples for new type usage

### Interface Property Added

1. Update type documentation in `(types)/TypeName/`
2. Add new property to `properties.ts`
3. Document in Definition section

### Function Renamed

1. Rename folder
2. Update all references in files
3. Update `menu.md` (maintain alphabetical order)
4. Update cross-references in related API docs
5. Consider redirect if widely used

### Deprecation

Add notice at top of `index.mdx` (import `Link` from `~/components`):

```mdx
> **⚠️ Deprecated**: Use <Link href="../newFunction/">\`newFunction\`</Link> instead. Will be removed in v2.0.
```

### New Helper Type Introduced

When source introduces a type alias:

```typescript
// Before: TInput extends string | unknown[]
// After: TInput extends LengthInput
```

1. Update `properties.ts` to reference new type with `href`
2. Create documentation for the new type in `(types)/`
3. Update explanation if supported types changed

### Multiple Overloads Added (Sync/Async)

When sync and async variants are added:

1. Update signature to show general pattern or both overloads
2. Add explanation about sync vs async usage
3. Add examples for both use cases
4. Update Related section for async schemas if relevant

## Related Files to Update

When a function changes, check:

- **Type docs** - If interfaces changed (`(types)/TypeName/`)
- **Related API docs** - Other APIs that reference this function in their Related section
- **Guide files** - If usage patterns changed significantly
- **menu.md** - If function renamed or moved

## Verification

After updating, verify:

- [ ] All types match source exactly
- [ ] Function signature matches source
- [ ] All examples work with new API
- [ ] All `href` links are valid
- [ ] Related type docs updated if interfaces changed
- [ ] `menu.md` updated if renamed
- [ ] Related API docs updated (their Related sections)

## Best Practices

- **Read full source file** - Don't just look at diff
- **Update incrementally** - `properties.ts` → `index.mdx` → related files
- **Don't over-document internals** - Only user-facing changes need docs
- **Preserve example quality** - Keep realistic, demonstrate best practices
- **Check related APIs** - They may reference the changed function

## When to Ask for Help

- Major breaking changes (complete signature overhaul)
- Complex generic constraint changes
- Unclear intent from source changes
- Many related files affected
- Need to document migration path

## Quick Reference

| Change            | Files to Update                                                      |
| ----------------- | -------------------------------------------------------------------- |
| New parameter     | `properties.ts`, `index.mdx` (signature, generics, params, examples) |
| Removed parameter | `properties.ts`, `index.mdx`                                         |
| Type change       | `properties.ts`, `index.mdx` (explanation, examples)                 |
| Interface change  | `(types)/TypeName/properties.ts`, `(types)/TypeName/index.mdx`       |
| Renamed function  | Folder name, all files, `menu.md`, cross-references                  |
| Deprecation       | `index.mdx` (add warning)                                            |
