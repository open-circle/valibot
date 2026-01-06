---
title: Naming convention
description: >-
  There are two naming conventions that we recommend you to use when working
  with Valibot. In this guide we will explain both of them.
contributors:
  - fabian-hiller
  - shairez
---

# Naming convention

In many cases a schema is created and exported together with the inferred type. There are two naming conventions for this procedure that we recommend you to use when working with Valibot. In this guide we will explain both of them and share why we think they might make sense.

> You don't have to follow any of these conventions. They are only recommendations.

## Convention 1

The first naming convention exports the schema and type with the same name. The advantage of this is that the names are short and the boilerplate is low, since the schema and type can be imported together.

We also recommend to follow the [PascalCase](<https://en.wikipedia.org/wiki/Naming_convention_(programming)>) naming convention. This means that each word starts with an uppercase letter. This is a common convention for TypeScript types, and since schemas basically provide runtime validation of types, it makes sense to use this convention for schemas as well.

### Example

In the following example, a schema is created for a user object. In order to follow the naming convention, the schema and the type are exported with the same name.

```ts
import * as v from 'valibot';

export const PublicUser = v.object({
  name: v.pipe(v.string(), v.maxLength(30)),
  email: v.pipe(v.string(), v.email()),
  avatar: v.nullable(v.file()),
  bio: v.pipe(v.string(), v.maxLength(1000)),
});

export type PublicUser = v.InferOutput<typeof PublicUser>;
```

The schema and type can then be imported and used together.

```ts
import * as v from 'valibot';
import { PublicUser } from './types';

// Use `PublicUser` as a type
const publicUsers: PublicUser[] = [];

publicUsers.push(
  // Use `PublicUser` as a schema
  v.parse(PublicUser, {
    name: 'Jane Doe',
    email: 'jane@example.com',
    avatar: null,
    bio: 'Lorem ipsum ...',
  })
);
```

## Convention 2

The first naming convention can cause naming conflicts with other classes and types. It also causes a problem when you need to export both the input and output types of a schema.

The second naming convention provides a solution. It also follows the [PascalCase](<https://en.wikipedia.org/wiki/Naming_convention_(programming)>) naming convention, but adds an appropriate suffix to each export. Schemas get the suffix `Schema`, input types get the suffix `Input` and output types get the suffix `Output`.

> If there is no difference between the input and output type, the suffix `Data` can optionally be used to indicate this.

This requires the schema and types to be imported separately, which increases the overhead. However, the naming convention is more precise, flexible, and works in any use case.

### Example

In the following example, a schema is created for an image object. In order to follow the naming convention, the schema and the types are exported with different names.

```ts
import * as v from 'valibot';

export const ImageSchema = v.object({
  status: v.optional(v.picklist(['public', 'private']), 'private'),
  created: v.optional(v.date(), () => new Date()),
  title: v.pipe(v.string(), v.maxLength(100)),
  source: v.pipe(v.string(), v.url()),
  size: v.pipe(v.number(), v.minValue(0)),
});

export type ImageInput = v.InferInput<typeof ImageSchema>;
export type ImageOutput = v.InferOutput<typeof ImageSchema>;
```

The schema and the input and output types can then be imported and used separately.

```ts
import * as v from 'valibot';
import { ImageInput, ImageOutput, ImageSchema } from './types';

export function createImage(input: ImageInput): ImageOutput {
  return v.parse(ImageSchema, input);
}
```

> Do you have ideas for improving these conventions? We welcome your feedback and suggestions. Feel free to create an [issue](https://github.com/open-circle/valibot/issues/new) on GitHub.
