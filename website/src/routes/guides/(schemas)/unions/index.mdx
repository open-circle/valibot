---
title: Unions
description: >-
  An union represents a logical OR relationship. You can apply this concept to
  your schemas with union and variant.
contributors:
  - fabian-hiller
---

import { Link } from '~/components';

# Unions

An union represents a logical OR relationship. You can apply this concept to your schemas with <Link href="/api/union/">`union`</Link> and <Link href="/api/variant/">`variant`</Link>. For [discriminated unions](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions) you use <Link href="/api/variant/">`variant`</Link> and in all other cases you use <Link href="/api/union/">`union`</Link>.

## Union schema

The schema function <Link href="/api/union/">`union`</Link> creates an OR relationship between any number of schemas that you pass as the first argument in the form of an array. On validation, the schema returns the result of the first schema that was successfully validated.

```ts
import * as v from 'valibot';

// TypeScript
type Union = string | number;

// Valibot
const UnionSchema = v.union([v.string(), v.number()]);
```

If a bad input can be uniquely assigned to one of the schemas based on the data type, the result of that schema is returned. Otherwise, a general issue is returned that contains the issues of each schema as subissues. This is a special case within the library, as the issues of <Link href="/api/union/">`union`</Link> can contradict each other.

The following issues are returned if the input is `null` instead of a string or number. Since the input cannot be associated with a schema in this case, the issues of both schemas are returned as subissues.

```ts
[
  {
    kind: 'schema',
    type: 'union',
    input: null,
    expected: 'string | number',
    received: 'null',
    message: 'Invalid type: Expected string | number but received null',
    issues: [
      {
        kind: 'schema',
        type: 'string',
        input: null,
        expected: 'string',
        received: 'null',
        message: 'Invalid type: Expected string but received null',
      },
      {
        kind: 'schema',
        type: 'number',
        input: null,
        expected: 'number',
        received: 'null',
        message: 'Invalid type: Expected number but received null',
      },
    ],
  },
];
```

## Variant schema

For better performance, more type safety, and a more targeted output of issues, you can use <Link href="/api/variant/">`variant`</Link> for discriminated unions. Therefore, we recommend using <Link href="/api/variant/">`variant`</Link> over <Link href="/api/union/">`union`</Link> whenever possible. A discriminated union is an OR relationship between objects that can be distinguished by a specific key.

When you call the schema function, you first specify the discriminator key. This is used to determine the schema to use for validation based on the input. The object schemas, in the form of an array, follow as the second argument.

```ts
import * as v from 'valibot';

const VariantScheme = v.variant('type', [
  v.object({
    type: v.literal('foo'),
    foo: v.string(),
  }),
  v.object({
    type: v.literal('bar'),
    bar: v.number(),
  }),
]);
```

For very complex datasets, multiple <Link href="/api/variant/">`variant`</Link> schemas can also be deeply nested within one another.
