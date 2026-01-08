# Valibot Source Code Documentation

Documentation patterns for library source code in `/library/src/`.

## JSDoc Patterns

### Interface Documentation

```typescript
/**
 * String issue interface.
 */
export interface StringIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'string';
}
```

**Rules:**

- First line: `[Name] [category] interface.` (e.g., "String issue interface.")
- Property comments: `The [description].` (always start with "The", end with period)
- All properties use `readonly`
- No blank lines between property and its comment

### Function Overloads

Each overload gets its own complete JSDoc:

```typescript
/**
 * Creates a string schema.
 *
 * @returns A string schema.
 */
export function string(): StringSchema<undefined>;

/**
 * Creates a string schema.
 *
 * @param message The error message.
 *
 * @returns A string schema.
 */
export function string<
  const TMessage extends ErrorMessage<StringIssue> | undefined,
>(message: TMessage): StringSchema<TMessage>;
```

**Rules:**

- First line: `Creates a [name] [category].` (use "a" vs "an" correctly)
- Blank line after description
- `@param name The [description].` (start with "The", end with period)
- Blank line after params
- `@returns A [name] [category].` or `@returns The [description].`

### Hints

Add hints after the main description, before `@param`:

```typescript
/**
 * Creates an object schema.
 *
 * Hint: This schema removes unknown entries. To include unknown entries, use
 * `looseObject`. To reject unknown entries, use `strictObject`.
 *
 * @param entries The entries schema.
 *
 * @returns An object schema.
 */
```

### Links

Link to external resources when relevant using markdown format:

````typescript
/**
 * Creates an [email](https://en.wikipedia.org/wiki/Email_address) validation action.
 */

### Implementation Function

The implementation has **NO JSDoc** but uses `// @__NO_SIDE_EFFECTS__`:

```typescript
// @__NO_SIDE_EFFECTS__
export function string(
  message?: ErrorMessage<StringIssue>
): StringSchema<ErrorMessage<StringIssue> | undefined> {
  return { /* ... */ };
}
````

**`// @__NO_SIDE_EFFECTS__` rules:**

- Add for pure functions (no external state mutation, no I/O)
- Most schema/action/method factories are pure
- **Do NOT add** for functions that mutate arguments (like `_addIssue`)
- Used by bundlers for tree-shaking

### Utility Functions

```typescript
/**
 * Stringifies an unknown input to a literal or type string.
 *
 * @param input The unknown input.
 *
 * @returns A literal or type string.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _stringify(input: unknown): string {
  // ...
}
```

**Rules:**

- Use `@internal` tag for internal utilities
- Prefix internal functions with `_`
- Only add `// @__NO_SIDE_EFFECTS__` if function is pure

## Inline Comment Patterns

### Section Headers

```typescript
'~run'(dataset, config) {
  // Get input value from dataset
  const input = dataset.value;

  // If root type is valid, check nested types
  if (Array.isArray(input)) {
    // Set typed to true and value to empty array
    dataset.typed = true;
    dataset.value = [];

    // Parse schema of each array item
    for (let key = 0; key < input.length; key++) {
      // ...
    }
  }
}
```

**Rules:**

- Describe WHAT the next code block does
- Present tense verbs: "Get", "Parse", "Check", "Set", "Add", "Create"
- **Omit articles** ("the", "a", "an"): "Get input value" not "Get the input value"
- No period at end
- Blank line before comment, no blank line after

### Conditional Logic

```typescript
// If root type is valid, check nested types
if (input && typeof input === 'object') {
  // ...
}

// Otherwise, add issue
else {
  _addIssue(this, 'type', dataset, config);
}
```

**Rules:**

- Use "If [condition], [action]"
- Use "Otherwise, [action]" for else branches
- Omit articles

### Hint Comments (Exception)

```typescript
// Hint: The issue is deliberately not constructed with the spread operator
// for performance reasons
const issue: BaseIssue<unknown> = {
  /* ... */
};
```

**Rules:**

- Start with "Hint:"
- Explain WHY, not just what
- **CAN use articles** (unlike other inline comments)
- Document performance decisions, non-obvious logic

### TODO Comments

```typescript
// TODO: Should we add "n" suffix to bigints?
if (type === 'bigint') {
  /* ... */
}
```

### @ts-expect-error

Used for internal dataset mutations TypeScript can't track:

```typescript
// @ts-expect-error
dataset.typed = true;
```

## File Type Patterns

### Schema Files (`string.ts`, `object.ts`, etc.)

1. Issue interface with JSDoc
2. Schema interface with JSDoc
3. Function overloads with full JSDoc each
4. Implementation with `// @__NO_SIDE_EFFECTS__`
5. Return object with `'~run'` method containing inline comments

### Action Files (`email.ts`, `minLength.ts`, etc.)

1. Issue interface (for validation actions)
2. Action interface with JSDoc
3. Function overloads with JSDoc
4. Implementation with `// @__NO_SIDE_EFFECTS__`

### Method Files (`parse.ts`, `pipe.ts`, etc.)

More complex logic, require more inline comments.

### Utility Files (`_addIssue.ts`, `_stringify.ts`)

1. Single function with JSDoc including `@internal`
2. `// @__NO_SIDE_EFFECTS__` only if pure

## Quick Reference

### JSDoc First Lines

| Type      | Pattern                        |
| --------- | ------------------------------ |
| Interface | `[Name] [category] interface.` |
| Type      | `[Name] [category] type.`      |
| Function  | `Creates a [name] [category].` |
| Utility   | `[Verb]s [description].`       |

### Inline Comment Starters

| Pattern                        | Example                                        |
| ------------------------------ | ---------------------------------------------- |
| `// Get [what]`                | `// Get input value from dataset`              |
| `// If [condition], [action]`  | `// If root type is valid, check nested types` |
| `// Otherwise, [action]`       | `// Otherwise, add issue`                      |
| `// Create [what]`             | `// Create object path item`                   |
| `// Add [what] to [where]`     | `// Add issues to dataset`                     |
| `// Parse [what]`              | `// Parse schema of each array item`           |
| `// Set [property] to [value]` | `// Set typed to true`                         |
| `// Hint: [explanation]`       | `// Hint: This is for performance`             |
| `// TODO: [task]`              | `// TODO: Add bigint suffix`                   |

## Terminology

Use consistently:

- **Schema** (not "validator")
- **Action** (not "validation" for the object)
- **Issue** (not "error" in type names)
- **Dataset** (internal data structure)
- **Config/Configuration** (not "options")

## Checklist

- [ ] Interfaces: `[Name] [category] interface.`
- [ ] Properties: `The [description].`
- [ ] Overloads: Complete JSDoc each
- [ ] Implementation: NO JSDoc
- [ ] Pure functions: `// @__NO_SIDE_EFFECTS__`
- [ ] Impure functions (mutate args): NO `@__NO_SIDE_EFFECTS__`
- [ ] Internal utilities: `@internal` tag
- [ ] Inline comments: No articles (except Hint), no periods
- [ ] JSDoc comments: End with periods
