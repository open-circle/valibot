---
title: Extend Valibot
description: >-
  How to build fully compatible custom schemas, validation actions,
  transformation actions, and dynamic schema factories from scratch.
contributors:
  - fabian-hiller
---

import { Link } from '~/components';

# Extend Valibot

This guide is for developers who need to go beyond Valibot's built-in primitives — for example when validating a domain-specific format, wrapping a schema in a reusable envelope, or building a library on top of Valibot. Because every schema and action is just a plain object satisfying a shared interface, custom schemas and actions are first-class citizens — not second-class extensions.

We cover three levels of extension: Composing existing schemas into reusable factories, building fully custom schemas from scratch, and building fully custom actions from scratch.

## Dynamic schemas

The lightest form of extension is composing existing schemas into a reusable generic factory — no custom interfaces or internal utilities required. We can wrap any user-provided schema by using <Link href="/api/GenericSchema/">`GenericSchema`</Link> as the type constraint. It is an alias for <Link href="/api/BaseSchema/">`BaseSchema`</Link> with all type parameters defaulting to `unknown`, designed specifically for this purpose. TypeScript propagates the concrete type so the return type is fully inferred.

A common use case is wrapping a user-provided item schema in a reusable envelope, like a pagination wrapper:

```ts
import * as v from 'valibot';

function paginatedList<TItem extends v.GenericSchema>(item: TItem) {
  return v.object({
    items: v.array(item),
    total: v.number(),
    page: v.number(),
  });
}

const UserList = paginatedList(v.object({ id: v.number(), name: v.string() }));

type UserList = v.InferOutput<typeof UserList>;
// {
//   items: { id: number; name: string }[];
//   total: number;
//   page: number;
// }
```

## Custom schemas

A custom schema is a plain object with three parts: A typed issue interface extending <Link href="/api/BaseIssue/">`BaseIssue`</Link>, a typed schema interface extending <Link href="/api/BaseSchema/">`BaseSchema`</Link>, and a factory function that returns the object.

Two internal utilities do the heavy lifting: `_getStandardProps` wires up the Standard Schema `'~standard'` getter, and `_addIssue` constructs and attaches a well-formed issue to the dataset. The `label` argument passed to `_addIssue` (e.g. `'type'`) describes what kind of issue it is and is used to build the human-readable `message`.

Here is a simplified version of Valibot's own `string` schema:

```ts
import * as v from 'valibot';

// 1. Define the issue interface
interface StringIssue extends v.BaseIssue<unknown> {
  kind: 'schema';
  type: 'string';
  expected: 'string';
}

// 2. Define the schema interface
interface StringSchema<TMessage extends v.ErrorMessage<StringIssue> | undefined>
  extends v.BaseSchema<string, string, StringIssue> {
  type: 'string';
  reference: typeof string;
  expects: 'string';
  message: TMessage;
}

// 3. Implement the factory function
function string<TMessage extends v.ErrorMessage<StringIssue> | undefined>(
  message?: TMessage
): StringSchema<TMessage> {
  return {
    kind: 'schema',
    type: 'string',
    reference: string,
    expects: 'string',
    async: false,
    message,
    get '~standard'() {
      return v._getStandardProps(this);
    },
    '~run'(dataset, config) {
      if (typeof dataset.value === 'string') {
        // @ts-expect-error
        dataset.typed = true;
      } else {
        v._addIssue(this, 'type', dataset, config);
      }
      // @ts-expect-error
      return dataset as v.OutputDataset<string, StringIssue>;
    },
  };
}
```

The `// @ts-expect-error` comments are a deliberate trade-off in Valibot's codebase to avoid complex conditional generics and improve runtime performance by mutating the `dataset` object. They are safe here because the `typed` flag and return type are always consistent with the logic above.

> `_addIssue` and `_getStandardProps` are prefixed with an underscore to signal that they are internal. They are exported for advanced use cases like this, but their signatures may change between minor versions.

`v.ErrorMessage<T>` accepts either a plain string or a callback `(issue: T) => string`, so custom error messages can be static or dynamically derived from the issue.

## Custom actions

Actions follow the same plain-object pattern. Valibot has three action kinds — <Link href="/api/BaseValidation/">`BaseValidation`</Link>, <Link href="/api/BaseTransformation/">`BaseTransformation`</Link>, and <Link href="/api/BaseMetadata/">`BaseMetadata`</Link> — each with its own `kind` string. Validation actions check a typed value and may add issues. Transformation actions convert the value to a new type or value. Metadata actions carry static annotations and are never executed during pipeline runs.

Here is a simplified version of Valibot's own `email` validation action:

```ts
import * as v from 'valibot';

const EMAIL_REGEX =
  /^[\w+-]+(?:\.[\w+-]+)*@[\w+-]+(?:\.[\w+-]+)*\.[a-zA-Z]{2,}$/iu;

// 1. Define the issue interface
interface EmailIssue<TInput extends string> extends v.BaseIssue<TInput> {
  kind: 'validation';
  type: 'email';
  expected: null;
  received: `"${string}"`;
  requirement: RegExp;
}

// 2. Define the action interface
interface EmailAction<
  TInput extends string,
  TMessage extends v.ErrorMessage<EmailIssue<TInput>> | undefined,
> extends v.BaseValidation<TInput, TInput, EmailIssue<TInput>> {
  type: 'email';
  reference: typeof email;
  expects: null;
  requirement: RegExp;
  message: TMessage;
}

// 3. Implement the factory function
function email<
  TInput extends string,
  TMessage extends v.ErrorMessage<EmailIssue<TInput>> | undefined,
>(message?: TMessage): EmailAction<TInput, TMessage> {
  return {
    kind: 'validation',
    type: 'email',
    reference: email,
    expects: null,
    async: false,
    requirement: EMAIL_REGEX,
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        v._addIssue(this, 'email', dataset, config);
      }
      return dataset;
    },
  };
}
```

Notice that `'~run'` first checks `dataset.typed` before testing the value. This is the correct pattern for all validation actions — if the dataset is not yet typed (e.g. a schema earlier in the pipe failed), we skip the check entirely.
