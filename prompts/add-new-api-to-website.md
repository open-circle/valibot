# Guide: Adding a New API Reference Route to Valibot Website

This guide provides comprehensive instructions for AI agents to add new API reference routes to the Valibot website. Consistency and uniformity across all API documentation is critical.

## Table of Contents

1. [Overview](#overview)
2. [Understanding the Structure](#understanding-the-structure)
3. [The Property Component](#the-property-component)
4. [Step-by-Step Process](#step-by-step-process)
5. [Reading Source Code Patterns](#reading-source-code-patterns)
6. [File Structure](#file-structure)
7. [Creating properties.ts](#creating-propertiests)
8. [Creating index.mdx](#creating-indexmdx)
9. [Updating Related Files](#updating-related-files)
10. [Writing Examples](#writing-examples)
11. [Best Practices](#best-practices)
12. [Complete Example: From Source to Documentation](#complete-example-from-source-to-documentation)

## Overview

API routes in the Valibot website are organized into categories within the `/website/src/routes/api/` directory. Each API function or type has its own folder containing:

- `index.mdx` - The main documentation file with MDX content
- `properties.ts` - TypeScript definitions that map to the Property component

Categories include:

- `(schemas)` - Schema functions like `string`, `number`, `object`, `array`
- `(actions)` - Validation and transformation actions like `minLength`, `email`, `transform`
- `(methods)` - Utility methods like `parse`, `safeParse`, `is`, `pipe`
- `(types)` - TypeScript type definitions like `StringSchema`, `ErrorMessage`
- `(utils)` - Utility functions
- `(async)` - Async variants of schemas and methods
- `(storages)` - Storage-related utilities

## Understanding the Structure

### Folder Naming Convention

API routes use parentheses for category folders (e.g., `(schemas)`, `(actions)`) and camelCase for individual API folders:

```
/website/src/routes/api/
  (schemas)/
    string/
      index.mdx
      properties.ts
    object/
      index.mdx
      properties.ts
  (actions)/
    minLength/
      index.mdx
      properties.ts
    email/
      index.mdx
      properties.ts
  (methods)/
    parse/
      index.mdx
      properties.ts
```

### Route Organization

Routes are organized by their primary purpose:

- **Schemas** create validation schemas for data types
- **Actions** validate or transform data within pipelines
- **Methods** provide utility functions to work with schemas
- **Types** document TypeScript interfaces and types

## The Property Component

The `Property` component (`/website/src/components/Property.tsx`) renders TypeScript type definitions with syntax highlighting. It accepts a `PropertyProps` object with:

```typescript
type PropertyProps = {
  modifier?: string; // e.g., 'extends', 'readonly', 'typeof'
  type: DefinitionData; // The type definition
  default?: DefinitionData; // Optional default value
};
```

### DefinitionData Types

`DefinitionData` is a union type that mirrors TypeScript's type system:

#### Primitive Types

```typescript
'string' |
  'symbol' |
  'number' |
  'bigint' |
  'boolean' |
  'null' |
  'undefined' |
  'void' |
  'never' |
  'any' |
  'unknown';
```

#### Literal Values

```typescript
{
  type: 'string';
  value: string;
}
{
  type: 'number';
  value: number;
}
{
  type: 'bigint';
  value: number;
}
{
  type: 'boolean';
  value: boolean;
}
```

#### Object Type

```typescript
{
  type: 'object';
  entries: {
    key: string | { name: string; modifier?: string; type?: DefinitionData };
    optional?: boolean;
    value: DefinitionData;
  }[];
}
```

#### Array Type

```typescript
{
  type: 'array';
  modifier?: string;      // e.g., 'readonly'
  spread?: boolean;       // for ...rest
  item: DefinitionData;
}
```

#### Tuple Type

```typescript
{
  type: 'tuple';
  modifier?: string;
  items: DefinitionData[];
}
```

#### Function Type

```typescript
{
  type: 'function';
  params: {
    spread?: boolean;
    name: string;
    optional?: boolean;
    type: DefinitionData;
  }[];
  return: DefinitionData;
}
```

#### Template Literal Type

```typescript
{
  type: 'template';
  parts: DefinitionData[];  // Mix of { type: 'string', value: string } and other types
}
```

#### Union Type

```typescript
{
  type: 'union';
  options: [DefinitionData, DefinitionData, ...DefinitionData[]];
}
```

#### Intersect Type

```typescript
{
  type: 'intersect';
  options: [DefinitionData, DefinitionData, ...DefinitionData[]];
}
```

#### Conditional Type

```typescript
{
  type: 'conditional';
  conditions: {
    type: DefinitionData;
    extends: DefinitionData;
    true: DefinitionData;
  }[];
  false: DefinitionData;
}
```

#### Custom Type (Named Types)

```typescript
{
  type: 'custom';
  modifier?: string;       // e.g., 'readonly', 'typeof'
  spread?: boolean;
  name: string;           // Type name
  href?: string;          // Link to type documentation (relative, e.g., '../TypeName/')
  generics?: DefinitionData[];   // Generic type parameters
  indexes?: DefinitionData[];    // Index signatures [key: type]
}
```

### Property Component Usage

In `properties.ts`, define properties that will be used in the MDX:

```typescript
import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
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
              name: 'StringIssue',
              href: '../StringIssue/',
            },
          ],
        },
        'undefined',
      ],
    },
  },
  message: {
    type: {
      type: 'custom',
      name: 'TMessage',
    },
  },
};
```

## Step-by-Step Process

### Step 1: Identify the API Function

Before creating a new route, identify:

1. **Category**: Is it a schema, action, method, type, or utility?
2. **Name**: The exact function/type name (camelCase)
3. **Source file**: Path to the source code in the library
4. **Dependencies**: Related types, schemas, or actions

### Step 2: Read and Analyze the Source Code

**This is the most critical step.** All API documentation is derived directly from the source code in `/library/src/`.

#### Source Code Structure

The library source is organized as:

```
/library/src/
  schemas/        - Schema functions (string, object, array, etc.)
    string/
      string.ts   - Main implementation
      index.ts    - Re-exports
  actions/        - Validation and transformation actions
    minLength/
      minLength.ts
      index.ts
  methods/        - Utility methods (parse, safeParse, etc.)
    parse/
      parse.ts
      index.ts
  types/          - Shared TypeScript types and interfaces
  utils/          - Internal utilities
```

#### What to Extract from Source Code

When reading the source file (e.g., `/library/src/schemas/string/string.ts`), extract:

1. **Interfaces and Types**
   - Look for the main Issue interface (e.g., `StringIssue`)
   - Look for the main Schema/Action interface (e.g., `StringSchema`, `MinLengthAction`)
   - Note all generic parameters and their constraints
   - Note all interface properties

2. **Function Overloads**
   - The source includes multiple function signatures for different parameter combinations
   - Document each overload's parameters
   - The last signature is usually the most generic

3. **JSDoc Comments**
   - Extract the description from JSDoc comments above the function
   - These often contain hints about usage and alternatives
   - For schemas like `object`, comments may mention related schemas (`looseObject`, `strictObject`)

4. **Generic Constraints**
   - Note `extends` clauses on generic parameters
   - Common patterns:
     - `TMessage extends ErrorMessage<SomeIssue> | undefined`
     - `TInput extends LengthInput`
     - `TRequirement extends number`

5. **Return Types**
   - The interface name (e.g., `StringSchema<TMessage>`)
   - All generic parameters passed through

#### Example: Deriving from string.ts

From `/library/src/schemas/string/string.ts`:

```typescript
export interface StringIssue extends BaseIssue<unknown> {
  readonly kind: 'schema';
  readonly type: 'string';
  readonly expected: 'string';
}

export interface StringSchema<
  TMessage extends ErrorMessage<StringIssue> | undefined,
> extends BaseSchema<string, string, StringIssue> {
  readonly type: 'string';
  readonly reference: typeof string;
  readonly expects: 'string';
  readonly message: TMessage;
}

export function string(): StringSchema<undefined>;
export function string<
  const TMessage extends ErrorMessage<StringIssue> | undefined,
>(message: TMessage): StringSchema<TMessage>;
```

**Extract**:

- Generic: `TMessage extends ErrorMessage<StringIssue> | undefined`
- Parameter: `message: TMessage` (optional, shown by overload)
- Return: `StringSchema<TMessage>`
- Related type: `StringIssue`

#### Example: Deriving from minLength.ts

From `/library/src/actions/minLength/minLength.ts`:

```typescript
export interface MinLengthIssue<
  TInput extends LengthInput,
  TRequirement extends number,
> extends BaseIssue<TInput> {
  readonly kind: 'validation';
  readonly type: 'min_length';
  readonly expected: `>=${TRequirement}`;
  readonly requirement: TRequirement;
}

export interface MinLengthAction<...> {
  readonly type: 'min_length';
  readonly reference: typeof minLength;
  readonly requirement: TRequirement;
  readonly message: TMessage;
}

export function minLength<...>(requirement: TRequirement): MinLengthAction<...>;
export function minLength<...>(requirement: TRequirement, message: TMessage): MinLengthAction<...>;
```

**Extract**:

- Generics: `TInput extends LengthInput`, `TRequirement extends number`, `TMessage extends ErrorMessage<...> | undefined`
- Parameters: `requirement: TRequirement`, `message: TMessage` (optional)
- Return: `MinLengthAction<TInput, TRequirement, TMessage>`
- Related type: `MinLengthIssue<TInput, TRequirement>`, `LengthInput`

#### Example: Deriving from object.ts

From `/library/src/schemas/object/object.ts`, note the JSDoc:

```typescript
/**
 * Creates an object schema.
 *
 * Hint: This schema removes unknown entries. The output will only include the
 * entries you specify. To include unknown entries, use `looseObject`. To
 * return an issue for unknown entries, use `strictObject`. To include and
 * validate unknown entries, use `objectWithRest`.
 *
 * @param entries The entries schema.
 * @param message The error message.
 *
 * @returns An object schema.
 */
```

**Use this in documentation**: The hint becomes a blockquote in the Explanation section, mentions of related schemas go in the Related section.

#### Special Considerations

1. **Source Path**: Use the relative path from `/library/src/` for the `source` field in frontmatter:
   - `string.ts` → `source: /schemas/string/string.ts`
   - `minLength.ts` → `source: /actions/minLength/minLength.ts`
   - `parse.ts` → `source: /methods/parse/parse.ts`

2. **Type Documentation**: If documenting a type (not a function), the source file defines the interface structure:
   - Properties become documentation entries
   - Use literal types where specified (e.g., `type: 'string'`)
   - Reference the parent interface with `extends`

3. **Async Variants**: If there's an async version, it's usually in a separate file or has `Async` suffix

### Step 4: Create the Folder Structure

Create a new folder in the appropriate category:

```bash
mkdir -p /website/src/routes/api/(category)/functionName
```

Example for a schema:

```bash
mkdir -p /website/src/routes/api/(schemas)/email
```

### Step 6: Create properties.ts

Create `/website/src/routes/api/(category)/functionName/properties.ts` based on the source code analysis:

```typescript
import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  // Map source code types to DefinitionData format
};
```

**Mapping Process**:

1. For each generic parameter, create an entry with `modifier: 'extends'`
2. For each function parameter, create an entry matching its type
3. For the return type, create an entry (usually named `Schema`, `Action`, or `output`)
4. Reference custom types with `href: '../TypeName/'` for cross-linking

See [Creating properties.ts](#creating-propertiests) for detailed mapping patterns.

### Step 7: Create index.mdx

Create `/website/src/routes/api/(category)/functionName/index.mdx` with the standard structure.

**Important**:

- Use JSDoc comments from source as the basis for the description and explanation
- Convert hints about related functions into blockquotes with links
- Ensure the function signature matches the source code exactly

### Step 9: Update Related Files

1. Update `/website/src/routes/api/menu.md`
2. Update guide files if applicable:
   - `/website/src/routes/guides/(main-concepts)/schemas/index.mdx` for schemas
   - `/website/src/routes/guides/(main-concepts)/pipelines/index.mdx` for actions

### Step 10: Create Related Types (if needed)

If the function introduces new types (e.g., `EmailSchema`, `EmailIssue`), create routes for those types in the `(types)` category.

**From source code**: Look for exported interfaces:

- Issue interfaces (e.g., `StringIssue`, `MinLengthIssue`)
- Schema/Action interfaces (e.g., `StringSchema`, `MinLengthAction`)

These should have their own type documentation pages.

## Reading Source Code Patterns

### Common Source Code Structures

Understanding common patterns in the source code will help you extract information accurately.

#### Schema Pattern

Schemas follow this structure in `/library/src/schemas/[name]/[name].ts`:

```typescript
// 1. Issue interface
export interface [Name]Issue extends BaseIssue<unknown> {
  readonly kind: 'schema';
  readonly type: '[name]';
  readonly expected: 'string literal';
}

// 2. Schema interface
export interface [Name]Schema<
  TMessage extends ErrorMessage<[Name]Issue> | undefined,
> extends BaseSchema<InputType, OutputType, [Name]Issue> {
  readonly type: '[name]';
  readonly reference: typeof [name];
  readonly expects: 'string literal';
  readonly message: TMessage;
}

// 3. Function overloads (for optional parameters)
export function [name](): [Name]Schema<undefined>;
export function [name]<
  const TMessage extends ErrorMessage<[Name]Issue> | undefined,
>(message: TMessage): [Name]Schema<TMessage>;

// 4. Implementation (ignore for documentation purposes)
export function [name](message?: ErrorMessage<[Name]Issue>) { ... }
```

**Key points**:

- Extract Issue and Schema interfaces for type documentation
- Use function overloads to determine which parameters are optional
- The `reference` field always points to the function itself
- The `expects` field is a human-readable string shown in errors

#### Action Pattern

Actions (validations and transformations) follow this structure in `/library/src/actions/[name]/[name].ts`:

```typescript
// 1. Issue interface (for validations, not transformations)
export interface [Name]Issue<TInput, TRequirement> extends BaseIssue<TInput> {
  readonly kind: 'validation';
  readonly type: '[name]';
  readonly expected: string; // Often a template literal
  readonly requirement: TRequirement;
}

// 2. Action interface
export interface [Name]Action<
  TInput,
  TOutput, // Same as TInput for validations
  TMessage extends ErrorMessage<[Name]Issue<...>> | undefined,
> extends BaseValidation<TInput, TOutput, [Name]Issue<...>> {
  readonly type: '[name]';
  readonly reference: typeof [name];
  readonly requirement?: TRequirement; // If applicable
  readonly message?: TMessage; // For validations
}

// 3. Function overloads
export function [name]<TInput, TRequirement>(
  requirement: TRequirement
): [Name]Action<TInput, TRequirement, undefined>;

export function [name]<TInput, TRequirement, TMessage>(
  requirement: TRequirement,
  message: TMessage
): [Name]Action<TInput, TRequirement, TMessage>;
```

**Key points**:

- Validation actions have Issue interfaces, transformations don't
- Generic constraints often include helper types like `LengthInput`, `ContentInput`
- Many actions have a `requirement` parameter (min/max values, patterns, etc.)

#### Method Pattern

Methods follow this structure in `/library/src/methods/[name]/[name].ts`:

```typescript
/**
 * JSDoc description here.
 *
 * @param schema The schema to be used.
 * @param input The input to be parsed.
 * @param config Optional configuration.
 *
 * @returns The result.
 */
export function [name]<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
  input: unknown,
  config?: Config<InferIssue<TSchema>>
): InferOutput<TSchema> {
  // Implementation
}
```

**Key points**:

- Methods often use utility types like `InferOutput`, `InferIssue`, `InferInput`
- JSDoc comments provide parameter descriptions
- Config parameters are usually optional

#### Type Helper Patterns

Common type constraints found in source code:

```typescript
// Input constraints
TInput extends LengthInput              // For length-based actions (string | array)
TInput extends ContentInput             // For content-based actions
TInput extends ArrayInput               // For array operations
TInput extends EntriesInput             // For object operations
TInput extends SizeInput                // For size-based validations

// Generic message pattern (appears in almost all schemas/actions)
TMessage extends ErrorMessage<SomeIssue> | undefined

// Requirement constraints
TRequirement extends number             // For numeric requirements
TRequirement extends string             // For string requirements

// Schema constraints
TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>
TEntries extends ObjectEntries
TItems extends TupleItems
```

**Documentation**: When you see these constraints, look up the type definition (e.g., `LengthInput` in `/library/src/actions/types.ts`) to understand what inputs are supported.

### Extracting JSDoc Information

JSDoc comments in source code provide documentation content:

#### Description Extraction

```typescript
/**
 * Creates a string schema.  // ← Use as main description
 *
 * @param message The error message.  // ← Use in Parameters explanation
 *
 * @returns A string schema.  // ← Confirms return type
 */
```

#### Hints and Notes

Some schemas include hints about alternatives:

```typescript
/**
 * Creates an object schema.
 *
 * Hint: This schema removes unknown entries. The output will only include the
 * entries you specify. To include unknown entries, use `looseObject`. To
 * return an issue for unknown entries, use `strictObject`. To include and
 * validate unknown entries, use `objectWithRest`.
 */
```

**Convert to documentation**:

- Use the main description as-is
- Convert hints into blockquotes with links:
  ```mdx
  > This schema removes unknown entries. To include unknown entries, use <Link href="../looseObject/">`looseObject`</Link>.
  ```
- Mentioned functions should be added to the Related section

### Interface Properties for Type Documentation

When documenting types (not functions), extract interface properties:

```typescript
export interface StringSchema<TMessage> extends BaseSchema<...> {
  readonly type: 'string';              // ← Document as literal
  readonly reference: typeof string;    // ← Document with typeof modifier
  readonly expects: 'string';           // ← Document as literal
  readonly message: TMessage;           // ← Document as generic reference
}
```

**In properties.ts**:

```typescript
type: {
  type: { type: 'string', value: 'string' },  // Literal
},
reference: {
  type: {
    type: 'custom',
    modifier: 'typeof',
    name: 'string',
    href: '../string/',
  },
},
expects: {
  type: { type: 'string', value: 'string' },
},
message: {
  type: { type: 'custom', name: 'TMessage' },
},
```

### Finding Related Types

Related types referenced in source code should also be documented:

1. **Import statements**: Check what types are imported

   ```typescript
   import type { LengthInput } from '../types.ts';
   ```

   → `LengthInput` should have a type documentation page

2. **Generic constraints**: Types used in `extends` clauses

   ```typescript
   TInput extends LengthInput
   ```

   → Document `LengthInput`

3. **Issue types**: Referenced in ErrorMessage generics

   ```typescript
   ErrorMessage<MinLengthIssue<TInput, TRequirement>>;
   ```

   → Document `MinLengthIssue`, `ErrorMessage`

4. **Return types**: Schema/Action interfaces
   ```typescript
   MinLengthAction<TInput, TRequirement, TMessage>;
   ```
   → Document `MinLengthAction`

## File Structure

### properties.ts Template

```typescript
import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  // 1. GENERICS (if any)
  // Name them exactly as in the source code (e.g., TMessage, TInput, TOutput)
  TGeneric: {
    modifier: 'extends', // Always 'extends' for generics
    type: {
      // The constraint type
    },
  },

  // 2. PARAMETERS
  // Name them exactly as in the function signature
  paramName: {
    type: {
      // The parameter type (often references a generic like TMessage)
    },
  },

  // 3. RETURN TYPE
  // Usually named 'Schema', 'Action', 'output', etc.
  Schema: {
    type: {
      // The return type
    },
  },

  // 4. TYPE DEFINITION PROPERTIES (for type documentation)
  // Properties of the interface/type being documented
  propertyName: {
    type: {
      // The property type
    },
  },
};
```

### index.mdx Template

````mdx
---
title: functionName
description: Brief one-line description.
source: /path/to/source/file.ts
contributors:
  - github-username
---

import { ApiList, Link, Property } from '~/components';
import { properties } from './properties';

# functionName

Full description of what this function does.

```ts
const Result = v.functionName<TGeneric>(param1, param2);
```
````

## Generics

- `TGeneric` <Property {...properties.TGeneric} />

## Parameters

- `param1` <Property {...properties.param1} />
- `param2` <Property {...properties.param2} />

### Explanation

Detailed explanation of how the function works, when to use it, and any important notes.

> Use blockquotes for important notes or warnings.

## Returns

- `Result` <Property {...properties.Result} />

## Examples

The following examples show how `functionName` can be used.

### Example 1 name

Brief description of what this example demonstrates.

```ts
const ExampleSchema = v.functionName(...);
```

### Example 2 name

Brief description of what this example demonstrates.

```ts
const AnotherExample = v.pipe(
  v.string(),
  v.functionName(...)
);
```

## Related

The following APIs can be combined with `functionName`.

### Schemas

<ApiList
items={[
'string',
'number',
// ... relevant schemas
]}
/>

### Methods

<ApiList
items={[
'pipe',
'parse',
// ... relevant methods
]}
/>

### Actions

<ApiList
items={[
'minLength',
// ... relevant actions
]}
/>

### Utils

<ApiList items={['isOfKind', 'isOfType']} />

````

## Creating properties.ts

### Guidelines for properties.ts

1. **Use exact names**: Property names must match the source code exactly
2. **Order matters**: Define properties in this order:
   - Generics (TMessage, TInput, TOutput, etc.)
   - Function parameters
   - Return type(s)
   - Type properties (for type documentation)

3. **Generic constraints**: Always use `modifier: 'extends'` for generic type parameters

4. **Link to types**: Use `href` to link custom types to their documentation:
   ```typescript
   {
     type: 'custom',
     name: 'ErrorMessage',
     href: '../ErrorMessage/',  // Relative path
   }
````

5. **Common patterns**:

#### Pattern: Optional message parameter

```typescript
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
            name: 'SomeIssue',
            href: '../SomeIssue/',
          },
        ],
      },
      'undefined',
    ],
  },
},
message: {
  type: {
    type: 'custom',
    name: 'TMessage',
  },
},
```

#### Pattern: Generic schema return type

```typescript
Schema: {
  type: {
    type: 'custom',
    name: 'SchemaName',
    href: '../SchemaName/',
    generics: [
      {
        type: 'custom',
        name: 'TGeneric',
      },
    ],
  },
},
```

#### Pattern: Action with requirement

```typescript
TInput: {
  modifier: 'extends',
  type: {
    type: 'custom',
    name: 'InputType',
    href: '../InputType/',
  },
},
TRequirement: {
  modifier: 'extends',
  type: 'number',  // or string, or other primitive
},
requirement: {
  type: {
    type: 'custom',
    name: 'TRequirement',
  },
},
```

#### Pattern: Function type

```typescript
action: {
  type: {
    type: 'function',
    params: [
      {
        name: 'input',
        type: {
          type: 'custom',
          name: 'TInput',
        },
      },
    ],
    return: {
      type: 'custom',
      name: 'TOutput',
    },
  },
},
```

#### Pattern: Object type

```typescript
config: {
  type: {
    type: 'union',
    options: [
      {
        type: 'object',
        entries: [
          {
            key: 'abortEarly',
            optional: true,
            value: 'boolean',
          },
          {
            key: 'abortPipeEarly',
            optional: true,
            value: 'boolean',
          },
        ],
      },
      'undefined',
    ],
  },
},
```

## Creating index.mdx

### Front Matter

Every MDX file must start with YAML front matter:

```yaml
---
title: functionName
description: Brief one-line description ending with a period.
source: /path/to/source/file.ts
contributors:
  - github-username
---
```

- **title**: The function/type name (exact case)
- **description**: One concise sentence describing the purpose
- **source**: Relative path from the library root to the source file
- **contributors**: GitHub usernames of people who contributed to this documentation

### Imports

Always import these at the top (after front matter):

```typescript
import { ApiList, Link, Property } from '~/components';
import { properties } from './properties';
```

Only import `Link` if you're using it in the content.

### Main Heading

Use the function/type name as the h1 heading:

```mdx
# functionName
```

### Description

After the heading, provide a clear, concise description:

```mdx
Creates a validation schema for email addresses.
```

Or for more complex functions:

```mdx
Parses an unknown input based on a schema and returns the typed output or throws a `ValiError`.
```

### Function Signature

Show the TypeScript signature in a code block:

````mdx
```ts
const Schema = v.functionName<TGeneric>(param);
```
````

````

**Important conventions**:
- Use `const` declarations
- Result variables should be descriptive: `Schema` for schemas, `Action` for actions, `output` for parse results
- Include all generics in angle brackets
- Show all parameters

### Generics Section

If the function has generics, document them:

```mdx
## Generics

- `TMessage` <Property {...properties.TMessage} />
- `TInput` <Property {...properties.TInput} />
````

### Parameters Section

Document all parameters:

```mdx
## Parameters

- `param1` <Property {...properties.param1} />
- `param2` <Property {...properties.param2} />
```

### Explanation Section

Add a detailed explanation as a subsection under Parameters:

```mdx
### Explanation

With `functionName` you can validate... If the input does not match..., you can use `message` to customize the error message.
```

**Key points**:

- Explain what the function does
- Explain when to use it
- Mention error handling
- Use backticks for parameter names and function names
- Link to related concepts using `<Link href="/path/">`Name`</Link>`

**Use blockquotes for important notes**:

```mdx
> This schema removes unknown entries. To include unknown entries, use <Link href="../looseObject/">`looseObject`</Link>.
```

### Returns Section

Document the return value:

```mdx
## Returns

- `Schema` <Property {...properties.Schema} />
```

Or for functions with multiple possible returns:

```mdx
## Returns

- `output` <Property {...properties.output} />
```

### Examples Section

This is critical for consistency. Examples must:

1. **Be practical and realistic**: Show real-world use cases
2. **Be progressive**: Start simple, then show more complex usage
3. **Use consistent naming**: Follow these conventions
4. **Include descriptive comments**: When helpful for understanding

````mdx
## Examples

The following examples show how `functionName` can be used.

### Example name

Brief description of what this demonstrates.

```ts
const ExampleSchema = v.pipe(
  v.string(),
  v.nonEmpty('Please enter your email.'),
  v.email('The email is badly formatted.')
);
```
````

````

**Naming conventions for examples**:
- Schema variables: `PascalCase` + `Schema` suffix
  - `EmailSchema`, `PasswordSchema`, `UserSchema`
- Specific purpose: Descriptive name
  - `MinStringSchema`, `SimpleObjectSchema`
- Related schemas: Number them or use descriptive names
  - `ObjectSchema1`, `ObjectSchema2`
  - `PickObjectSchema`, `PartialObjectSchema`

**Example structures**:

For schemas:
```typescript
const EmailSchema = v.pipe(
  v.string(),
  v.nonEmpty('Please enter your email.'),
  v.email('The email is badly formatted.'),
  v.maxLength(30, 'Your email is too long.')
);
````

For actions:

```typescript
const MinStringSchema = v.pipe(
  v.string(),
  v.minLength(3, 'The string must be 3 or more characters long.')
);
```

For transformations:

```typescript
const StringLengthSchema = v.pipe(
  v.string(),
  v.transform((input) => input.length)
);
```

For objects:

```typescript
const UserSchema = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  age: v.pipe(v.number(), v.minValue(18)),
});
```

**Typical example patterns**:

For validation actions (2-3 examples):

1. String validation
2. Number/Array validation
3. Date validation (if applicable)

For schemas (3-4 examples):

1. Basic usage
2. With pipeline/validation
3. Complex/nested structure
4. Practical real-world use case

For methods (1-2 examples):

1. Basic usage
2. With configuration/options (if applicable)

### Related Section

List all APIs that can be meaningfully combined with this function:

```mdx
## Related

The following APIs can be combined with `functionName`.

### Schemas

<ApiList items={['string', 'number', 'array']} />

### Methods

<ApiList items={['pipe', 'parse']} />

### Actions

<ApiList items={['minLength', 'email']} />

### Utils

<ApiList items={['isOfKind', 'isOfType']} />
```

**Guidelines for Related section**:

1. Only include APIs that make sense to combine
2. Keep lists in alphabetical order
3. Common categories: Schemas, Methods, Actions, Utils, Types
4. For schemas: include all schemas that can wrap or be wrapped by this one
5. For actions: include schemas they work with
6. For methods: include schemas and actions they work with
7. Use `<ApiList items={[...]} />` component
8. Each category is an h3 heading

## Updating Related Files

### Update api/menu.md

Add the new API to `/website/src/routes/api/menu.md` in the appropriate section, maintaining alphabetical order:

```markdown
## Schemas

- [any](/api/any/)
- [array](/api/array/)
- [newFunction](/api/newFunction/) <- Add here
- [string](/api/string/)
```

Sections in menu.md:

- Schemas
- Methods
- Actions
- Async
- Types
- Utils
- Storages

### Update Guide Files

#### For Schemas

Update `/website/src/routes/guides/(main-concepts)/schemas/index.mdx`:

Find the appropriate section (Primitive values, Complex values, or Special cases) and add to the `<ApiList>`:

```mdx
<ApiList
  label="Primitive schemas"
  items={[
    'bigint',
    'boolean',
    'newSchema', // Add here, alphabetically
    'string',
  ]}
/>
```

And add an example in the code block below:

```typescript
const NewSchemaExample = v.newSchema(); // new type
```

#### For Actions

Update `/website/src/routes/guides/(main-concepts)/pipelines/index.mdx`:

Add to the validation actions or transformation actions list:

```mdx
<ApiList
  label="Validation actions"
  items={[
    'email',
    'newAction', // Add here, alphabetically
    'minLength',
  ]}
/>
```

### Create Related Type Routes

If the function returns a new type or uses new issue types, create documentation for those types in `(types)`:

Example for `StringSchema`:

```
/website/src/routes/api/(types)/StringSchema/
  index.mdx
  properties.ts
```

Type documentation structure:

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

- `TMessage` <Property {...properties.TMessage} />

## Definition

- `StringSchema` <Property {...properties.BaseSchema} />
  - `type` <Property {...properties.type} />
  - `reference` <Property {...properties.reference} />
  - `expects` <Property {...properties.expects} />
  - `message` <Property {...properties.message} />
```

## Writing Examples

Examples are the most important part of documentation. They must be:

### Consistent in Style

All examples should feel like the same person wrote them:

**DO**: Use clear, descriptive variable names

```typescript
const EmailSchema = v.pipe(
  v.string(),
  v.email('The email is badly formatted.')
);
```

**DON'T**: Use generic or unclear names

```typescript
const schema1 = v.pipe(v.string(), v.email());
```

### Realistic and Practical

Show real-world use cases:

**DO**: Show validation with error messages

```typescript
const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(8, 'Your password is too short.'),
  v.regex(/[A-Z]/, 'Your password must contain an uppercase letter.')
);
```

**DON'T**: Show without context

```typescript
const Schema = v.pipe(v.string(), v.minLength(8));
```

### Progressive Complexity

Start simple, then show more complex usage:

1. **Basic example**: Simplest possible usage
2. **Common pattern**: Most typical use case
3. **Advanced usage**: Complex but realistic scenario

Example progression for `object`:

````mdx
### Simple object schema

Schema to validate an object with two keys.

```ts
const SimpleObjectSchema = v.object({
  key1: v.string(),
  key2: v.number(),
});
```
````

### Merge several objects

Schema that merges the entries of two object schemas.

```ts
const MergedObjectSchema = v.object({
  ...ObjectSchema1.entries,
  ...ObjectSchema2.entries,
});
```

### Object with validation

Schema to validate a user object with constraints.

```ts
const UserSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty()),
  email: v.pipe(v.string(), v.email()),
  age: v.pipe(v.number(), v.minValue(18)),
});
```

````

### Include Error Messages

For validation actions, always include error messages:

**DO**:
```typescript
const MinStringSchema = v.pipe(
  v.string(),
  v.minLength(3, 'The string must be 3 or more characters long.')
);
````

**DON'T**:

```typescript
const MinStringSchema = v.pipe(v.string(), v.minLength(3));
```

### Use Descriptive Headings

Example headings should be descriptive:

**DO**:

- "Email schema"
- "Password validation"
- "Transform to length"
- "Minimum array length"

**DON'T**:

- "Example 1"
- "Usage"
- "Basic"

### Follow Naming Patterns

Variable names must follow these patterns:

| Type             | Pattern                 | Examples                                      |
| ---------------- | ----------------------- | --------------------------------------------- |
| Schema           | `PascalCase` + `Schema` | `EmailSchema`, `UserSchema`, `PasswordSchema` |
| Specific purpose | Descriptive + `Schema`  | `MinStringSchema`, `UrlSchema`                |
| Multiple related | Numbered                | `ObjectSchema1`, `ObjectSchema2`              |
| Modified schema  | Modifier + `Schema`     | `PartialObjectSchema`, `PickObjectSchema`     |

### Comment When Helpful

Add comments to clarify non-obvious code:

```typescript
const UserSchema = v.pipe(
  v.object({
    name: v.string(),
    age: v.number(),
  }),
  v.transform((input) => ({
    ...input,
    created: new Date().toISOString(), // Add creation timestamp
  }))
);
```

### Show Full Context

Don't truncate examples - show complete, runnable code:

**DO**:

```typescript
const EmailSchema = v.pipe(
  v.string(),
  v.nonEmpty('Please enter your email.'),
  v.email('The email is badly formatted.'),
  v.maxLength(30, 'Your email is too long.')
);
```

**DON'T**:

```typescript
const EmailSchema = v.pipe(
  v.string()
  // ... validation
);
```

## Best Practices

### 1. Consistency is Key

- Use the same style across all documentation
- Follow the established patterns exactly
- Match the tone and voice of existing docs
- Use the same terminology consistently

### 2. Link to Related Content

Use `<Link>` component to cross-reference:

```mdx
To include unknown entries, use <Link href="../looseObject/">`looseObject`</Link>.
```

Link patterns:

- Relative paths: `../TypeName/`
- Guide links: `/guides/section/`
- Always include trailing slash

### 3. Use Proper TypeScript

- Show proper TypeScript syntax
- Include type annotations when helpful
- Use `const` for declarations
- Follow TypeScript naming conventions

### 4. Error Messages Matter

Error messages in examples should:

- Be clear and actionable
- Use consistent tone (friendly but professional)
- Start with articles when appropriate ("The email...", "Your password...")
- Guide the user to fix the issue

**Good error messages**:

- "Your password is too short."
- "The email is badly formatted."
- "Please enter your email."

**Bad error messages**:

- "Invalid"
- "Error"
- "Wrong format"

### 5. Explain the "Why"

In the Explanation section, explain:

- Why someone would use this function
- When to use it vs alternatives
- What happens on validation failure
- Any important caveats or limitations

### 6. Keep It Focused

Each API route documents one function/type:

- Don't document multiple functions in one route
- Don't explain unrelated concepts
- Stay focused on the specific API

### 7. Test Your Examples

Ensure all code examples:

- Are syntactically correct
- Would actually work if run
- Use valid function signatures
- Import from the correct locations

### 8. Property Type Accuracy

In `properties.ts`, ensure:

- Types exactly match the source code
- Generic constraints are correct
- Links to types are valid
- Optional types use union with `undefined`

### 9. Alphabetical Ordering

Maintain alphabetical order in:

- `menu.md` lists
- `<ApiList>` items
- Related section categories

### 10. Front Matter Accuracy

- Title matches the function name exactly
- Description is concise (one sentence)
- Source path is correct
- Contributors list is accurate

## Common Patterns Reference

### Schema Function

**properties.ts**:

```typescript
export const properties: Record<string, PropertyProps> = {
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
  message: {
    type: { type: 'custom', name: 'TMessage' },
  },
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

**index.mdx**:

````mdx
# string

Creates a string schema.

```ts
const Schema = v.string<TMessage>(message);
```
````

## Generics

- `TMessage` <Property {...properties.TMessage} />

## Parameters

- `message` <Property {...properties.message} />

### Explanation

With `string` you can validate the data type of the input...

## Returns

- `Schema` <Property {...properties.Schema} />

````

### Validation Action

**properties.ts**:
```typescript
export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: { type: 'custom', name: 'LengthInput', href: '../LengthInput/' },
  },
  TRequirement: {
    modifier: 'extends',
    type: 'number',
  },
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
  requirement: {
    type: { type: 'custom', name: 'TRequirement' },
  },
  message: {
    type: { type: 'custom', name: 'TMessage' },
  },
  Action: {
    type: {
      type: 'custom',
      name: 'MinLengthAction',
      href: '../MinLengthAction/',
      generics: [
        { type: 'custom', name: 'TInput' },
        { type: 'custom', name: 'TRequirement' },
        { type: 'custom', name: 'TMessage' },
      ],
    },
  },
};
````

**index.mdx**:

````mdx
# minLength

Creates a min length validation action.

```ts
const Action = v.minLength<TInput, TRequirement, TMessage>(
  requirement,
  message
);
```
````

## Generics

- `TInput` <Property {...properties.TInput} />
- `TRequirement` <Property {...properties.TRequirement} />
- `TMessage` <Property {...properties.TMessage} />

## Parameters

- `requirement` <Property {...properties.requirement} />
- `message` <Property {...properties.message} />

### Explanation

With `minLength` you can validate the length of a string or array...

## Returns

- `Action` <Property {...properties.Action} />

````

### Method Function

**properties.ts**:
```typescript
export const properties: Record<string, PropertyProps> = {
  TSchema: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseSchema',
      href: '../BaseSchema/',
      generics: [
        'unknown',
        'unknown',
        { type: 'custom', name: 'BaseIssue', href: '../BaseIssue/', generics: ['unknown'] },
      ],
    },
  },
  schema: {
    type: { type: 'custom', name: 'TSchema' },
  },
  input: {
    type: 'unknown',
  },
  output: {
    type: {
      type: 'custom',
      name: 'InferOutput',
      href: '../InferOutput/',
      generics: [{ type: 'custom', name: 'TSchema' }],
    },
  },
};
````

**index.mdx**:

````mdx
# parse

Parses an unknown input based on a schema.

```ts
const output = v.parse<TSchema>(schema, input);
```
````

## Generics

- `TSchema` <Property {...properties.TSchema} />

## Parameters

- `schema` <Property {...properties.schema} />
- `input` <Property {...properties.input} />

### Explanation

`parse` will throw a `ValiError` if the input does not match the schema...

## Returns

- `output` <Property {...properties.output} />

````

### Type Interface

**properties.ts**:
```typescript
export const properties: Record<string, PropertyProps> = {
  TMessage: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        { type: 'custom', name: 'ErrorMessage', href: '../ErrorMessage/' },
        'undefined',
      ],
    },
  },
  BaseSchema: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'BaseSchema',
      href: '../BaseSchema/',
      generics: [
        'string',
        'string',
        { type: 'custom', name: 'StringIssue', href: '../StringIssue/' },
      ],
    },
  },
  type: {
    type: { type: 'string', value: 'string' },
  },
  reference: {
    type: {
      type: 'custom',
      modifier: 'typeof',
      name: 'string',
      href: '../string/',
    },
  },
  expects: {
    type: { type: 'string', value: 'string' },
  },
  message: {
    type: { type: 'custom', name: 'TMessage' },
  },
};
````

**index.mdx**:

```mdx
# StringSchema

String schema interface.

## Generics

- `TMessage` <Property {...properties.TMessage} />

## Definition

- `StringSchema` <Property {...properties.BaseSchema} />
  - `type` <Property {...properties.type} />
  - `reference` <Property {...properties.reference} />
  - `expects` <Property {...properties.expects} />
  - `message` <Property {...properties.message} />
```

## Complete Example: From Source to Documentation

Let's walk through creating documentation for `minLength` from its source code.

### Step 1: Read Source Code

From `/library/src/actions/minLength/minLength.ts`:

```typescript
export interface MinLengthIssue<
  TInput extends LengthInput,
  TRequirement extends number,
> extends BaseIssue<TInput> {
  readonly kind: 'validation';
  readonly type: 'min_length';
  readonly expected: `>=${TRequirement}`;
  readonly received: `${number}`;
  readonly requirement: TRequirement;
}

export interface MinLengthAction<
  TInput extends LengthInput,
  TRequirement extends number,
  TMessage extends
    | ErrorMessage<MinLengthIssue<TInput, TRequirement>>
    | undefined,
> extends BaseValidation<TInput, TInput, MinLengthIssue<TInput, TRequirement>> {
  readonly type: 'min_length';
  readonly reference: typeof minLength;
  readonly expects: `>=${TRequirement}`;
  readonly requirement: TRequirement;
  readonly message: TMessage;
}

/**
 * Creates a min length validation action.
 *
 * @param requirement The minimum length.
 *
 * @returns A min length action.
 */
export function minLength<
  TInput extends LengthInput,
  const TRequirement extends number,
>(requirement: TRequirement): MinLengthAction<TInput, TRequirement, undefined>;

/**
 * Creates a min length validation action.
 *
 * @param requirement The minimum length.
 * @param message The error message.
 *
 * @returns A min length action.
 */
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

### Step 2: Extract Information

From the source code:

- **Category**: Action (validation)
- **Name**: `minLength`
- **Source path**: `/actions/minLength/minLength.ts`
- **Description**: "Creates a min length validation action."
- **Generics**:
  - `TInput extends LengthInput`
  - `TRequirement extends number`
  - `TMessage extends ErrorMessage<MinLengthIssue<TInput, TRequirement>> | undefined`
- **Parameters**:
  - `requirement: TRequirement` (required)
  - `message: TMessage` (optional, shown by second overload)
- **Return**: `MinLengthAction<TInput, TRequirement, TMessage>`
- **Related types**: `LengthInput`, `MinLengthIssue`, `MinLengthAction`, `ErrorMessage`

### Step 3: Create properties.ts

`/website/src/routes/api/(actions)/minLength/properties.ts`:

```typescript
import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TInput: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'LengthInput',
      href: '../LengthInput/',
    },
  },
  TRequirement: {
    modifier: 'extends',
    type: 'number',
  },
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
                {
                  type: 'custom',
                  name: 'TInput',
                },
                {
                  type: 'custom',
                  name: 'TRequirement',
                },
              ],
            },
          ],
        },
        'undefined',
      ],
    },
  },
  requirement: {
    type: {
      type: 'custom',
      name: 'TRequirement',
    },
  },
  message: {
    type: {
      type: 'custom',
      name: 'TMessage',
    },
  },
  Action: {
    type: {
      type: 'custom',
      name: 'MinLengthAction',
      href: '../MinLengthAction/',
      generics: [
        {
          type: 'custom',
          name: 'TInput',
        },
        {
          type: 'custom',
          name: 'TRequirement',
        },
        {
          type: 'custom',
          name: 'TMessage',
        },
      ],
    },
  },
};
```

### Step 4: Create index.mdx

`/website/src/routes/api/(actions)/minLength/index.mdx`:

````mdx
---
title: minLength
description: Creates a min length validation action.
source: /actions/minLength/minLength.ts
contributors:
  - fabian-hiller
---

import { ApiList, Property } from '~/components';
import { properties } from './properties';

# minLength

Creates a min length validation action.

```ts
const Action = v.minLength<TInput, TRequirement, TMessage>(
  requirement,
  message
);
```

## Generics

- `TInput` <Property {...properties.TInput} />
- `TRequirement` <Property {...properties.TRequirement} />
- `TMessage` <Property {...properties.TMessage} />

## Parameters

- `requirement` <Property {...properties.requirement} />
- `message` <Property {...properties.message} />

### Explanation

With `minLength` you can validate the length of a string or array. If the input does not match the `requirement`, you can use `message` to customize the error message.

## Returns

- `Action` <Property {...properties.Action} />

## Examples

The following examples show how `minLength` can be used.

### Minimum string length

Schema to validate a string with a minimum length of 3 characters.

```ts
const MinStringSchema = v.pipe(
  v.string(),
  v.minLength(3, 'The string must be 3 or more characters long.')
);
```

### Minimum array length

Schema to validate an array with a minimum length of 5 items.

```ts
const MinArraySchema = v.pipe(
  v.array(v.number()),
  v.minLength(5, 'The array must contain 5 numbers or more.')
);
```

## Related

The following APIs can be combined with `minLength`.

### Schemas

<ApiList
  items={['any', 'array', 'custom', 'instance', 'string', 'tuple', 'unknown']}
/>

### Methods

<ApiList items={['pipe']} />

### Utils

<ApiList items={['isOfKind', 'isOfType']} />
````

### Step 5: Create Related Type Documentation

Create type documentation for `MinLengthIssue` and `MinLengthAction` following the type interface pattern shown in Common Patterns Reference.

### Step 6: Update menu.md

Add to `/website/src/routes/api/menu.md` under Actions section (alphabetically).

### Step 7: Update Guide

Add to `/website/src/routes/guides/(main-concepts)/pipelines/index.mdx` in the validation actions list.

## Checklist

Before submitting a new API route, verify:

### Source Code Analysis

- [ ] Read the source file in `/library/src/`
- [ ] Identified all exported interfaces (Issue, Schema/Action)
- [ ] Extracted all function overloads
- [ ] Noted all generic constraints
- [ ] Read JSDoc comments for descriptions
- [ ] Identified related types and dependencies

### File Structure

- [ ] Folder structure follows conventions
- [ ] Created in correct category folder
- [ ] Folder name matches function name exactly

### properties.ts

- [ ] `properties.ts` accurately reflects source code types
- [ ] All generics are documented with correct constraints
- [ ] All parameters are documented with correct types
- [ ] Return type is documented
- [ ] Custom types link to their documentation (href)
- [ ] Generic references use correct names (e.g., `TMessage`, not `Message`)

### index.mdx

- [ ] Front matter is complete and accurate
- [ ] Title matches function name exactly (case-sensitive)
- [ ] Description is concise (one sentence, with period)
- [ ] Source path is correct (relative from `/library/src/`)
- [ ] Function signature matches source code exactly
- [ ] All generics listed in order
- [ ] All parameters listed in order
- [ ] Return type documented
- [ ] Explanation is clear and helpful
- [ ] Examples are realistic and follow naming conventions
- [ ] Examples include error messages (for validations)
- [ ] Examples progress from simple to complex
- [ ] Related section includes relevant APIs
- [ ] Related section items are alphabetically ordered
- [ ] `menu.md` is updated (alphabetically)
- [ ] Guide files are updated (if applicable)
- [ ] Related type routes are created (if needed)
- [ ] All links use correct relative paths with trailing slashes
- [ ] Code examples use proper TypeScript syntax
- [ ] Tone and style match existing documentation
- [ ] No typos or grammatical errors

## Quick Reference

### File Locations

```
/website/src/routes/api/
  (schemas)/functionName/
    index.mdx
    properties.ts
  (actions)/functionName/
    index.mdx
    properties.ts
  (methods)/functionName/
    index.mdx
    properties.ts
  (types)/TypeName/
    index.mdx
    properties.ts
  menu.md

/website/src/routes/guides/(main-concepts)/
  schemas/index.mdx
  pipelines/index.mdx
```

### Common Imports

```typescript
// In index.mdx
import { ApiList, Link, Property } from '~/components';
// In properties.ts
import type { PropertyProps } from '~/components';
import { properties } from './properties';
```

### Component Usage

```mdx
<!-- Property component -->

<Property {...properties.propName} />

<!-- ApiList component -->

<ApiList items={['item1', 'item2']} />

<!-- Link component -->

<Link href="../TypeName/">`TypeName`</Link>
```

### Variable Naming

```typescript
// Schemas
const EmailSchema = v.string();
const UserSchema = v.object({ ... });
const MinStringSchema = v.pipe(v.string(), v.minLength(3));

// Parse results
const output = v.parse(Schema, input);
const email = v.parse(EmailSchema, 'test@example.com');

// Generic examples
const result = v.safeParse(Schema, input);
```

---

This guide should be followed precisely to maintain consistency and quality across all Valibot API documentation. When in doubt, refer to existing routes as examples and maintain the established patterns.
