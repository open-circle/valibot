---
title: Migrate to v0.31.0
description: >-
  Migrating Valibot from an older version to v0.31.0 isn't complicated. Except
  for the new `pipe` method, most things remain the same.
contributors:
  - fabian-hiller
  - jozefini
  - lesleh
---

import { Link } from '~/components';

# Migrate to v0.31.0

Migrating Valibot from an older version to v0.31.0 isn't complicated. Except for the new <Link href="/api/pipe/">`pipe`</Link> method, most things remain the same. The following guide will help you to migrate automatically or manually step by step and also point out important differences.

## Automatic upgrade

We worked together with [Codemod](https://codemod.com/registry/valibot-migrate-to-v0-31-0) and [Grit](https://docs.grit.io/registry/github.com/open-circle/valibot/migrate_to_v0_31_0) to automatically upgrade your schemas to the new version with a single CLI command. Both codemods are similar. You can use one or the other. Simply run the command in the directory of your project.

> We recommend using a version control system like [Git](https://git-scm.com/) so that you can revert changes if the codemod screws something up.

```bash
# Codemod
npx codemod valibot/migrate-to-v0.31.0

# Grit
npx @getgrit/cli apply github.com/open-circle/valibot#migrate_to_v0_31_0
```

Please create an [issue](https://github.com/open-circle/valibot/issues/new) if you encounter any problems or unexpected behavior with the provided codemods.

## Restructure code

As mentioned above, one of the biggest differences is the new <Link href="/api/pipe/">`pipe`</Link> method. Previously, you passed the pipeline as an array to a schema function. Now you pass the schema with various actions to the new <Link href="/api/pipe/">`pipe`</Link> method to extend a schema.

```ts
// Change this
const Schema = v.string([v.email()]);

// To this
const Schema = v.pipe(v.string(), v.email());
```

We will be publishing a [blog post](/blog/valibot-v0.31.0-is-finally-available/) soon explaining all the benefits of this change. In the meantime, you can read the description of discussion [#463](https://github.com/open-circle/valibot/discussions/463) and PR [#502](https://github.com/open-circle/valibot/pull/502), which introduced this change.

## Change names

Most of the names are the same as before. However, there are some exceptions. The following table shows all names that have changed.

| v0.30.0          | v0.31.0                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `anyAsync`       | <Link href="/api/any/">`any`</Link>                                                                                                    |
| `BaseSchema`     | <Link href="/api/GenericSchema/">`GenericSchema`</Link>                                                                                |
| `bigintAsync`    | <Link href="/api/bigint/">`bigint`</Link>                                                                                              |
| `blobAsync`      | <Link href="/api/blob/">`blob`</Link>                                                                                                  |
| `booleanAsync`   | <Link href="/api/boolean/">`boolean`</Link>                                                                                            |
| `custom`         | <Link href="/api/check/">`check`</Link>                                                                                                |
| `customAsync`    | <Link href="/api/checkAsync/">`checkAsync`</Link>                                                                                      |
| `coerce`         | <Link href="/api/pipe/">`pipe`</Link>, <Link href="/api/unknown/">`unknown`</Link> and <Link href="/api/transform/">`transform`</Link> |
| `dateAsync`      | <Link href="/api/date/">`date`</Link>                                                                                                  |
| `enumAsync`      | <Link href="/api/enum/">`enum_`</Link>                                                                                                 |
| `Input`          | <Link href="/api/InferInput/">`InferInput`</Link>                                                                                      |
| `instanceAsync`  | <Link href="/api/instance/">`instance`</Link>                                                                                          |
| `literalAsync`   | <Link href="/api/literal/">`literal`</Link>                                                                                            |
| `nanAsync`       | <Link href="/api/nan/">`nan`</Link>                                                                                                    |
| `neverAsync`     | <Link href="/api/never/">`never`</Link>                                                                                                |
| `nullAsync`      | <Link href="/api/null/">`null_`</Link>                                                                                                 |
| `numberAsync`    | <Link href="/api/number/">`number`</Link>                                                                                              |
| `Output`         | <Link href="/api/InferOutput/">`InferOutput`</Link>                                                                                    |
| `picklistAsync`  | <Link href="/api/picklist/">`picklist`</Link>                                                                                          |
| `SchemaConfig`   | <Link href="/api/Config/">`Config`</Link>                                                                                              |
| `special`        | <Link href="/api/custom/">`custom`</Link>                                                                                              |
| `specialAsync`   | <Link href="/api/customAsync/">`customAsync`</Link>                                                                                    |
| `SchemaConfig`   | <Link href="/api/string/">`Config`</Link>                                                                                              |
| `stringAsync`    | <Link href="/api/string/">`string`</Link>                                                                                              |
| `symbolAsync`    | <Link href="/api/symbol/">`symbol`</Link>                                                                                              |
| `undefinedAsync` | <Link href="/api/undefined/">`undefined_`</Link>                                                                                       |
| `unknownAsync`   | <Link href="/api/unknown/">`unknown`</Link>                                                                                            |
| `toCustom`       | <Link href="/api/transform/">`transform`</Link>                                                                                        |
| `toTrimmed`      | <Link href="/api/trim/">`trim`</Link>                                                                                                  |
| `toTrimmedEnd`   | <Link href="/api/trimEnd/">`trimEnd`</Link>                                                                                            |
| `toTrimmedStart` | <Link href="/api/trimStart/">`trimStart`</Link>                                                                                        |
| `voidAsync`      | <Link href="/api/void/">`void_`</Link>                                                                                                 |

## Special cases

More complex schemas may require a bit more restructuring. This section provides more details on how to migrate specific functions.

### Objects and tuples

Previously, you could pass a `rest` argument to the <Link href="/api/object/">`object`</Link> and <Link href="/api/tuple/">`tuple`</Link> schemas to define the behavior for unknown entries and items. We have removed the `rest` argument to simplify the implementation and reduce the bundle size if this functionality is not needed. If you do need this functionality, there is now a new <Link href="/api/objectWithRest/">`objectWithRest`</Link> and <Link href="/api/tupleWithRest/">`tupleWithRest`</Link> schema.

```ts
// Change this
const ObjectSchema = v.object({ key: v.string() }, v.null_());
const TupleSchema = v.tuple([v.string()], v.null_());

// To this
const ObjectSchema = v.objectWithRest({ key: v.string() }, v.null_());
const TupleSchema = v.tupleWithRest([v.string()], v.null_());
```

To further improve the developer experience, we have also added a <Link href="/api/looseObject/">`looseObject`</Link>, <Link href="/api/looseTuple/">`looseTuple`</Link>, <Link href="/api/strictObject/">`strictObject`</Link> and <Link href="/api/strictTuple/">`strictTuple`</Link> schema. These schemas allow or disallow unknown entries or items.

```ts
// Change this
const LooseObjectSchema = v.object({ key: v.string() }, v.unknown());
const LooseTupleSchema = v.tuple([v.string()], v.unknown());
const StrictObjectSchema = v.object({ key: v.string() }, v.never());
const StrictTupleSchema = v.tuple([v.string()], v.never());

// To this
const LooseObjectSchema = v.looseObject({ key: v.string() });
const LooseTupleSchema = v.looseTuple([v.string()]);
const StrictObjectSchema = v.strictObject({ key: v.string() });
const StrictTupleSchema = v.strictTuple([v.string()]);
```

### Object merging

Since there are now 4 different object schemas, we could no longer provide a simple `merge` function that works in all cases, as we never know which schema you want to merge the other objects into. But there is a simple workaround with a similar developer experience.

```ts
const ObjectSchema1 = v.object({ foo: v.string() });
const ObjectSchema2 = v.object({ bar: v.number() });

// Change this
const MergedObject = v.merge([ObjectSchema1, ObjectSchema2]);

// To this
const MergedObject = v.object({
  ...ObjectSchema1.entries,
  ...ObjectSchema2.entries,
});
```

### Brand and transform

Previously, <Link href="/api/brand/">`brand`</Link> and <Link href="/api/transform/">`transform`</Link> were methods that could be wrapped around a schema to modify it. With our new <Link href="/api/pipe/">`pipe`</Link> method, this is no longer necessary. Instead, <Link href="/api/brand/">`brand`</Link> and <Link href="/api/transform/">`transform`</Link> are now transformation actions that can be placed directly in a pipeline, resulting in better readability, especially for complex schemas.

```ts
// Change this
const BrandedSchema = v.brand(v.string(), 'foo');
const TransformedSchema = v.transform(v.string(), (input) => input.length);

// To this
const BrandedSchema = v.pipe(v.string(), v.brand('foo'));
const TransformedSchema = v.pipe(
  v.string(),
  v.transform((input) => input.length)
);
```

### Coerce method

The `coerce` method has been removed because we felt it was an insecure API. In most cases, you don't want to coerce an unknown input into a specific data type. Instead, you want to transform a specific data type into another specific data type. For example, a string or a number into a date. To explicitly define the input type, we recommend using the new <Link href="/api/pipe/">`pipe`</Link> method together with the <Link href="/api/transform/">`transform`</Link> action to achieve the same functionality.

```ts
// Change this
const DateSchema = v.coerce(v.date(), (input) => new Date(input));

// To this
const DateSchema = v.pipe(
  v.union([v.string(), v.number()]),
  v.transform((input) => new Date(input))
);
```

### Flatten issues

Previously, the <Link href="/api/flatten/">`flatten`</Link> function accepted a <Link href="/api/ValiError/">`ValiError`</Link> or an array of issues. We have simplified the implementation by only allowing an array of issues to be passed.

```ts
// Change this
const flatErrors = v.flatten(error);

// To this
const flatErrors = v.flatten(error.issues);
```
