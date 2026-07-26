---
title: JSON Schema
description: This guide will show you how to convert Valibot schemas to JSON Schema format.
contributors:
  - fabian-hiller
---

import { Link } from '~/components';

# JSON Schema

In favor of a larger feature set and smaller bundle size, Valibot is not implemented with JSON Schema in mind. However, in some use cases, you may still need a JSON Schema. This guide will show you how to convert Valibot schemas to JSON Schema format.

## Valibot to JSON Schema

A large part of Valibot's schemas are JSON Schema compatible and can be easily converted to the JSON Schema format using the official `toJsonSchema` function. This function is provided via a separate package called [`@valibot/to-json-schema`](https://github.com/open-circle/valibot/tree/main/packages/to-json-schema).

> See the [README](https://github.com/open-circle/valibot/blob/main/packages/to-json-schema/README.md) of the `@valibot/to-json-schema` package for more details. It is also recommended that you take a look at <Link href="/blog/json-schema-package-upgrade/">this blog post</Link>, which highlights recent improvements.

```ts
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

const ValibotEmailSchema = v.pipe(v.string(), v.email());
const JsonEmailSchema = toJsonSchema(ValibotEmailSchema);
// -> { type: 'string', format: 'email' }
```

## Cons of JSON Schema

Valibot schemas intentionally do not output JSON Schema natively. This is because JSON Schema is limited to JSON-compliant data structures. In addition, more advanced features like transformations are not supported. Since we want to leverage the full power of TypeScript, we output a custom format instead.

Another drawback of JSON Schema is that JSON Schema itself does not contain any validation logic. Therefore, an additional function is required that can validate the entire JSON Schema specification. This approach is usually not tree-shakable and results in a large bundle size.

In contrast, Valibot's API design and implementation is completely modular. Every schema is independent and contains its own validation logic. This allows the schemas to be plugged together like LEGO bricks, resulting in a much smaller bundle size due to tree shaking.

## Pros of JSON Schema

Despite these drawbacks, JSON Schema is still widely used in the industry because it also has many advantages. For example, JSON Schemas can be used across programming languages and tools. In addition, JSON Schemas are serializable and can be easily stored in a database or transmitted over a network.
