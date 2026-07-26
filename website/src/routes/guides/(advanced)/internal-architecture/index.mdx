---
title: Internal Architecture
description: >-
  A deep technical guide on Valibot's internal object model and pipeline
  execution engine — the plain object design that powers every schema and
  action.
contributors:
  - fabian-hiller
---

import { Link } from '~/components';

# Internal Architecture

This guide targets library authors and advanced users who want to understand how Valibot works under the hood. It covers the internal object model — schemas, actions, datasets, issues, and config — and how they fit together in the pipeline execution engine.

Valibot is built around a simple modularity principle: every schema and action is an independent, interchangeable building block. Like Lego bricks, they each expose a standard connector — a shared interface contract — and can be freely combined, nested, and replaced without any central registry or shared state. Valibot's built-in schemas and actions follow the exact same rules as any custom ones you write yourself, which means the library can be extended or partially replaced without special privileges.

This design is backed by a concrete technical choice: Every schema and action is a plain object literal returned by a pure factory function. There are no classes, no prototypes beyond `Object`, and no shared mutable state. Because each factory is a pure function with no side effects, it is annotated with `// @__NO_SIDE_EFFECTS__`, which allows bundlers to eliminate every unused schema and action from the final bundle.

## Schemas

Schemas are the starting point for using Valibot. They validate a specific data type, like a string, object, or date, and can be reused or nested to reflect more complex data structures. Every schema is a plain object that satisfies <Link href="/api/BaseSchema/">`BaseSchema`</Link>:

| Property      | Type            | Description                                                                 |
| ------------- | --------------- | --------------------------------------------------------------------------- |
| `kind`        | `'schema'`      | Identifies this object as a schema                                          |
| `type`        | `string`        | snake_case name, e.g. `'string'`, `'loose_object'`                          |
| `reference`   | `Function`      | The factory function itself (for identity checks)                           |
| `expects`     | `string`        | Human-readable expected type, e.g. `'string'`                               |
| `async`       | `false`         | `true` on async variants                                                    |
| `'~standard'` | `StandardProps` | Standard Schema v1 properties (lazy getter)                                 |
| `'~run'`      | `Function`      | Parses an `UnknownDataset` and returns an output dataset                    |
| `'~types'`    | `undefined`     | Phantom field for TypeScript inference only — always `undefined` at runtime |

Validation logic beyond the base type check lives in a `pipe` array added by the <Link href="/api/pipe/">`pipe`</Link> method and some schemas expose additional schema-specific properties. See [Runtime properties](/guides/integrate-valibot/#runtime-properties) for a full breakdown.

Any object that satisfies the `BaseSchema` interface is a valid schema — whether it comes from Valibot's built-ins, a third-party package, or your own code. The guide [Extend Valibot](/guides/extend-valibot/) walks through building one from scratch.

## Actions

Actions come in three kinds. The first and probably most important one are validation actions. They check an already-typed value and may add issues. Every validation action is a plain object that satisfies <Link href="/api/BaseValidation/">`BaseValidation`</Link>:

| Property    | Type             | Description                                                                 |
| ----------- | ---------------- | --------------------------------------------------------------------------- |
| `kind`      | `'validation'`   | Identifies this object as a validation action                               |
| `type`      | `string`         | snake_case name, e.g. `'min_length'`, `'email'`                             |
| `reference` | `Function`       | The factory function itself (for identity checks)                           |
| `expects`   | `string \| null` | Human-readable expected value description; used in issue messages           |
| `async`     | `false`          | `true` on async variants                                                    |
| `'~run'`    | `Function`       | Validates the current dataset value                                         |
| `'~types'`  | `undefined`      | Phantom field for TypeScript inference only — always `undefined` at runtime |

The second one are transformation actions. They convert the value to a new type and/or value. Every transformation action is a plain object that satisfies <Link href="/api/BaseTransformation/">`BaseTransformation`</Link>:

| Property    | Type               | Description                                                                 |
| ----------- | ------------------ | --------------------------------------------------------------------------- |
| `kind`      | `'transformation'` | Identifies this object as a transformation action                           |
| `type`      | `string`           | snake_case name, e.g. `'trim'`, `'to_lower_case'`                           |
| `reference` | `Function`         | The factory function itself (for identity checks)                           |
| `async`     | `false`            | `true` on async variants                                                    |
| `'~run'`    | `Function`         | Transforms the current dataset value                                        |
| `'~types'`  | `undefined`        | Phantom field for TypeScript inference only — always `undefined` at runtime |

The third one are metadata actions. They carry static annotations and are always skipped during pipeline execution. Every metadata action is a plain object that satisfies <Link href="/api/BaseMetadata/">`BaseMetadata`</Link>:

| Property    | Type         | Description                                       |
| ----------- | ------------ | ------------------------------------------------- |
| `kind`      | `'metadata'` | Identifies this object as a metadata action       |
| `type`      | `string`     | snake_case name, e.g. `'title'`, `'description'`  |
| `reference` | `Function`   | The factory function itself (for identity checks) |

Just like schemas, any object that satisfies one of these action interfaces is a valid action that can be dropped into any pipeline.

## Datasets

A dataset is the container that carries a value through the validation pipeline. It is passed to each `'~run'` method in sequence, and as the pipeline executes, the dataset's `typed` flag and `issues` array are updated to reflect the current state of validation.

Datasets are **mutable by design** for performance reasons. `'~run'` implementations modify `dataset.value` and `dataset.typed` in place rather than returning new objects.

| Type                       | `typed`     | `issues`              | Description                              |
| -------------------------- | ----------- | --------------------- | ---------------------------------------- |
| `UnknownDataset`           | `undefined` | `undefined`           | Raw input, not yet validated             |
| `SuccessDataset<T>`        | `true`      | `undefined`           | Fully typed, no issues                   |
| `PartialDataset<T, Issue>` | `true`      | `[Issue, ...Issue[]]` | Typed but has value or formatting issues |
| `FailureDataset<Issue>`    | `false`     | `[Issue, ...Issue[]]` | Not typed, has fatal issues              |

## Issues

When a schema or validation action finds a problem with the input, it adds an issue to the dataset. Every issue is a plain object that satisfies <Link href="/api/BaseIssue/">`BaseIssue`</Link>:

| Property      | Type                                           | Description                                              |
| ------------- | ---------------------------------------------- | -------------------------------------------------------- |
| `kind`        | `'schema' \| 'validation' \| 'transformation'` | Mirrors the kind of the object that raised it            |
| `type`        | `string`                                       | Mirrors the type of the object that raised it            |
| `input`       | `unknown`                                      | The raw input value that caused the issue                |
| `expected`    | `string \| null`                               | Human-readable description of what was expected          |
| `received`    | `string`                                       | Human-readable description of what was actually received |
| `message`     | `string`                                       | The final, resolved error message string                 |
| `requirement` | `unknown \| undefined`                         | The specific constraint that failed, e.g. a `RegExp`     |
| `path`        | `IssuePathItem[] \| undefined`                 | Location of the issue in a nested structure              |
| `issues`      | `BaseIssue[] \| undefined`                     | Sub-issues, used by union and intersect schemas          |

`BaseIssue` also extends <Link href="/api/Config/">`Config`</Link>, so the `lang`, `message`, `abortEarly`, and `abortPipeEarly` fields from the parse config are carried into the issue object as well.

## Config

Every `'~run'` call receives a config object alongside the dataset. It controls language selection, custom error messages, and early-abort behavior. The <Link href="/api/Config/">`Config`</Link> interface has four fields:

| Property         | Type                        | Description                                         |
| ---------------- | --------------------------- | --------------------------------------------------- |
| `lang`           | `string \| undefined`       | BCP 47 language tag for i18n error messages         |
| `message`        | `ErrorMessage \| undefined` | A global error message override for the parse call  |
| `abortEarly`     | `boolean \| undefined`      | Stop on the first issue anywhere in the schema tree |
| `abortPipeEarly` | `boolean \| undefined`      | Stop on the first issue within a single pipe        |

## Pipe execution

The <Link href="/api/pipe/">`pipe`</Link> method is the universal connector between all building blocks. It returns a new schema object that spreads all properties of the root schema and adds a `pipe` property — a tuple with the root schema at index 0 and additional pipe items at index 1+.

Pipe items can be validation actions, transformation actions, metadata actions, or even other schemas. The `'~run'` method is replaced with a new implementation that iterates all items in the tuple.

`pipe` itself has no knowledge of any specific schema or action. It only depends on the shared interface contracts (`kind` and `'~run'`), which is what makes the entire system composable:

```ts
function pipe(...pipe) {
  return {
    // Spread all properties of the root schema
    ...pipe[0],
    // Add the pipe tuple (root schema at index 0, other pipe items at index 1+)
    pipe,
    // Replace '~standard' with a lazy getter so that `this` refers to the new schema object
    get '~standard'() {
      return _getStandardProps(this);
    },
    // Replace '~run' with a new implementation that executes the pipeline
    '~run'(dataset, config) {
      for (const item of pipe) {
        // Metadata actions are never executed
        if (item.kind !== 'metadata') {
          // Schemas and transformations abort if the dataset already has issues
          if (
            dataset.issues &&
            (item.kind === 'schema' || item.kind === 'transformation')
          ) {
            dataset.typed = false;
            break;
          }

          // Run pipe item unless an early abort is configured
          if (
            !dataset.issues ||
            (!config.abortEarly && !config.abortPipeEarly)
          ) {
            dataset = item['~run'](dataset, config);
          }
        }
      }
      return dataset;
    },
  };
}
```

The following rules apply during pipe execution:

- Metadata items are always skipped.
- Schemas and transformations abort if the dataset already has issues.
- Validations continue across existing issues unless `abortEarly` or `abortPipeEarly` is configured.

Because the result of `pipe` is itself a `BaseSchema`, it can be nested inside other schemas or passed to `pipe` again just like any other schema.

## Immutability

We treat all schema and action objects as immutable. Mutating them directly after creation leads to unpredictable behavior, especially when schemas are shared across multiple pipelines or modules.

When we need a modified copy of a schema, we spread it into a new object and replace only the properties we want to change. Here is a simplified version of our <Link href="/api/fallback/">`fallback`</Link> method to demonstrate this pattern:

```ts
function fallback(schema, fallbackValue) {
  return {
    // Copy all properties from the original schema
    ...schema,
    // Add the new fallback property as metadata
    fallback: fallbackValue,
    // Re-bind '~standard' so `this` refers to the new object
    get '~standard'() {
      return _getStandardProps(this);
    },
    // Override '~run' to return the fallback value on failure
    '~run'(dataset, config) {
      const outputDataset = schema['~run'](dataset, config);
      return outputDataset.issues
        ? { typed: true, value: fallbackValue }
        : outputDataset;
    },
  };
}
```

Two things are important when creating a modified copy. First, always re-bind the `'~standard'` getter so that `this` inside it refers to the new object instead of the original. Second, capture the original schema in a closure rather than reading `this` in `'~run'`, so the original `'~run'` logic is called correctly.

If you want to create an entirely new schema or action from scratch rather than wrapping an existing one, see the [Extend Valibot](/guides/extend-valibot/) guide.
