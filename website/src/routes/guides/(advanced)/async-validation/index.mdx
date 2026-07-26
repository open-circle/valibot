---
title: Async validation
description: >-
  By default, Valibot validates each schema synchronously. This is usually the
  fastest way to validate unknown data, but sometimes you need to validate
  something asynchronously.
contributors:
  - fabian-hiller
---

import { Link } from '~/components';

# Async validation

By default, Valibot validates each schema synchronously. This is usually the fastest way to validate unknown data, but sometimes you need to validate something asynchronously. For example, you might want to check if a username already exists in your database.

## How it works

To be able to do this, Valibot provides an asynchronous implementation when necessary. The only difference is that the asynchronous implementation is promise-based. Otherwise, the API and functionality is exactly the same.

### Naming

The asynchronous implementation starts with the same name as the synchronous one, but adds the suffix `Async` to the end. For example, the asynchronous implementation of <Link href="/api/pipe/">`pipe`</Link> is called <Link href="/api/pipeAsync/">`pipeAsync`</Link> and the asynchronous implementation of <Link href="/api/object/">`object`</Link> is called <Link href="/api/objectAsync/">`objectAsync`</Link>.

### Nesting

Asynchronous functions can only be nested inside other asynchronous functions. This means that if you need to validate a string within an object asynchronously, you must also switch the object validation to the asynchronous implementation.

This is not necessary in the other direction. You can nest synchronous functions within asynchronous functions, and we recommend that you do so in most cases to keep complexity and bundle size to a minimum.

#### Rule of thumb

We recommend that you always start with the synchronous implementation, and only move the necessary parts to the asynchronous implementation as needed. If you are using TypeScript, it is not possible to make a mistake here, as our API is completely type-safe and will notify you when you embed an asynchronous function into a synchronous function.

### Example

Let's say you want to validate a profile object and the username should be checked asynchronously against your database. Only the object and username validation needs to be asynchronous, the rest can stay synchronous.

```ts
import * as v from 'valibot';
import { isUsernameAvailable } from '~/api';

const ProfileSchema = v.objectAsync({
  username: v.pipeAsync(v.string(), v.checkAsync(isUsernameAvailable)),
  avatar: v.pipe(v.string(), v.url()),
  description: v.pipe(v.string(), v.maxLength(1000)),
});
```
