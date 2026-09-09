import type { BaseTransformation } from '../../types/index.ts';

/** Splits a string into words for case conversion. */
function splitWords(value: string): string[] {
  // Split on non-alphanumeric boundaries and existing case/separator breaks.
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-\s]+/g, ' ')
    .split(' ')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/**
 * To camel case action interface.
 */
export interface ToCamelCaseAction
  extends BaseTransformation<string, string, never> {
  readonly type: 'to_camel_case';
  readonly reference: typeof toCamelCase;
}

/**
 * Creates a to camel case transformation action.
 *
 * Converts the input to camelCase, e.g. `"hello_world"` → `"helloWorld"`,
 * `"foo-bar"` → `"fooBar"`. Existing case boundaries (e.g. `fooBar`) are
 * preserved and re-joined. See issue #1324.
 *
 * @returns A to camel case action.
 */
// @__NO_SIDE_EFFECTS__
export function toCamelCase(): ToCamelCaseAction {
  return {
    kind: 'transformation',
    type: 'to_camel_case',
    reference: toCamelCase,
    async: false,
    '~run'(dataset) {
      const words = splitWords(dataset.value);
      dataset.value = words
        .map((word, i) =>
          i === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join('');
      return dataset;
    },
  };
}

/**
 * To snake case action interface.
 */
export interface ToSnakeCaseAction
  extends BaseTransformation<string, string, never> {
  readonly type: 'to_snake_case';
  readonly reference: typeof toSnakeCase;
}

/**
 * Creates a to snake case transformation action.
 *
 * Converts the input to snake_case, e.g. `"helloWorld"` → `"hello_world"`,
 * `"foo-bar"` → `"foo_bar"`. See issue #1324.
 *
 * @returns A to snake case action.
 */
// @__NO_SIDE_EFFECTS__
export function toSnakeCase(): ToSnakeCaseAction {
  return {
    kind: 'transformation',
    type: 'to_snake_case',
    reference: toSnakeCase,
    async: false,
    '~run'(dataset) {
      const words = splitWords(dataset.value);
      dataset.value = words.map((w) => w.toLowerCase()).join('_');
      return dataset;
    },
  };
}

/**
 * To kebab case action interface.
 */
export interface ToKebabCaseAction
  extends BaseTransformation<string, string, never> {
  readonly type: 'to_kebab_case';
  readonly reference: typeof toKebabCase;
}

/**
 * Creates a to kebab case transformation action.
 *
 * Converts the input to kebab-case, e.g. `"helloWorld"` → `"hello-world"`,
 * `"foo_bar"` → `"foo-bar"`. See issue #1324.
 *
 * @returns A to kebab case action.
 */
// @__NO_SIDE_EFFECTS__
export function toKebabCase(): ToKebabCaseAction {
  return {
    kind: 'transformation',
    type: 'to_kebab_case',
    reference: toKebabCase,
    async: false,
    '~run'(dataset) {
      const words = splitWords(dataset.value);
      dataset.value = words.map((w) => w.toLowerCase()).join('-');
      return dataset;
    },
  };
}

/**
 * To pascal case action interface.
 */
export interface ToPascalCaseAction
  extends BaseTransformation<string, string, never> {
  readonly type: 'to_pascal_case';
  readonly reference: typeof toPascalCase;
}

/**
 * Creates a to pascal case transformation action.
 *
 * Converts the input to PascalCase, e.g. `"hello_world"` → `"HelloWorld"`,
 * `"foo-bar"` → `"FooBar"`. See issue #1324.
 *
 * @returns A to pascal case action.
 */
// @__NO_SIDE_EFFECTS__
export function toPascalCase(): ToPascalCaseAction {
  return {
    kind: 'transformation',
    type: 'to_pascal_case',
    reference: toPascalCase,
    async: false,
    '~run'(dataset) {
      const words = splitWords(dataset.value);
      dataset.value = words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('');
      return dataset;
    },
  };
}