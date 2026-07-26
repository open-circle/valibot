---
title: Methods
description: >-
  Apart from `parse`, `safeParse`, and `is`, Valibot offers some more methods to
  make working with your schemas easier.
contributors:
  - fabian-hiller
  - BastiDood
  - danielrincondev
  - estubmo
  - FlorianDevPhynix
  - Yovach
---

import { ApiList, Link } from '~/components';

# Methods

Apart from <Link href="/api/parse/">`parse`</Link> and <Link href="/api/safeParse/">`safeParse`</Link>, Valibot offers some more methods to make working with your schemas easier. In the following we distinguish between schema, object and pipeline methods.

## Schema methods

Schema methods add functionality, simplify ergonomics, and help you use schemas for validation and data extraction.

<ApiList
  label="Schema methods"
  items={[
    'assert',
    'config',
    'fallback',
    'flatten',
    'getDefault',
    'getDefaults',
    'getDescription',
    'getFallback',
    'getFallbacks',
    'getMetadata',
    'getTitle',
    'is',
    'message',
    'parse',
    'safeParse',
    'summarize',
    'pipe',
    'unwrap',
  ]}
/>

> For more information on <Link href="/api/pipe/">`pipe`</Link>, see the <Link href="/guides/pipelines/">pipelines</Link> guide. For more information on validation methods, see the <Link href="/guides/parse-data/">parse data</Link> guide. For more information on <Link href="/api/flatten/">`flatten`</Link>, see the <Link href="/guides/issues/#formatting">issues</Link> guide.

### Fallback

If an issue occurs while validating your schema, you can catch it with <Link href="/api/fallback/">`fallback`</Link> to return a predefined value instead.

```ts
import * as v from 'valibot';

const StringSchema = v.fallback(v.string(), 'hello');
const stringOutput = v.parse(StringSchema, 123); // 'hello'
```

## Object methods

Object methods make it easier for you to work with object schemas. They are strongly oriented towards TypeScript's utility types.

<ApiList
  label="Object methods"
  items={['keyof', 'omit', 'partial', 'pick', 'required']}
/>

### TypeScript similarities

Like in TypeScript, you can make the values of an object optional with <Link href="/api/partial/">`partial`</Link>, make them required with <Link href="/api/required/">`required`</Link>, and even include/exclude certain values from an existing schema with <Link href="/api/pick/">`pick`</Link> and <Link href="/api/omit/">`omit`</Link>.

```ts
import * as v from 'valibot';

// TypeScript
type Object1 = Partial<{ key1: string; key2: number }>;

// Valibot
const object1 = v.partial(v.object({ key1: v.string(), key2: v.number() }));

// TypeScript
type Object2 = Pick<Object1, 'key1'>;

// Valibot
const object2 = v.pick(object1, ['key1']);
```

## Pipeline methods

Pipeline methods modify the results of validations and transformations within a pipeline.

<ApiList label="Pipeline methods" items={['forward']} />

> For more info about our pipeline feature, see the <Link href="/guides/pipelines/">pipelines</Link> guide.

### Forward

‎<Link href="/api/forward/">`forward`</Link> allows you to associate an issue with a nested schema. For example, if you want to check that both password entries in a registration form match, you can use it to forward the issue to the second password field in case of an error. This allows you to display the error message in the correct place.

```ts
import * as v from 'valibot';

const RegisterSchema = v.pipe(
  v.object({
    email: v.pipe(
      v.string(),
      v.nonEmpty('Please enter your email.'),
      v.email('The email address is badly formatted.')
    ),
    password1: v.pipe(
      v.string(),
      v.nonEmpty('Please enter your password.'),
      v.minLength(8, 'Your password must have 8 characters or more.')
    ),
    password2: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [['password1'], ['password2']],
      (input) => input.password1 === input.password2,
      'The two passwords do not match.'
    ),
    ['password2']
  )
);
```
