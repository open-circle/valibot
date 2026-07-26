---
title: Objects
description: >-
  To validate objects with a schema, you can use `object` or `record`. You use
  `object` for an object with a specific shape and `record` in the other case.
contributors:
  - fabian-hiller
  - Mini-ghost
---

import { Link } from '~/components';

# Objects

To validate objects with a schema, you can use <Link href="/api/object/">`object`</Link> or <Link href="/api/record/">`record`</Link>. You use <Link href="/api/object/">`object`</Link> for an object with a specific shape and <Link href="/api/record/">`record`</Link> for objects with any number of uniform entries.

## Object schema

The first argument is used to define the specific structure of the object. Each entry consists of a key and a schema as the value. The entries of the input are then validated against these schemas.

```ts
import * as v from 'valibot';

const ObjectSchema = v.object({
  key1: v.string(),
  key2: v.number(),
});
```

### Loose and strict objects

The <Link href="/api/object/">`object`</Link> schema removes unknown entries. This means that entries that you have not defined in the first argument are neither validated nor added to the output. You can change this behavior by using the <Link href="/api/looseObject/">`looseObject`</Link> or <Link href="/api/strictObject/">`strictObject`</Link> schema instead.

The <Link href="/api/looseObject/">`looseObject`</Link> schema allows unknown entries and adds them to the output. The <Link href="/api/strictObject/">`strictObject`</Link> schema forbids unknown entries and returns an issue for the first unknown entry found.

### Object with specific rest

Alternatively, you can also use the <Link href="/api/objectWithRest/">`objectWithRest`</Link> schema to define a specific schema for unknown entries. Any entries not defined in the first argument are then validated against the schema of the second argument.

```ts
import * as v from 'valibot';

const ObjectSchema = v.objectWithRest(
  {
    key1: v.string(),
    key2: v.number(),
  },
  v.null()
);
```

### Pipeline validation

To validate the value of an entry based on another entry, you can wrap you schema with the <Link href="/api/check/">`check`</Link> validation action in a pipeline. You can also use <Link href="/api/forward/">`forward`</Link> to assign the issue to a specific object key in the event of an error.

> If you only want to validate specific entries, we recommend using <Link href="/api/partialCheck/">`partialCheck`</Link> instead as <Link href="/api/check/">`check`</Link> can only be executed if the input is fully typed.

```ts
import * as v from 'valibot';

const CalculationSchema = v.pipe(
  v.object({
    a: v.number(),
    b: v.number(),
    sum: v.number(),
  }),
  v.forward(
    v.check(({ a, b, sum }) => a + b === sum, 'The calculation is incorrect.'),
    ['sum']
  )
);
```

## Record schema

For an object with any number of uniform entries, <Link href="/api/record/">`record`</Link> is the right choice. The schema passed as the first argument validates the keys of your record, and the schema passed as the second argument validates the values.

```ts
import * as v from 'valibot';

const RecordSchema = v.record(v.string(), v.number()); // Record<string, number>
```

### Specific record keys

Instead of <Link href="/api/string/">`string`</Link>, you can also use <Link href="/api/custom/">`custom`</Link>, <Link href="/api/enum/">`enum`</Link>, <Link href="/api/literal/">`literal`</Link>, <Link href="/api/picklist/">`picklist`</Link> or <Link href="/api/union/">`union`</Link> to validate the keys.

```ts
import * as v from 'valibot';

const RecordSchema = v.record(v.picklist(['key1', 'key2']), v.number()); // { key1?: number; key2?: number }
```

Note that <Link href="/api/record/">`record`</Link> marks all literal keys as optional in this case. If you want to make them required, you can use the <Link href="/api/object/">`object`</Link> schema with the <Link href="/api/entriesFromList/">`entriesFromList`</Link> util instead.

```ts
import * as v from 'valibot';

const RecordSchema = v.object(v.entriesFromList(['key1', 'key2'], v.number())); // { key1: number; key2: number }
```

### Pipeline validation

To validate the value of an entry based on another entry, you can wrap you schema with the <Link href="/api/check/">`check`</Link> validation action in a pipeline. You can also use <Link href="/api/forward/">`forward`</Link> to assign the issue to a specific record key in the event of an error.

```ts
import * as v from 'valibot';

const CalculationSchema = v.pipe(
  v.record(v.picklist(['a', 'b', 'sum']), v.number()),
  v.forward(
    v.check(
      ({ a, b, sum }) => (a || 0) + (b || 0) === (sum || 0),
      'The calculation is incorrect.'
    ),
    ['sum']
  )
);
```
