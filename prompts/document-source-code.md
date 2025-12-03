# Valibot Source Code Documentation Guide for AI Agents

This guide documents the specific documentation patterns and style used in the Valibot library. Follow these rules precisely when reviewing, fixing, or creating documentation for Valibot source code.

## Core Documentation Philosophy

1. **Clarity over verbosity** - Documentation should be clear and concise
2. **Consistency is critical** - Follow established patterns exactly
3. **User-focused** - Documentation serves developers using the API
4. **Type-safe documentation** - JSDoc comments enhance TypeScript IntelliSense

---

## JSDoc Comment Patterns

### 1. Interface & Type Documentation

Every exported interface and type must have a JSDoc comment following this exact pattern:

```typescript
/**
 * [Name] [category] interface.
 */
export interface NameCategory<TGenerics> {
  /**
   * The [property description].
   */
  readonly propertyName: Type;
}
```

**Key Rules:**

- **First line format**: Always `[Name] [category] interface.` or `[Name] [category] type.`
  - Examples: `String issue interface.`, `Email action interface.`, `Parse configuration interface.`
- **Property comments**: One-line format: `The [property description].`
  - Always start with "The"
  - End with a period
  - Use lowercase after "The" unless it's a proper noun
- **No blank lines** between property and its comment
- Use `readonly` for all interface properties

**Examples:**

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
  /**
   * The expected property.
   */
  readonly expected: 'string';
}

/**
 * Email action interface.
 */
export interface EmailAction<TInput extends string, TMessage> {
  /**
   * The action type.
   */
  readonly type: 'email';
  /**
   * The email regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Fallback type.
 */
export type Fallback<TSchema> =
  | InferOutput<TSchema>
  | ((dataset?: OutputDataset) => InferOutput<TSchema>);
```

### 2. Function Overload Documentation

Function overloads must be documented with this pattern:

```typescript
/**
 * Creates a [name] [category].
 *
 * @param param1 The [description].
 * @param param2 The [description].
 *
 * @returns A [name] [category].
 */
export function functionName<TGenerics>(param1: Type, param2: Type): ReturnType;
```

**Key Rules:**

- **First line**: `Creates a [name] [category].` or `Creates an [name] [category].`
  - Use "a" vs "an" based on pronunciation (e.g., "an email", "a string")
- **Blank line** after description
- **@param format**: `@param name The [description].`
  - Always start with "The"
  - End with a period
  - Lowercase after "The"
- **Blank line** after all @param tags
- **@returns format**: `@returns A [name] [category].` or `@returns The [description].`
- Each overload gets its own complete JSDoc comment
- **Hints/Notes**: Add after first line, before params, starting with "Hint:"

**Examples:**

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
export function string<const TMessage>(
  message: TMessage
): StringSchema<TMessage>;

/**
 * Creates an object schema.
 *
 * Hint: This schema removes unknown entries. The output will only include the
 * entries you specify. To include unknown entries, use `looseObject`. To
 * return an issue for unknown entries, use `strictObject`. To include and
 * validate unknown entries, use `objectWithRest`.
 *
 * @param entries The entries schema.
 *
 * @returns An object schema.
 */
export function object<const TEntries>(
  entries: TEntries
): ObjectSchema<TEntries, undefined>;

/**
 * Creates an [email](https://en.wikipedia.org/wiki/Email_address) validation
 * action.
 *
 * Hint: This validation action intentionally only validates common email
 * addresses. If you are interested in an action that covers the entire
 * specification, please use the `rfcEmail` action instead.
 *
 * @param requirement The minimum length.
 * @param message The error message.
 *
 * @returns A min length action.
 */
export function minLength<TInput, const TRequirement>(
  requirement: TRequirement,
  message: TMessage
): MinLengthAction<TInput, TRequirement, TMessage>;
```

### 3. Implementation Function Documentation

The actual implementation function (after overloads) does NOT get a JSDoc comment. Use the `// @__NO_SIDE_EFFECTS__` comment for pure functions:

```typescript
// @__NO_SIDE_EFFECTS__
export function string(
  message?: ErrorMessage<StringIssue>
): StringSchema<ErrorMessage<StringIssue> | undefined> {
  return {
    // implementation
  };
}
```

**Key Rules:**

- NO JSDoc comment on implementation
- Include `// @__NO_SIDE_EFFECTS__` comment above implementation **only if the function has no side effects**
- This annotation is used by bundlers for tree-shaking optimization
- A function has no side effects if it:
  - Does not modify external state (global variables, caches, etc.)
  - Does not perform I/O operations (file system, network, console, etc.)
  - Always returns the same output for the same input (pure function)
  - Note: Internal argument mutations are acceptable in Valibot (e.g., mutating `dataset` objects) as these are controlled and safe
- Most schema, action, and method constructors in Valibot are pure functions and should have this comment
- Functions that perform I/O, logging, or modify global state should NOT have this comment

### 4. Utility Function Documentation

Utility functions (especially internal ones prefixed with `_`) follow the same pattern but may include `@internal` tag:

```typescript
/**
 * [Description of what the function does].
 *
 * @param param1 The [description].
 * @param param2 The [description].
 *
 * @returns [Description of return value].
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _utilityFunction(param1: Type, param2: Type): ReturnType {
  // implementation
}
```

**Note:** Only include `// @__NO_SIDE_EFFECTS__` if the utility function is pure (no side effects).

**Examples:**

```typescript
/**
 * Joins multiple `expects` values with the given separator.
 *
 * @param values The `expects` values.
 * @param separator The separator.
 *
 * @returns The joined `expects` property.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _joinExpects(values: string[], separator: '&' | '|'): string {
  // implementation
}

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
  // implementation
}

/**
 * Adds an issue to the dataset.
 *
 * @param context The issue context.
 * @param label The issue label.
 * @param dataset The input dataset.
 * @param config The configuration.
 * @param other The optional props.
 *
 * @internal
 */
export function _addIssue<const TContext>(
  context: TContext,
  label: string,
  dataset: UnknownDataset,
  config: Config,
  other?: Other<TContext>
): void {
  // implementation
}

// Note: _addIssue does NOT have @__NO_SIDE_EFFECTS__ because it mutates the dataset

/**
 * A generic type guard to check the kind of an object.
 *
 * @param kind The kind to check for.
 * @param object The object to check.
 *
 * @returns Whether it matches.
 */
// @__NO_SIDE_EFFECTS__
export function isOfKind<TKind, TObject>(
  kind: TKind,
  object: TObject
): object is Extract<TObject, { kind: TKind }> {
  return object.kind === kind;
}
```

### 5. Methods Documentation (parse, safeParse, etc.)

Public API methods use descriptive first lines:

```typescript
/**
 * Parses an unknown input based on a schema.
 *
 * @param schema The schema to be used.
 * @param input The input to be parsed.
 * @param config The parse configuration.
 *
 * @returns The parsed input.
 */
export function parse<const TSchema>(
  schema: TSchema,
  input: unknown,
  config?: Config
): InferOutput<TSchema> {
  // implementation
}
```

---

## Inline Comment Patterns

Inline comments explain the logic flow and are critical for understanding complex operations.

### 1. Section Headers

Use inline comments to mark major sections within a function:

```typescript
'~run'(dataset, config) {
  // Get input value from dataset
  const input = dataset.value;

  // If root type is valid, check nested types
  if (Array.isArray(input)) {
    // Set typed to `true` and value to empty array
    dataset.typed = true;
    dataset.value = [];

    // Parse schema of each array item
    for (let key = 0; key < input.length; key++) {
      // implementation
    }
  }
}
```

**Key Rules:**

- Comment describes what the NEXT block of code does
- Use present tense ("Get", "Parse", "Check", "Set")
- Be concise - omit articles like "the", "a", "an" (e.g., "Get input value" not "Get the input value")
- No blank line between comment and code it describes
- Blank line before comment (to separate from previous section)

### 2. Conditional Logic Comments

Explain the condition being checked:

```typescript
// If root type is valid, check nested types
if (input && typeof input === 'object') {
  // implementation
}

// If key is present or its an optional schema with a default value,
// parse input of key or default value
if (
  key in input ||
  ((valueSchema.type === 'optional' || valueSchema.type === 'nullish') &&
    valueSchema.default !== undefined)
) {
  // implementation
}

// Otherwise, if key is missing but has a fallback, use it
else if (valueSchema.fallback !== undefined) {
  // implementation
}

// Otherwise, if key is missing and required, add issue
else if (valueSchema.type !== 'optional' && valueSchema.type !== 'nullish') {
  // implementation
}
```

**Key Rules:**

- Use "If" to start condition explanations
- Use "Otherwise" for else/else-if branches
- Be concise - omit articles like "the", "a", "an"
- Explain the business logic, not just repeating the code
- For complex conditions, explain WHY not just WHAT

### 3. Operation Comments

Describe operations being performed:

```typescript
// Create object path item
const pathItem: ObjectPathItem = {
  type: 'object',
  origin: 'value',
  input: input as Record<string, unknown>,
  key,
  value,
};

// Add modified entry dataset issues to issues
for (const issue of valueDataset.issues) {
  if (issue.path) {
    issue.path.unshift(pathItem);
  } else {
    issue.path = [pathItem];
  }
  dataset.issues?.push(issue);
}

// If necessary, abort early
if (config.abortEarly) {
  dataset.typed = false;
  break;
}
```

**Key Rules:**

- Verb-based descriptions ("Create", "Add", "Set", "Parse", "Check")
- Be concise - omit articles like "the", "a", "an"
- Brief but descriptive
- Focus on intent, not mechanics

### 4. Variable Declaration Comments

When a variable needs explanation:

```typescript
// Create output dataset variable
let outputDataset: OutputDataset<unknown, BaseIssue<unknown>> | undefined;

// Create variables to store invalid discriminator information
let maxDiscriminatorPriority = 0;
let invalidDiscriminatorKey = this.key;
let expectedDiscriminators: string[] = [];

// Get expected and received string
const input = other && 'input' in other ? other.input : dataset.value;
const expected = other?.expected ?? context.expects ?? null;
const received = other?.received ?? _stringify(input);
```

**Key Rules:**

- Be concise - omit articles like "the", "a", "an"
- Focus on the purpose or role of the variable

### 5. Hint Comments

Special inline comments that explain non-obvious implementation details:

```typescript
// Hint: The issue is deliberately not constructed with the spread operator
// for performance reasons
const issue: BaseIssue<unknown> = {
  kind: context.kind,
  type: context.type,
  // ...
};

// Hint: Only the first untyped or typed dataset is returned, and
// typed datasets have priority over untyped ones
if (!outputDataset || (!outputDataset.typed && optionDataset.typed)) {
  outputDataset = optionDataset;
}
```

**Key Rules:**

- Start with "Hint:"
- Explain WHY something is done a certain way
- Document performance considerations
- Document non-obvious logic decisions
- **Exception:** Hint comments CAN use articles like "the", "a", "an" for clarity since they're explanatory prose

### 6. TODO Comments

```typescript
// TODO: Should we add "n" suffix to bigints?
if (type === 'number' || type === 'bigint' || type === 'boolean') {
  return `${input}`;
}
```

**Key Rules:**

- Use `// TODO:` format
- Be specific about what needs to be done
- Include context or questions

---

## Special Comment Patterns

### 1. TypeScript Error Suppression

When using `@ts-expect-error`, always explain if it's for a good reason:

```typescript
// @ts-expect-error
dataset.typed = true;

// If context is a schema, set typed to `false`
if (isSchema) {
  dataset.typed = false;
}
```

**Note:** Most `@ts-expect-error` in Valibot are for internal dataset mutations that TypeScript can't track properly. These typically don't need additional explanation beyond the section comment.

### 2. Internal Properties

Properties starting with `~` are internal and should be documented as such:

```typescript
/**
 * The Standard Schema properties.
 *
 * @internal
 */
readonly '~standard': StandardProps<TInput, TOutput>;

/**
 * Parses unknown input values.
 *
 * @param dataset The input dataset.
 * @param config The configuration.
 *
 * @returns The output dataset.
 *
 * @internal
 */
readonly '~run': (
  dataset: UnknownDataset,
  config: Config
) => OutputDataset<TOutput, TIssue>;

/**
 * The input, output and issue type.
 *
 * @internal
 */
readonly '~types'?: {
  readonly input: TInput;
  readonly output: TOutput;
  readonly issue: TIssue;
} | undefined;
```

---

## Documentation Checklist

When reviewing or creating documentation, verify:

### JSDoc Comments

- [ ] All exported interfaces have `[Name] [category] interface.` format
- [ ] All interface properties have `The [description].` format
- [ ] All function overloads have complete JSDoc with correct format
- [ ] Implementation functions have NO JSDoc but DO have `// @__NO_SIDE_EFFECTS__`
- [ ] @param descriptions start with "The" and end with period
- [ ] @returns descriptions follow correct format
- [ ] Hints are placed after main description, before @param tags
- [ ] Internal utilities have `@internal` tag
- [ ] Complex types have descriptive comments

### Inline Comments

- [ ] Major sections are marked with descriptive comments
- [ ] Conditional logic has "If"/"Otherwise" comments
- [ ] Complex operations have verb-based comments
- [ ] Non-obvious code has "Hint:" comments
- [ ] Comments use present tense
- [ ] Comments are concise without articles ("the", "a", "an") except in Hint comments
- [ ] Comments describe WHAT and WHY, not HOW
- [ ] No blank lines between comment and code it describes
- [ ] Blank lines separate major sections

### Style Consistency

- [ ] All comments end with periods
- [ ] "The" is consistently used for property/parameter descriptions
- [ ] Article usage is correct ("a" vs "an")
- [ ] Consistent terminology (schema, action, validation, transformation)
- [ ] No unnecessary verbosity
- [ ] Professional, clear tone

---

## Common Patterns by File Type

### Schema Files (e.g., `string.ts`, `object.ts`, `array.ts`)

**Structure:**

1. Issue interface with JSDoc
2. Schema interface with JSDoc
3. Multiple function overloads with full JSDoc each
4. Implementation function with `// @__NO_SIDE_EFFECTS__`
5. Return object with:
   - Basic properties
   - `get '~standard'()` getter
   - `'~run'()` method with inline comments

**Inline comment pattern in `~run`:**

```typescript
'~run'(dataset, config) {
  // Get input value from dataset
  const input = dataset.value;

  // If root type is valid, check nested types
  if (/* condition */) {
    // Set typed to `true` and value to [initial state]
    dataset.typed = true;
    dataset.value = /* initial value */;

    // [Main processing operation description]
    for (/* iteration */) {
      // implementation
    }

  // Otherwise, add [schema name] issue
  } else {
    _addIssue(this, 'type', dataset, config);
  }

  return dataset as OutputDataset<TOutput, TIssue>;
}
```

### Action Files (e.g., `email.ts`, `minLength.ts`, `trim.ts`)

**Structure:**

1. Issue interface (for validation actions)
2. Action interface with JSDoc
3. Function overloads with JSDoc
4. Implementation with `// @__NO_SIDE_EFFECTS__`

**Validation actions `~run` pattern:**

```typescript
'~run'(dataset, config) {
  if (dataset.typed && /* validation fails */) {
    _addIssue(this, '[label]', dataset, config);
  }
  return dataset;
}
```

**Transformation actions `~run` pattern:**

```typescript
'~run'(dataset) {
  dataset.value = /* transformed value */;
  return dataset;
}
```

### Method Files (e.g., `parse.ts`, `pipe.ts`, `partial.ts`)

**Structure:**

1. Type definitions with JSDoc
2. Function overloads with detailed JSDoc
3. Implementation function

**Methods often have more complex logic and need more inline comments.**

### Utility Files (e.g., `_addIssue.ts`, `_stringify.ts`)

**Structure:**

1. Helper type definitions (if needed)
2. Single function with JSDoc including `@internal`
3. Include `// @__NO_SIDE_EFFECTS__` only if the function is pure (no side effects)
   - Pure utilities like `_stringify`, `_joinExpects`, `isOfKind` should have it
   - Mutating utilities like `_addIssue` should NOT have it

---

## Examples: Before and After

### ❌ Incorrect Documentation

```typescript
/**
 * String schema
 */
export interface StringSchema<TMessage> {
  // schema type
  readonly type: 'string';
  // the error message
  readonly message: TMessage;
}

/*
 * Create a string schema
 */
export function string(message?: ErrorMessage): StringSchema {
  return {
    type: 'string',
    message,
    '~run'(dataset, config) {
      // check if it's a string
      if (typeof dataset.value === 'string') {
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      return dataset;
    },
  };
}
```

**Problems:**

- Missing "interface" in first line
- Properties don't start with "The"
- Function JSDoc uses `/*` instead of `/**`
- Missing period in JSDoc first line
- Missing @param and @returns
- Implementation has JSDoc (should only have overloads)
- Inline comment doesn't describe what comes next properly

### ✅ Correct Documentation

```typescript
/**
 * String schema interface.
 */
export interface StringSchema<
  TMessage extends ErrorMessage<StringIssue> | undefined,
> extends BaseSchema<string, string, StringIssue> {
  /**
   * The schema type.
   */
  readonly type: 'string';
  /**
   * The error message.
   */
  readonly message: TMessage;
}

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

// @__NO_SIDE_EFFECTS__
export function string(
  message?: ErrorMessage<StringIssue>
): StringSchema<ErrorMessage<StringIssue> | undefined> {
  return {
    kind: 'schema',
    type: 'string',
    reference: string,
    expects: 'string',
    async: false,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      if (typeof dataset.value === 'string') {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        _addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as OutputDataset<string, StringIssue>;
    },
  };
}
```

---

## Special Notes

### 1. Terminology Consistency

Always use the same terms:

- **Schema** (not "validator" or "type checker")
- **Action** (not "validation" when referring to the function/object)
- **Validation** (when describing the process)
- **Transformation** (when describing mutations)
- **Issue** (not "error" in type names)
- **Dataset** (internal data structure passed through pipeline)
- **Configuration** or **config** (not "options")

### 2. Grammar Rules

- Start property descriptions with "The"
- Start parameter descriptions with "The"
- Use "a" or "an" correctly
- Always end sentences with periods
- Use present tense for operations
- Use passive voice sparingly

### 3. Links in Documentation

- Link to external resources in overload JSDoc when relevant
- Use markdown link format: `[text](url)`
- Example: `[email](https://en.wikipedia.org/wiki/Email_address)`

### 4. Hints and Notes

- Use "Hint:" prefix for implementation notes
- Use "Note:" less frequently, prefer "Hint:"
- Place hints after main description, before @param tags in JSDoc
- Use hint comments inline for non-obvious code

---

## Quick Reference

### JSDoc First Lines

- Interface: `[Name] [category] interface.`
- Type: `[Name] [category] type.`
- Function: `Creates a [name] [category].` or `Creates an [name] [category].`
- Utility: `[Verb]s [description].` (e.g., "Parses an unknown input...")

### JSDoc Tags

```
@param name The [description].
@returns A [name] [category]. OR The [description].
@internal
```

### Inline Comment Starters

- `// Get [what]` (e.g., "Get input value from dataset")
- `// If [condition], [action]` (e.g., "If root type is valid, check nested types")
- `// Otherwise, [action]` (e.g., "Otherwise, add issue")
- `// Create [what]` (e.g., "Create object path item")
- `// Add [what] to [where]` (e.g., "Add modified entry dataset issues to issues")
- `// Parse [what]` (e.g., "Parse schema of each array item")
- `// Check [what]` (e.g., "Check if all discriminator keys are valid")
- `// Set [property] to [value]` (e.g., "Set typed to true")
- `// Hint: [explanation]` (can use articles like "the" for clarity)
- `// TODO: [task]`

**Note:** Omit articles ("the", "a", "an") in all inline comments except Hint comments.

---

## AI Agent Workflow for Documentation

### When Reviewing Documentation:

1. Check all interfaces for correct JSDoc format
2. Verify function overloads each have complete JSDoc
3. Confirm implementation has NO JSDoc
4. Check for `// @__NO_SIDE_EFFECTS__` comment on pure functions (verify function truly has no side effects)
5. Verify functions with side effects do NOT have `// @__NO_SIDE_EFFECTS__` comment
6. Review inline comments for consistency and clarity
7. Verify all comments end with periods
8. Check property descriptions start with "The"
9. Ensure consistent terminology

### When Creating Documentation:

1. Start with interface JSDoc using exact pattern
2. Add property comments (one per property)
3. Create function overload JSDoc for each signature
4. Add `// @__NO_SIDE_EFFECTS__` to implementation **only if the function is pure** (no side effects)
5. Add section comments in implementation
6. Add conditional logic comments
7. Add hint comments for non-obvious code
8. Review for consistency with existing code

### When Fixing Documentation:

1. Identify the file type (schema/action/method/utility)
2. Apply the appropriate pattern for that type
3. Keep existing comment structure if correct
4. Only change what's inconsistent or incorrect
5. Preserve any custom hints or notes that add value
6. Ensure changes match surrounding code style

---

This guide represents the exact documentation style used in Valibot. Following these patterns ensures consistency, maintainability, and an excellent developer experience for library users.
