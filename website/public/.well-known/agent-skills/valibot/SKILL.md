---
name: valibot
description: Schema validation with Valibot, the modular and type-safe schema library. Use when the user needs to validate data, create schemas, parse inputs, or work with Valibot in their project. Also use when migrating from Zod to Valibot.
license: MIT
metadata:
  author: open-circle
  version: "1.0"
---

# Valibot

This skill helps you work effectively with [Valibot](https://valibot.dev), the modular and type-safe schema library for validating structural data.

## When to use this skill

- When the user asks about schema validation with Valibot
- When creating or modifying Valibot schemas
- When parsing or validating user input
- When the user mentions Valibot, schema, or validation
- When migrating from Zod to Valibot

## CRITICAL: Valibot vs Zod — Do Not Confuse!

**Valibot and Zod have different APIs. Never mix them up!**

### Key Differences

| Feature             | Zod ❌                                | Valibot ✅                                                |
| ------------------- | ------------------------------------- | --------------------------------------------------------- |
| Import              | `import { z } from 'zod'`             | `import * as v from 'valibot'`                            |
| Validations         | Chained methods: `.email().min(5)`    | Pipeline: `v.pipe(v.string(), v.email(), v.minLength(5))` |
| Parsing             | `schema.parse(data)`                  | `v.parse(schema, data)`                                   |
| Safe parsing        | `schema.safeParse(data)`              | `v.safeParse(schema, data)`                               |
| Optional            | `z.string().optional()`               | `v.optional(v.string())`                                  |
| Nullable            | `z.string().nullable()`               | `v.nullable(v.string())`                                  |
| Default             | `z.string().default('x')`             | `v.optional(v.string(), 'x')`                             |
| Transform           | `z.string().transform(fn)`            | `v.pipe(v.string(), v.transform(fn))`                     |
| Refine/Check        | `z.string().refine(fn)`               | `v.pipe(v.string(), v.check(fn))`                         |
| Enum                | `z.enum(['a', 'b'])`                  | `v.picklist(['a', 'b'])`                                  |
| Native enum         | `z.nativeEnum(MyEnum)`                | `v.enum(MyEnum)`                                          |
| Union               | `z.union([a, b])`                     | `v.union([a, b])`                                         |
| Discriminated union | `z.discriminatedUnion('type', [...])` | `v.variant('type', [...])`                                |
| Intersection        | `z.intersection(a, b)`                | `v.intersect([a, b])`                                     |
| Min/max length      | `.min(5).max(10)`                     | `v.minLength(5), v.maxLength(10)`                         |
| Min/max value       | `.gte(5).lte(10)`                     | `v.minValue(5), v.maxValue(10)`                           |
| Infer type          | `z.infer<typeof Schema>`              | `v.InferOutput<typeof Schema>`                            |
| Infer input         | `z.input<typeof Schema>`              | `v.InferInput<typeof Schema>`                             |

### Common Mistakes to Avoid

```typescript
// ❌ WRONG - This is Zod syntax, NOT Valibot!
const Schema = v.string().email().min(5);
const result = Schema.parse(data);

// ✅ CORRECT - Valibot uses functions and pipelines
const Schema = v.pipe(v.string(), v.email(), v.minLength(5));
const result = v.parse(Schema, data);
```

```typescript
// ❌ WRONG - Zod-style optional
const Schema = v.object({
  name: v.string().optional(),
});

// ✅ CORRECT - Valibot wraps with optional()
const Schema = v.object({
  name: v.optional(v.string()),
});
```

```typescript
// ❌ WRONG - Zod-style default
const Schema = v.string().default("hello");

// ✅ CORRECT - Valibot uses second argument
const Schema = v.optional(v.string(), "hello");
```

## Installation

```bash
npm install valibot     # npm
yarn add valibot        # yarn
pnpm add valibot        # pnpm
bun add valibot         # bun
```

Import with a wildcard (recommended):

```typescript
import * as v from "valibot";
```

Or with individual imports:

```typescript
import { object, string, pipe, email, parse } from "valibot";
```

## Mental Model

Valibot's API is divided into three main concepts:

### 1. Schemas

Schemas define the expected data type. They are the starting point.

```typescript
import * as v from "valibot";

// Primitive schemas
const StringSchema = v.string();
const NumberSchema = v.number();
const BooleanSchema = v.boolean();
const DateSchema = v.date();

// Complex schemas
const ArraySchema = v.array(v.string());
const ObjectSchema = v.object({
  name: v.string(),
  age: v.number(),
});
```

### 2. Methods

Methods help you use or modify schemas. The schema is always the first argument.

```typescript
// Parsing
const result = v.parse(StringSchema, "hello");
const safeResult = v.safeParse(StringSchema, "hello");

// Type guard
if (v.is(StringSchema, data)) {
  // data is typed as string
}
```

### 3. Actions

Actions validate or transform data within a `pipe()`. They MUST be used inside pipelines.

```typescript
// Actions are used in pipe()
const EmailSchema = v.pipe(
  v.string(),
  v.trim(),
  v.email(),
  v.endsWith("@example.com"),
);
```

## Pipelines

Pipelines extend schemas with validation and transformation actions. A pipeline always starts with a schema, followed by actions.

```typescript
import * as v from "valibot";

const UsernameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(3, "Username must be at least 3 characters"),
  v.maxLength(20, "Username must be at most 20 characters"),
  v.regex(
    /^[a-z0-9_]+$/i,
    "Username can only contain letters, numbers, and underscores",
  ),
);

const AgeSchema = v.pipe(
  v.number(),
  v.integer("Age must be a whole number"),
  v.minValue(0, "Age cannot be negative"),
  v.maxValue(150, "Age cannot exceed 150"),
);
```

### Common Validation Actions

**String validations:**

- `v.email()` — Valid email format
- `v.url()` — Valid URL format
- `v.uuid()` — Valid UUID format
- `v.regex(pattern)` — Match regex pattern
- `v.minLength(n)` — Minimum length
- `v.maxLength(n)` — Maximum length
- `v.length(n)` — Exact length
- `v.nonEmpty()` — Not empty string
- `v.startsWith(str)` — Starts with string
- `v.endsWith(str)` — Ends with string
- `v.includes(str)` — Contains string

**Number validations:**

- `v.minValue(n)` — Minimum value (>=)
- `v.maxValue(n)` — Maximum value (<=)
- `v.gtValue(n)` — Greater than (>)
- `v.ltValue(n)` — Less than (<)
- `v.integer()` — Must be integer
- `v.finite()` — Must be finite
- `v.safeInteger()` — Safe integer range
- `v.multipleOf(n)` — Must be multiple of n

**Array validations:**

- `v.minLength(n)` — Minimum items
- `v.maxLength(n)` — Maximum items
- `v.length(n)` — Exact item count
- `v.nonEmpty()` — At least one item
- `v.includes(item)` — Contains item
- `v.excludes(item)` — Does not contain item

### Custom Validation with check()

```typescript
const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(8),
  v.check(
    (input) => /[A-Z]/.test(input),
    "Password must contain an uppercase letter",
  ),
  v.check((input) => /[0-9]/.test(input), "Password must contain a number"),
);
```

### Value Transformations

These actions modify the value without changing its type:

**String transformations:**

- `v.trim()` — Remove leading/trailing whitespace
- `v.trimStart()` — Remove leading whitespace
- `v.trimEnd()` — Remove trailing whitespace
- `v.toLowerCase()` — Convert to lowercase
- `v.toUpperCase()` — Convert to uppercase

**Number transformations:**

- `v.toMinValue(n)` — Clamp to minimum value (if less than n, set to n)
- `v.toMaxValue(n)` — Clamp to maximum value (if greater than n, set to n)

```typescript
const NormalizedEmailSchema = v.pipe(
  v.string(),
  v.trim(),
  v.toLowerCase(),
  v.email(),
);

// Clamp number to range 0-100
const PercentageSchema = v.pipe(v.number(), v.toMinValue(0), v.toMaxValue(100));
```

### Type Transformations

For converting between data types, use these built-in transformation actions:

- `v.toNumber()` — Convert to number
- `v.toString()` — Convert to string
- `v.toBoolean()` — Convert to boolean
- `v.toBigint()` — Convert to bigint
- `v.toDate()` — Convert to Date

```typescript
// Convert string to number
const PortSchema = v.pipe(v.string(), v.toNumber(), v.integer(), v.minValue(1));

// Convert ISO string to Date
const TimestampSchema = v.pipe(v.string(), v.isoDateTime(), v.toDate());

// Convert to boolean
const FlagSchema = v.pipe(v.string(), v.toBoolean());
```

### Custom Transformations

For custom transformations, use `v.transform()`:

```typescript
const DateStringSchema = v.pipe(
  v.string(),
  v.isoDate(),
  v.transform((input) => new Date(input)),
);

// Custom object transformation
const UserSchema = v.pipe(
  v.object({
    firstName: v.string(),
    lastName: v.string(),
  }),
  v.transform((input) => ({
    ...input,
    fullName: `${input.firstName} ${input.lastName}`,
  })),
);
```

## Object Schemas

### Basic Object

```typescript
const UserSchema = v.object({
  id: v.number(),
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  age: v.optional(v.number()),
});

type User = v.InferOutput<typeof UserSchema>;
```

### Object Variants

```typescript
// Regular object - strips unknown keys (default)
const ObjectSchema = v.object({ key: v.string() });

// Loose object - allows and preserves unknown keys
const LooseObjectSchema = v.looseObject({ key: v.string() });

// Strict object - throws on unknown keys
const StrictObjectSchema = v.strictObject({ key: v.string() });

// Object with rest - validates unknown keys against a schema
const ObjectWithRestSchema = v.objectWithRest(
  { key: v.string() },
  v.number(), // unknown keys must be numbers
);
```

### Optional and Nullable Fields

```typescript
const ProfileSchema = v.object({
  // Required
  name: v.string(),

  // Optional (can be undefined or missing)
  nickname: v.optional(v.string()),

  // Optional with default
  role: v.optional(v.string(), "user"),

  // Nullable (can be null)
  avatar: v.nullable(v.string()),

  // Nullish (can be null or undefined)
  bio: v.nullish(v.string()),

  // Nullish with default
  theme: v.nullish(v.string(), "light"),
});
```

### Object Methods

```typescript
const BaseSchema = v.object({
  id: v.number(),
  name: v.string(),
  email: v.string(),
  password: v.string(),
});

// Pick specific keys
const PublicUserSchema = v.pick(BaseSchema, ["id", "name"]);

// Omit specific keys
const UserWithoutPasswordSchema = v.omit(BaseSchema, ["password"]);

// Make all optional
const PartialUserSchema = v.partial(BaseSchema);

// Make all required
const RequiredUserSchema = v.required(PartialUserSchema);

// Merge objects
const ExtendedUserSchema = v.object({
  ...BaseSchema.entries,
  createdAt: v.date(),
});
```

### Cross-Field Validation

```typescript
const RegistrationSchema = v.pipe(
  v.object({
    password: v.pipe(v.string(), v.minLength(8)),
    confirmPassword: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirmPassword"]],
      (input) => input.password === input.confirmPassword,
      "Passwords do not match",
    ),
    ["confirmPassword"],
  ),
);
```

## Arrays and Tuples

### Arrays

```typescript
const TagsSchema = v.pipe(
  v.array(v.string()),
  v.minLength(1, "At least one tag required"),
  v.maxLength(10, "Maximum 10 tags allowed"),
);

// Array of objects
const UsersSchema = v.array(
  v.object({
    id: v.number(),
    name: v.string(),
  }),
);
```

### Tuples

```typescript
// Fixed-length array with specific types
const CoordinatesSchema = v.tuple([v.number(), v.number()]);
// Type: [number, number]

// Tuple with rest
const ArgsSchema = v.tupleWithRest(
  [v.string()], // first arg is string
  v.number(), // rest are numbers
);
// Type: [string, ...number[]]
```

## Unions and Variants

### Union

```typescript
const StringOrNumberSchema = v.union([v.string(), v.number()]);

const StatusSchema = v.union([
  v.literal("pending"),
  v.literal("active"),
  v.literal("inactive"),
]);
```

### Picklist (for string/number literals)

```typescript
// Simpler than union of literals
const StatusSchema = v.picklist(["pending", "active", "inactive"]);

const PrioritySchema = v.picklist([1, 2, 3]);
```

### Variant (discriminated union)

Use `variant` for better performance with discriminated unions:

```typescript
const EventSchema = v.variant("type", [
  v.object({
    type: v.literal("click"),
    x: v.number(),
    y: v.number(),
  }),
  v.object({
    type: v.literal("keypress"),
    key: v.string(),
  }),
  v.object({
    type: v.literal("scroll"),
    direction: v.picklist(["up", "down"]),
  }),
]);
```

## Parsing Data

### parse() — Throws on Error

```typescript
import * as v from "valibot";

const EmailSchema = v.pipe(v.string(), v.email());

try {
  const email = v.parse(EmailSchema, "jane@example.com");
  console.log(email); // 'jane@example.com'
} catch (error) {
  console.error(error); // ValiError
}
```

### safeParse() — Returns Result Object

```typescript
const result = v.safeParse(EmailSchema, input);

if (result.success) {
  console.log(result.output); // Valid data
} else {
  console.log(result.issues); // Array of issues
}
```

### is() — Type Guard

```typescript
if (v.is(EmailSchema, input)) {
  // input is typed as string
}
```

### Configuration Options

```typescript
// Abort early - stop at first error
v.parse(Schema, data, { abortEarly: true });

// Abort pipe early - stop pipeline at first error
v.parse(Schema, data, { abortPipeEarly: true });
```

## Type Inference

```typescript
import * as v from "valibot";

const UserSchema = v.object({
  name: v.string(),
  age: v.pipe(v.string(), v.transform(Number)),
  role: v.optional(v.string(), "user"),
});

// Output type (after transformations and defaults)
type User = v.InferOutput<typeof UserSchema>;
// { name: string; age: number; role: string }

// Input type (before transformations)
type UserInput = v.InferInput<typeof UserSchema>;
// { name: string; age: string; role?: string | undefined }

// Issue type
type UserIssue = v.InferIssue<typeof UserSchema>;
```

## Error Handling

### Custom Error Messages

```typescript
const LoginSchema = v.object({
  email: v.pipe(
    v.string("Email must be a string"),
    v.nonEmpty("Please enter your email"),
    v.email("Invalid email format"),
  ),
  password: v.pipe(
    v.string("Password must be a string"),
    v.nonEmpty("Please enter your password"),
    v.minLength(8, "Password must be at least 8 characters"),
  ),
});
```

### Flattening Errors

```typescript
const result = v.safeParse(LoginSchema, data);

if (!result.success) {
  const flat = v.flatten(result.issues);
  // { nested: { email: ['Invalid email format'], password: ['...'] } }
}
```

### Issue Structure

Each issue contains:

- `kind`: 'schema' | 'validation' | 'transformation'
- `type`: Function name (e.g., 'string', 'email', 'min_length')
- `input`: The problematic input
- `expected`: What was expected
- `received`: What was received
- `message`: Human-readable message
- `path`: Array of path items for nested issues

## Fallback Values

```typescript
// Static fallback
const NumberSchema = v.fallback(v.number(), 0);
v.parse(NumberSchema, "invalid"); // Returns 0

// Dynamic fallback
const DateSchema = v.fallback(v.date(), () => new Date());
```

## Recursive Schemas

```typescript
import * as v from "valibot";

type TreeNode = {
  value: string;
  children: TreeNode[];
};

const TreeNodeSchema: v.GenericSchema<TreeNode> = v.object({
  value: v.string(),
  children: v.lazy(() => v.array(TreeNodeSchema)),
});
```

## Async Validation

For async operations (e.g., database checks), use async variants:

```typescript
import * as v from "valibot";

const isUsernameAvailable = async (username: string) => {
  // Check database
  return true;
};

const UsernameSchema = v.pipeAsync(
  v.string(),
  v.minLength(3),
  v.checkAsync(isUsernameAvailable, "Username is already taken"),
);

// Must use parseAsync
const username = await v.parseAsync(UsernameSchema, "john");
```

## JSON Schema Conversion

```typescript
import { toJsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";

const EmailSchema = v.pipe(v.string(), v.email());
const jsonSchema = toJsonSchema(EmailSchema);
// { type: 'string', format: 'email' }
```

## Naming Conventions

### Convention 1: Same Name (Recommended for simplicity)

```typescript
export const User = v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
});

export type User = v.InferOutput<typeof User>;

// Usage
const users: User[] = [];
users.push(v.parse(User, data));
```

### Convention 2: With Suffixes (Recommended when input/output differ)

```typescript
export const UserSchema = v.object({
  name: v.string(),
  age: v.pipe(v.string(), v.transform(Number)),
});

export type UserInput = v.InferInput<typeof UserSchema>;
export type UserOutput = v.InferOutput<typeof UserSchema>;
```

## Common Patterns

### Login Form

```typescript
const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your email"),
    v.email("Invalid email address"),
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty("Please enter your password"),
    v.minLength(8, "Password must be at least 8 characters"),
  ),
});
```

### API Response

```typescript
const ApiResponseSchema = v.variant("status", [
  v.object({
    status: v.literal("success"),
    data: v.unknown(),
  }),
  v.object({
    status: v.literal("error"),
    error: v.object({
      code: v.string(),
      message: v.string(),
    }),
  }),
]);
```

### Environment Variables

```typescript
const EnvSchema = v.object({
  NODE_ENV: v.picklist(["development", "production", "test"]),
  PORT: v.pipe(v.string(), v.transform(Number), v.integer(), v.minValue(1)),
  DATABASE_URL: v.pipe(v.string(), v.url()),
  API_KEY: v.pipe(v.string(), v.minLength(32)),
});

const env = v.parse(EnvSchema, process.env);
```

### Date Handling

```typescript
// String to Date
const DateFromStringSchema = v.pipe(
  v.string(),
  v.isoDate(),
  v.transform((input) => new Date(input)),
);

// Date validation
const FutureDateSchema = v.pipe(
  v.date(),
  v.minValue(new Date(), "Date must be in the future"),
);
```

## Additional Resources

- [Valibot Documentation](https://valibot.dev)
- [Valibot GitHub](https://github.com/open-circle/valibot)
- [API Reference](https://valibot.dev/api/)
- [Migration from Zod](https://valibot.dev/guides/migrate-from-zod/)
