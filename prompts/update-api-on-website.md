# Guide: Updating Existing API Reference Routes

This guide provides comprehensive instructions for AI agents to update existing API reference routes when the source code in the Valibot library changes. Maintaining accuracy and consistency with the source code is critical.

## Table of Contents

1. [Overview](#overview)
2. [When to Update](#when-to-update)
3. [Understanding Changes](#understanding-changes)
4. [Update Process](#update-process)
5. [Types of Changes](#types-of-changes)
6. [Verification Steps](#verification-steps)
7. [Common Scenarios](#common-scenarios)
8. [Best Practices](#best-practices)

## Overview

API documentation must always stay synchronized with the source code. When functions, types, or interfaces change in `/library/src/`, the corresponding documentation in `/website/src/routes/api/` must be updated to reflect those changes.

**Key Principle**: The source code is the single source of truth. Documentation should never deviate from what's actually implemented.

## When to Update

Update API documentation when:

1. **Function signatures change**

   - New parameters added or removed
   - Parameter types change
   - Generic constraints change
   - Return types change

2. **Interfaces change**

   - New properties added to Issue or Schema interfaces
   - Existing properties modified
   - Properties removed (rare)

3. **JSDoc comments change**

   - Function descriptions updated
   - Parameter descriptions updated
   - Hints about related functions change

4. **Behavior changes**

   - Validation logic changes requiring example updates
   - Error messages change
   - Default values change

5. **Deprecations or renames**
   - Functions deprecated in favor of alternatives
   - Functions renamed (requires route migration)

**Do NOT update when**:

- Only internal implementation details change (the `~run` method)
- Private or internal functions change
- Test files change
- Comments that aren't JSDoc change

## Understanding Changes

Before making updates, you must understand what changed and why.

### Step 1: Compare Source Code

Use git diff or file comparison to see what changed in the source file:

```bash
# See what changed in a specific file
git diff HEAD~1 library/src/schemas/string/string.ts

# Or compare current working tree with last commit
git diff library/src/schemas/string/string.ts
```

### Step 2: Identify Change Categories

Categorize the changes:

- **Breaking changes**: Signature changes, removed parameters, type changes
- **Additions**: New parameters, new overloads, new properties
- **Documentation changes**: JSDoc updates, description improvements
- **Behavioral changes**: Logic changes that affect usage

### Step 3: Find Affected Documentation

Locate the documentation files:

- `/website/src/routes/api/(category)/functionName/properties.ts`
- `/website/src/routes/api/(category)/functionName/index.mdx`
- Related type documentation if interfaces changed

## Update Process

Follow these steps to update documentation:

### Step 1: Read Current Source Code

Read the **entire** current source file to understand the new state:

```typescript
// Read the updated source file
/library/src/schemas/string/string.ts
/library/src/actions/minLength/minLength.ts
/library/src/methods/parse/parse.ts
```

Extract:

- Updated interfaces and types
- Updated function signatures
- Updated JSDoc comments
- Any new related types

### Step 2: Read Current Documentation

Read the existing documentation to understand what needs updating:

```typescript
/website/src/routes/api/(category)/functionName/properties.ts
/website/src/routes/api/(category)/functionName/index.mdx
```

### Step 3: Identify Discrepancies

Compare source code with documentation:

1. **Check properties.ts**:

   - Do generic types match?
   - Do parameter types match?
   - Do return types match?
   - Are all links still valid?

2. **Check index.mdx**:
   - Does the function signature match?
   - Is the description accurate?
   - Do examples still work?
   - Are related APIs still relevant?

### Step 4: Update properties.ts

Update type definitions to match the new source code:

```typescript
// Before (old source code)
export function string(): StringSchema<undefined>;

// After (new source code with required parameter)
export function string<TMessage>(message: TMessage): StringSchema<TMessage>;

// Update properties.ts accordingly
// Remove the optional pattern, make message required
```

**Critical**: Ensure every generic, parameter, and return type exactly matches the source.

### Step 5: Update index.mdx

Update documentation content:

1. **Front matter**: Update `source` path if file moved
2. **Function signature**: Update to match new signature exactly
3. **Generics section**: Add/remove/update generic documentation
4. **Parameters section**: Add/remove/update parameter documentation
5. **Explanation**: Update if behavior changed
6. **Examples**: Update if API usage changed
7. **Related section**: Add/remove related APIs if applicable

### Step 6: Update Related Type Documentation

If interfaces changed, update type documentation:

- Issue interfaces (e.g., `StringIssue`)
- Schema/Action interfaces (e.g., `StringSchema`)
- Helper types if they changed

### Step 7: Verify Examples

Ensure all code examples:

- Still compile with the new signature
- Follow current best practices
- Use the new API correctly
- Include any new parameters

### Step 8: Update Related Files (if needed)

Check if other files need updates:

- `menu.md` if the function was renamed or moved
- Guide files if usage patterns changed significantly
- Related API documentation if changes affect them

## Types of Changes

### Adding a New Parameter

**Source Code Change**:

```typescript
// Before
export function minLength<TInput, TRequirement>(
  requirement: TRequirement
): MinLengthAction<TInput, TRequirement, undefined>;

// After (added message parameter)
export function minLength<TInput, TRequirement>(
  requirement: TRequirement
): MinLengthAction<TInput, TRequirement, undefined>;

export function minLength<TInput, TRequirement, TMessage>(
  requirement: TRequirement,
  message: TMessage
): MinLengthAction<TInput, TRequirement, TMessage>;
```

**Documentation Updates**:

1. **properties.ts**: Add the new generic and parameter

```typescript
// Add TMessage generic
TMessage: {
  modifier: 'extends',
  type: {
    type: 'union',
    options: [
      {
        type: 'custom',
        name: 'ErrorMessage',
        href: '../ErrorMessage/',
        generics: [{ type: 'custom', name: 'MinLengthIssue', href: '../MinLengthIssue/' }],
      },
      'undefined',
    ],
  },
},
// Add message parameter
message: {
  type: {
    type: 'custom',
    name: 'TMessage',
  },
},
```

2. **index.mdx**: Update signature and add parameter documentation

````mdx
```ts
// Before
const Action = v.minLength<TInput, TRequirement>(requirement);

// After
const Action = v.minLength<TInput, TRequirement, TMessage>(requirement, message);
```
````

## Parameters

- `requirement` <Property {...properties.requirement} />
- `message` <Property {...properties.message} />

3. **Update examples** to show the new parameter in use

### Removing a Parameter (Breaking Change)

**Source Code Change**:

```typescript
// Before
export function parse<TSchema>(
  schema: TSchema,
  input: unknown,
  config?: Config
): InferOutput<TSchema>;

// After (config removed)
export function parse<TSchema>(
  schema: TSchema,
  input: unknown
): InferOutput<TSchema>;
```

**Documentation Updates**:

1. **properties.ts**: Remove the parameter

```typescript
// Remove the config property entirely
```

2. **index.mdx**: Update signature and remove parameter documentation

````mdx
```ts
// Update signature
const output = v.parse<TSchema>(schema, input);
```
````

## Parameters

- `schema` <Property {...properties.schema} />
- `input` <Property {...properties.input} />

3. **Update explanation** to mention the breaking change if needed
4. **Update all examples** to remove the parameter

### Changing Parameter Types

**Source Code Change**:

```typescript
// Before
TRequirement extends number

// After
TRequirement extends number | string
```

**Documentation Updates**:

1. **properties.ts**: Update the type constraint

```typescript
TRequirement: {
  modifier: 'extends',
  type: {
    type: 'union',
    options: ['number', 'string'],
  },
},
```

2. **index.mdx**: Update explanation to mention both types are supported
3. **Add new examples** showing string requirements

### Adding Interface Properties

**Source Code Change**:

```typescript
// Before
export interface StringIssue extends BaseIssue<unknown> {
  readonly kind: 'schema';
  readonly type: 'string';
  readonly expected: 'string';
}

// After (added received property)
export interface StringIssue extends BaseIssue<unknown> {
  readonly kind: 'schema';
  readonly type: 'string';
  readonly expected: 'string';
  readonly received: string;
}
```

**Documentation Updates**:

1. Update type documentation for `StringIssue`:

```typescript
// In /website/src/routes/api/(types)/StringIssue/properties.ts
// Add the new property
received: {
  type: 'string',
},
```

2. Update the type's index.mdx to document the new property

### Updating JSDoc Descriptions

**Source Code Change**:

```typescript
// Before
/**
 * Creates a string schema.
 */

// After
/**
 * Creates a string schema that validates string data types.
 *
 * @param message The custom error message for invalid inputs.
 */
```

**Documentation Updates**:

1. **index.mdx**: Update the main description

```mdx
# string

Creates a string schema that validates string data types.
```

2. Update the Explanation section if the JSDoc provides more context

### Changing Related Functions (Hints)

**Source Code Change**:

```typescript
// Before
/**
 * Hint: Use `looseObject` for unknown entries.
 */

// After
/**
 * Hint: Use `looseObject` for unknown entries or `strictObject` to reject them.
 */
```

**Documentation Updates**:

1. **index.mdx**: Update blockquote in Explanation

```mdx
> To include unknown entries, use <Link href="../looseObject/">`looseObject`</Link> or <Link href="../strictObject/">`strictObject`</Link> to reject them.
```

2. **Add to Related section** if not already there

### Function Renamed

**Source Code Change**:

```typescript
// Before: /library/src/methods/flatten/flatten.ts
export function flatten() { ... }

// After: Renamed to flattenIssues
// /library/src/methods/flattenIssues/flattenIssues.ts
export function flattenIssues() { ... }
```

**Documentation Updates**:

1. **Rename the folder**:

   ```bash
   mv /website/src/routes/api/(methods)/flatten \
      /website/src/routes/api/(methods)/flattenIssues
   ```

2. **Update properties.ts** with new name references

3. **Update index.mdx**:

   - Change title in frontmatter
   - Change all occurrences of `flatten` to `flattenIssues`
   - Update function signature

4. **Update menu.md**: Replace old name with new name (maintain alphabetical order)

5. **Update guide files**: Replace references to old name

6. **Update related API docs**: Update cross-references in other API pages

7. **Consider adding redirect** or deprecation notice if needed

## Verification Steps

After making updates, verify:

### 1. Source Code Accuracy

- [ ] All generic constraints match source code exactly
- [ ] All parameter types match source code exactly
- [ ] Return type matches source code exactly
- [ ] Function signature is identical to source (parameter names, order, types)

### 2. Type Links

- [ ] All `href` links point to existing or newly created type documentation
- [ ] Generic type references use correct names (match source code)
- [ ] No broken links to removed types

### 3. Examples

- [ ] All examples use the updated API correctly
- [ ] Examples compile with new signature
- [ ] Examples follow current patterns
- [ ] New features are demonstrated in examples

### 4. Consistency

- [ ] Tone and style match other documentation
- [ ] Naming conventions are maintained
- [ ] Error messages in examples follow patterns
- [ ] Related section includes all relevant APIs

### 5. Completeness

- [ ] All new parameters documented
- [ ] All new generics documented
- [ ] Breaking changes explained
- [ ] New related types documented

### 6. Related Files

- [ ] `menu.md` updated if needed
- [ ] Guide files updated if usage changed
- [ ] Related API docs updated if they reference this API
- [ ] Type documentation updated for changed interfaces

## Common Scenarios

### Scenario 1: Optional Parameter Becomes Required

**What Changed**:

```typescript
// Before: message is optional (two overloads)
export function string(): StringSchema<undefined>;
export function string<TMessage>(message: TMessage): StringSchema<TMessage>;

// After: message is required (one overload)
export function string<TMessage>(message: TMessage): StringSchema<TMessage>;
```

**Update Steps**:

1. Remove the first overload pattern from documentation
2. Update function signature to show message as required
3. Remove default value mention in Explanation
4. Update all examples to include the message parameter
5. Note this as a breaking change in explanation if appropriate

### Scenario 2: New Generic Constraint Added

**What Changed**:

```typescript
// Before
TInput

// After
TInput extends string | number
```

**Update Steps**:

1. Update the generic documentation in properties.ts
2. Add explanation about what types are now supported
3. Add examples demonstrating both string and number usage
4. Update related types if they reference this generic

### Scenario 3: Return Type Changed

**What Changed**:

```typescript
// Before
: StringSchema<TMessage>

// After
: StringSchema<TMessage, TDefault>
```

**Update Steps**:

1. Add the new generic to properties.ts
2. Update the Schema property with new generic parameter
3. Update function signature in index.mdx
4. Add new generic to Generics section
5. Explain the new generic in documentation
6. Update or add examples showing the new capability

### Scenario 4: Deprecation Warning Added

**What Changed**:

```typescript
// Before
export function flatten() { ... }

// After
/**
 * @deprecated Use `flattenIssues` instead. This function will be removed in v2.0.
 */
export function flatten() { ... }
```

**Update Steps**:

1. Add deprecation notice at the top of index.mdx (after description):
   ```mdx
   > **⚠️ Deprecated**: Use <Link href="../flattenIssues/">`flattenIssues`</Link> instead. This function will be removed in v2.0.
   ```
2. Add link to replacement in Related section
3. Consider updating examples to show migration path
4. Do NOT remove from menu.md until actually removed

### Scenario 5: New Validation Added to Action

**What Changed**:

```typescript
// Before: minLength only checks length
'~run'(dataset, config) {
  if (dataset.value.length < this.requirement) {
    _addIssue(this, 'length', dataset, config);
  }
}

// After: minLength also validates type
'~run'(dataset, config) {
  if (!dataset.typed) {
    _addIssue(this, 'type', dataset, config);
  } else if (dataset.value.length < this.requirement) {
    _addIssue(this, 'length', dataset, config);
  }
}
```

**Update Steps**:

1. Update Explanation if behavior meaningfully changed
2. Examples likely don't need updating (internal implementation)
3. Only update if the change affects user-facing behavior

### Scenario 6: Error Message Format Changed

**What Changed**:

```typescript
// Before
expected: `>=${requirement}`;

// After
expected: `>=${requirement} characters`;
```

**Update Steps**:

1. Usually no documentation update needed (internal)
2. If error messages are shown in examples, consider updating them
3. If this is a significant user-facing change, mention in Explanation

### Scenario 7: New Helper Type Introduced

**What Changed**:

```typescript
// Before
TInput extends string | unknown[]

// After
TInput extends LengthInput  // where LengthInput = string | ArrayLike<unknown>
```

**Update Steps**:

1. Update properties.ts to reference the new type:
   ```typescript
   TInput: {
     modifier: 'extends',
     type: {
       type: 'custom',
       name: 'LengthInput',
       href: '../LengthInput/',
     },
   },
   ```
2. Create documentation for the new helper type
3. Update explanation if the supported types changed

### Scenario 8: Multiple Overloads Added

**What Changed**:

```typescript
// Before: 1 overload
export function transform<TInput, TOutput>(
  operation: (input: TInput) => TOutput
): TransformAction<TInput, TOutput>;

// After: 2 overloads for sync and async
export function transform<TInput, TOutput>(
  operation: (input: TInput) => TOutput
): TransformAction<TInput, TOutput>;

export function transform<TInput, TOutput>(
  operation: (input: TInput) => Promise<TOutput>
): TransformActionAsync<TInput, TOutput>;
```

**Update Steps**:

1. Update properties.ts if new generics or parameters
2. Update function signature to show all overloads or the most general one
3. Add explanation about sync vs async usage
4. Add examples demonstrating both use cases
5. Update Related section to include async schemas if relevant

## Best Practices

### 1. Always Read Full Source File

Don't just look at the diff - read the entire updated source file to understand the complete context.

### 2. Verify Examples Actually Work

After updating, mentally (or actually) trace through examples to ensure they work with the new API.

### 3. Maintain Backward Compatibility Notes

If the change is breaking, add a note explaining:

- What changed
- How to migrate
- Why it changed (if helpful)

### 4. Update Incrementally

Update one section at a time:

1. First, update properties.ts (types)
2. Then, update index.mdx (documentation)
3. Then, update related files
4. Finally, verify everything

### 5. Check Related APIs

If a function's signature changes, related functions might reference it. Update those references too.

### 6. Preserve Examples Quality

When updating examples:

- Keep them realistic and practical
- Maintain consistent naming conventions
- Ensure they demonstrate best practices
- Add examples for new features

### 7. Don't Over-Document Internal Changes

If changes are purely internal (implementation details), don't clutter documentation with them. Focus on user-facing changes.

### 8. Link to Migration Guides

For breaking changes, consider linking to a migration guide if one exists.

### 9. Test Links

After updating, verify all links still work:

- Type links (href in properties.ts)
- Cross-references in index.mdx
- Links to related APIs

### 10. Match Source Code Style

If source code uses specific terminology or naming, use the same in documentation.

## Quick Reference Checklist

Use this checklist for every update:

### Pre-Update

- [ ] Read the git diff or change description
- [ ] Read the complete updated source file
- [ ] Identify what type of changes occurred
- [ ] Locate all affected documentation files

### Update properties.ts

- [ ] Update generic constraints if changed
- [ ] Add/remove/update parameter types
- [ ] Update return type if changed
- [ ] Fix any broken type links
- [ ] Add new type links if needed

### Update index.mdx

- [ ] Update function signature
- [ ] Update Generics section
- [ ] Update Parameters section
- [ ] Update Explanation if behavior changed
- [ ] Update or add examples
- [ ] Update Related section
- [ ] Add deprecation notice if needed

### Update Related Files

- [ ] Update type documentation for changed interfaces
- [ ] Update menu.md if function renamed/moved
- [ ] Update guide files if usage patterns changed
- [ ] Update related API docs that reference this function

### Verification

- [ ] All types match source code exactly
- [ ] All examples work with new API
- [ ] All links are valid
- [ ] Documentation is clear and accurate
- [ ] Style and tone are consistent
- [ ] No typos or grammar errors

## When to Ask for Help

Ask for human review if:

1. **Major breaking changes**: Complete signature overhaul
2. **Complex type changes**: Significant generic constraint changes
3. **Unclear intent**: Can't determine why change was made
4. **Multiple related changes**: Many files affected
5. **Migration needed**: Need to document migration path
6. **Deprecation**: Need to plan deprecation timeline
7. **Uncertainty**: Not sure if documentation accurately reflects changes

## Example: Complete Update Process

Let's walk through updating `minLength` when a new parameter is added.

### 1. Source Code Change

```typescript
// BEFORE (in /library/src/actions/minLength/minLength.ts)
export function minLength<
  TInput extends LengthInput,
  const TRequirement extends number,
>(requirement: TRequirement): MinLengthAction<TInput, TRequirement, undefined>;

// AFTER (added message parameter)
export function minLength<
  TInput extends LengthInput,
  const TRequirement extends number,
>(requirement: TRequirement): MinLengthAction<TInput, TRequirement, undefined>;

export function minLength<
  TInput extends LengthInput,
  const TRequirement extends number,
  const TMessage extends
    | ErrorMessage<MinLengthIssue<TInput, TRequirement>>
    | undefined,
>(
  requirement: TRequirement,
  message: TMessage
): MinLengthAction<TInput, TRequirement, TMessage>;
```

### 2. Identify Changes

- **Type**: Addition (new optional parameter)
- **Breaking**: No (parameter is optional)
- **Impact**: Medium (examples should demonstrate new parameter)

### 3. Update properties.ts

```typescript
// Add to /website/src/routes/api/(actions)/minLength/properties.ts

// Add new generic
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
          {
            type: 'custom',
            name: 'MinLengthIssue',
            href: '../MinLengthIssue/',
            generics: [
              { type: 'custom', name: 'TInput' },
              { type: 'custom', name: 'TRequirement' },
            ],
          },
        ],
      },
      'undefined',
    ],
  },
},

// Add new parameter
message: {
  type: {
    type: 'custom',
    name: 'TMessage',
  },
},

// Update Action to include new generic
Action: {
  type: {
    type: 'custom',
    name: 'MinLengthAction',
    href: '../MinLengthAction/',
    generics: [
      { type: 'custom', name: 'TInput' },
      { type: 'custom', name: 'TRequirement' },
      { type: 'custom', name: 'TMessage' },  // Added
    ],
  },
},
```

### 4. Update index.mdx

````mdx
<!-- Update function signature -->

```ts
const Action = v.minLength<TInput, TRequirement, TMessage>(
  requirement,
  message // Added
);
```
````

<!-- Add to Generics section -->

## Generics

- `TInput` <Property {...properties.TInput} />
- `TRequirement` <Property {...properties.TRequirement} />
- `TMessage` <Property {...properties.TMessage} /> <!-- Added -->

<!-- Add to Parameters section -->

## Parameters

- `requirement` <Property {...properties.requirement} />
- `message` <Property {...properties.message} /> <!-- Added -->

### Explanation

With `minLength` you can validate the length of a string or array. If the input does not match the `requirement`, you can use `message` to customize the error message. <!-- Updated -->

<!-- Update examples to use message parameter -->

### Minimum string length

Schema to validate a string with a minimum length of 3 characters.

```ts
const MinStringSchema = v.pipe(
  v.string(),
  v.minLength(3, 'The string must be 3 or more characters long.') // Added message
);
```

### 5. Verify

- [x] Source code read completely
- [x] Generic added to properties.ts with correct constraint
- [x] Parameter added to properties.ts
- [x] Return type updated with new generic
- [x] Function signature updated in index.mdx
- [x] Generic documented in Generics section
- [x] Parameter documented in Parameters section
- [x] Explanation mentions the new parameter
- [x] Examples use the new parameter
- [x] All links are valid
- [x] Style is consistent

### 6. Complete

The documentation now accurately reflects the source code with the new optional `message` parameter.

---

This guide should be followed carefully to ensure documentation stays synchronized with source code changes while maintaining consistency and quality across all API documentation.
