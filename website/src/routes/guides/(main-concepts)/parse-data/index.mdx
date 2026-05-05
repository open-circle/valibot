---
title: Parse data
description: >-
  Now that you've learned how to create a schema, let's look at how you can use
  it to validate unknown data and make it type-safe.
contributors:
  - fabian-hiller
  - BastiDood
  - SeaSide53
  - cmaciasjimenez
---

import { Link } from '~/components';

# Parse data

Now that you've learned how to create a schema, let's look at how you can use it to validate unknown data and make it type-safe. There are three different ways to do this.

> Each schema has a `~run` method. However, this is an internal API and should only be used if you know what you are doing.

## Parse and throw

The <Link href="/api/parse/">`parse`</Link> method will throw a <Link href="/api/ValiError/">`ValiError`</Link> if the input does not match the schema. Therefore, you should use a try/catch block to catch errors. If the input matches the schema, it is valid and the output of the schema will be returned with the correct TypeScript type.

```ts
import * as v from 'valibot';

try {
  const EmailSchema = v.pipe(v.string(), v.email());
  const email = v.parse(EmailSchema, 'jane@example.com');

  // Handle errors if one occurs
} catch (error) {
  console.log(error);
}
```

## Parse and return

If you want issues to be returned instead of thrown, you can use <Link href="/api/safeParse/">`safeParse`</Link>. The returned value then contains the `.success` property, which is `true` if the input is valid or `false` otherwise.

If the input is valid, you can use `.output` to get the output of the schema validation. Otherwise, if the input was invalid, the issues found can be accessed via `.issues`.

```ts
import * as v from 'valibot';

const EmailSchema = v.pipe(v.string(), v.email());
const result = v.safeParse(EmailSchema, 'jane@example.com');

if (result.success) {
  const email = result.output;
} else {
  console.log(result.issues);
}
```

## Type guards

Another way to validate data that can be useful in individual cases is to use a type guard. You can use either a type predicate with the <Link href="/api/is/">`is`</Link> method or an assertion function with the <Link href="/api/assert/">`assert`</Link> method.

If a type guard is used, the issues of the validation cannot be accessed. Also, transformations have no effect and unknown keys of an object are not removed. Therefore, this approach is not as safe and powerful as the two previous ways. Also, due to a TypeScript limitation, it can currently only be used with synchronous schemas.

```ts
import * as v from 'valibot';

const EmailSchema = v.pipe(v.string(), v.email());
const data: unknown = 'jane@example.com';

if (v.is(EmailSchema, data)) {
  const email = data; // string
}
```

## Configuration

By default, Valibot exhaustively collects every issue during validation to give you detailed feedback on why the input does not match the schema. If this is not required for your use case, you can control this behavior with `abortEarly` and `abortPipeEarly` to improve the performance of validation.

### Abort validation

If you set `abortEarly` to `true`, data validation immediately aborts upon finding the first issue. If you just want to know if some data matches a schema, but you don't care about the details, this can improve performance.

```ts
import * as v from 'valibot';

try {
  const ProfileSchema = v.object({
    name: v.string(),
    bio: v.string(),
  });
  const profile = v.parse(
    ProfileSchema,
    { name: 'Jane', bio: '' },
    { abortEarly: true }
  );

  // Handle errors if one occurs
} catch (error) {
  console.log(error);
}
```

### Abort pipeline

If you only set `abortPipeEarly` to `true`, the validation within a pipeline will only abort after finding the first issue. For example, if you only want to show the first error of a field when validating a form, you can use this option to improve performance.

```ts
import * as v from 'valibot';

try {
  const EmailSchema = v.pipe(v.string(), v.email(), v.endsWith('@example.com'));
  const email = v.parse(EmailSchema, 'jane@example.com', {
    abortPipeEarly: true,
  });

  // Handle errors if one occurs
} catch (error) {
  console.log(error);
}
```
