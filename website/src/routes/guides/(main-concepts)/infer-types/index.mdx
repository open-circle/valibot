---
title: Infer types
description: >-
  Another cool feature of schemas is the ability to infer input and output
  types. This makes your work even easier.
contributors:
  - fabian-hiller
  - BastiDood
  - gmaxlev
---

import { Link } from '~/components';

# Infer types

Another cool feature of schemas is the ability to infer input and output types. This makes your work even easier because you don't have to write the type definition yourself.

## Infer input types

The input type of a schema corresponds to the TypeScript type that the incoming data of a schema must match to be valid. To extract this type you use the utility type <Link href="/api/InferInput/">`InferInput`</Link>.

> You are probably interested in the input type only in special cases. In most cases, the output type should be sufficient.

```ts
import * as v from 'valibot';

const LoginSchema = v.object({
  email: v.string(),
  password: v.string(),
});

type LoginInput = v.InferInput<typeof LoginSchema>; // { email: string; password: string }
```

## Infer output types

The output type differs from the input type only if you use <Link href="/api/optional/">`optional`</Link>, <Link href="/api/nullable/">`nullable`</Link>, <Link href="/api/nullish/">`nullish`</Link> or <Link href="/api/undefinedable/">`undefinedable`</Link> with a default value or <Link href="/api/brand/">`brand`</Link>, <Link href="/api/readonly/">`readonly`</Link> or <Link href="/api/transform/">`transform`</Link> to transform the input or data type of a schema after validation. The output type corresponds to the output of <Link href="/api/parse/">`parse`</Link> and <Link href="/api/safeParse/">`safeParse`</Link>. To infer it, you use the utility type <Link href="/api/InferOutput/">`InferOutput`</Link>.

```ts
import * as v from 'valibot';
import { hashPassword } from '~/utils';

const LoginSchema = v.pipe(
  v.object({
    email: v.string(),
    password: v.pipe(v.string(), v.transform(hashPassword)),
  }),
  v.transform((input) => {
    return {
      ...input,
      timestamp: new Date().toISOString(),
    };
  })
);

type LoginOutput = v.InferOutput<typeof LoginSchema>; // { email: string; password: string; timestamp: string }
```

## Infer issue types

You can also infer the possible issues of a schema. This can be useful if you want to handle the issues in a particular way. To extract this information from a schema you use the utility type <Link href="/api/InferIssue/">`InferIssue`</Link>.

```ts
import * as v from 'valibot';

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

type Issue = v.InferIssue<typeof LoginSchema>; // v.ObjectIssue | v.StringIssue | v.EmailIssue<string> | v.MinLengthIssue<string, 8>
```
