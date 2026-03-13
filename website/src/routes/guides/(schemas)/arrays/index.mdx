---
title: Arrays
description: >-
  To validate arrays with a schema you can use `array` or `tuple`. You use
  `tuple` if your array has a specific shape and `array` in the other case.
contributors:
  - fabian-hiller
---

import { Link } from '~/components';

# Arrays

To validate arrays with a schema you can use <Link href="/api/array/">`array`</Link> or <Link href="/api/tuple/">`tuple`</Link>. You use <Link href="/api/tuple/">`tuple`</Link> if your array has a specific shape and <Link href="/api/array/">`array`</Link> if it has any number of uniform items.

## Array schema

The first argument you pass to <Link href="/api/array/">`array`</Link> is a schema, which is used to validate the items of the array.

```ts
import * as v from 'valibot';

const ArraySchema = v.array(v.number()); // number[]
```

### Pipeline validation

To validate the length or contents of the array, you can use a pipeline.

```ts
import * as v from 'valibot';

const ArraySchema = v.pipe(
  v.array(v.string()),
  v.minLength(1),
  v.maxLength(5),
  v.includes('foo'),
  v.excludes('bar')
);
```

## Tuple schema

A <Link href="/api/tuple/">`tuple`</Link> is an array with a specific shape. The first argument that you pass to the function is a tuple of schemas that defines its shape.

```ts
import * as v from 'valibot';

const TupleSchema = v.tuple([v.string(), v.number()]); // [string, number]
```

### Loose and strict tuples

The <Link href="/api/tuple/">`tuple`</Link> schema removes unknown items. This means that items that you have not defined in the first argument are not validated and added to the output. You can change this behavior by using the <Link href="/api/looseTuple/">`looseTuple`</Link> or <Link href="/api/strictTuple/">`strictTuple`</Link> schema instead.

The <Link href="/api/looseTuple/">`looseTuple`</Link> schema allows unknown items and adds them to the output. The <Link href="/api/strictTuple/">`strictTuple`</Link> schema forbids unknown items and returns an issue for the first unknown item found.

### Tuple with specific rest

Alternatively, you can also use the <Link href="/api/tupleWithRest/">`tupleWithRest`</Link> schema to define a specific schema for unknown items. Any items not defined in the first argument are then validated against the schema of the second argument.

```ts
import * as v from 'valibot';

const TupleSchema = v.tupleWithRest([v.string(), v.number()], v.null());
```

### Pipeline validation

Similar to arrays, you can use a pipeline to validate the length and contents of a tuple.

```ts
import * as v from 'valibot';

const TupleSchema = v.pipe(
  v.tupleWithRest([v.string()], v.string()),
  v.maxLength(5),
  v.includes('foo'),
  v.excludes('bar')
);
```
