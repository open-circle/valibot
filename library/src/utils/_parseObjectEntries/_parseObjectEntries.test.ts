import { describe, expect, test } from 'vitest';
import { fallback, fallbackAsync } from '../../methods/index.ts';
import {
  exactOptional,
  exactOptionalAsync,
} from '../../schemas/exactOptional/index.ts';
import { nullish } from '../../schemas/nullish/index.ts';
import { number } from '../../schemas/number/index.ts';
import { optional, optionalAsync } from '../../schemas/optional/index.ts';
import { string } from '../../schemas/string/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  Config,
  ObjectEntries,
  ObjectEntriesAsync,
  StandardProps,
  UnknownDataset,
} from '../../types/index.ts';
import {
  _applyObjectEntriesAsync,
  _collectObjectEntriesAsync,
  _parseObjectEntries,
  _parseObjectEntriesAsync,
} from './_parseObjectEntries.ts';

describe('_parseObjectEntries', () => {
  const standardProps = {
    version: 1,
    vendor: 'valibot',
    validate: (value) => ({ value }),
  } satisfies StandardProps<unknown, unknown>;

  function schemaReference(): BaseSchema<unknown, unknown, BaseIssue<unknown>> {
    return {
      kind: 'schema',
      type: 'schema',
      reference: schemaReference,
      expects: 'unknown',
      async: false,
      '~standard': standardProps,
      '~run'(dataset) {
        return { typed: true, value: dataset.value };
      },
    };
  }

  function createContext(
    entries: ObjectEntries
  ): Parameters<typeof _parseObjectEntries>[0] {
    return {
      ...schemaReference(),
      type: 'object',
      expects: 'Object',
      entries,
    } as Parameters<typeof _parseObjectEntries>[0];
  }

  function createContextAsync(
    entries: ObjectEntriesAsync
  ): Parameters<typeof _parseObjectEntriesAsync>[0] {
    return {
      ...schemaReference(),
      type: 'object',
      expects: 'Object',
      async: true,
      entries,
      async '~run'(dataset) {
        return { typed: true, value: dataset.value };
      },
    } as Parameters<typeof _parseObjectEntriesAsync>[0];
  }

  function createIssue(input: unknown): BaseIssue<unknown> {
    return {
      kind: 'schema',
      type: 'custom',
      input,
      expected: 'valid',
      received: `${input}`,
      message: 'Invalid value',
      requirement: undefined,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };
  }

  function createMultiIssueSchema(
    issues: [BaseIssue<unknown>, ...BaseIssue<unknown>[]]
  ): BaseSchema<unknown, unknown, BaseIssue<unknown>> {
    return {
      ...schemaReference(),
      type: 'custom',
      expects: 'valid',
      '~run'(dataset) {
        return {
          typed: false,
          value: dataset.value,
          issues,
        };
      },
    };
  }

  const config = {} satisfies Config<BaseIssue<unknown>>;

  function getIssues(
    dataset: UnknownDataset
  ): [BaseIssue<unknown>, ...BaseIssue<unknown>[]] {
    return (
      dataset as unknown as {
        issues: [BaseIssue<unknown>, ...BaseIssue<unknown>[]];
      }
    ).issues;
  }

  test('should parse declared entries and discard undeclared keys', () => {
    const input = { key1: 'foo', key2: 123, other: true };
    const dataset: UnknownDataset = { value: input };

    const aborted = _parseObjectEntries(
      createContext({ key1: string(), key2: number() }),
      dataset,
      config,
      input
    );

    expect(aborted).toBe(false);
    expect(dataset).toStrictEqual({
      typed: true,
      value: { key1: 'foo', key2: 123 },
    });
  });

  test('should process missing optional, default and fallback entries', () => {
    const input = {};
    const dataset: UnknownDataset = { value: input };

    const aborted = _parseObjectEntries(
      createContext({
        optional: optional(string()),
        nullish: nullish(number()),
        defaulted: exactOptional(string(), 'foo'),
        fallbacked: fallback(number(), 123),
      }),
      dataset,
      config,
      input
    );

    expect(aborted).toBe(false);
    expect(dataset).toStrictEqual({
      typed: true,
      value: { defaulted: 'foo', fallbacked: 123 },
    });
  });

  test('should add a key issue for missing required entries', () => {
    const input: Record<string, unknown> = {};
    const dataset: UnknownDataset = { value: input };

    const aborted = _parseObjectEntries(
      createContext({ required: string() }),
      dataset,
      config,
      input
    );

    expect(aborted).toBe(false);
    expect(dataset.typed).toBe(false);
    expect(dataset.value).toStrictEqual({});
    const issues = getIssues(dataset);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      kind: 'schema',
      type: 'object',
      input: undefined,
      expected: '"required"',
      received: 'undefined',
    });
    expect(issues[0].path).toStrictEqual([
      {
        type: 'object',
        origin: 'key',
        input,
        key: 'required',
        value: undefined,
      },
    ]);
  });

  test('should prepend value paths and preserve nested issue order', () => {
    const input = { nested: 'bad' };
    const dataset: UnknownDataset = { value: input };
    const issue1 = createIssue(1);
    const nestedPathItem = {
      type: 'array',
      origin: 'value',
      input: [2],
      key: 0,
      value: 2,
    } as const;
    const issue2 = {
      ...createIssue(2),
      path: [nestedPathItem],
    } satisfies BaseIssue<unknown>;

    const aborted = _parseObjectEntries(
      createContext({ nested: createMultiIssueSchema([issue1, issue2]) }),
      dataset,
      config,
      input
    );

    const objectPathItem = {
      type: 'object',
      origin: 'value',
      input,
      key: 'nested',
      value: 'bad',
    };

    expect(aborted).toBe(false);
    expect(dataset.typed).toBe(false);
    expect(dataset.value).toStrictEqual({ nested: 'bad' });
    expect(getIssues(dataset)).toStrictEqual([
      { ...issue1, path: [objectPathItem] },
      { ...issue2, path: [objectPathItem, nestedPathItem] },
    ]);
  });

  test('should abort early before processing following entries', () => {
    const input = { invalid: 123, next: 'foo' };
    const dataset: UnknownDataset = { value: input };

    const aborted = _parseObjectEntries(
      createContext({ invalid: string(), next: string() }),
      dataset,
      { abortEarly: true },
      input
    );

    expect(aborted).toBe(true);
    expect(dataset.typed).toBe(false);
    expect(dataset.value).toStrictEqual({});
    const issues = getIssues(dataset);
    expect(issues).toHaveLength(1);
    expect(issues[0].path).toStrictEqual([
      {
        type: 'object',
        origin: 'value',
        input,
        key: 'invalid',
        value: 123,
      },
    ]);
  });

  test('should collect async entry results', async () => {
    const input = { present: 'foo' };
    const entries = {
      present: string(),
      defaulted: exactOptionalAsync(string(), async () => 'bar'),
      missing: optionalAsync(number()),
    };

    const results = await _collectObjectEntriesAsync(
      createContextAsync(entries),
      config,
      input
    );

    expect(results).toHaveLength(3);
    expect(results[0][0]).toBe('present');
    expect(results[0][1]).toBe('foo');
    expect(results[0][3]).toStrictEqual({
      typed: true,
      value: 'foo',
    });
    expect(results[1][0]).toBe('defaulted');
    expect(results[1][1]).toBe('bar');
    expect(results[1][3]).toStrictEqual({
      typed: true,
      value: 'bar',
    });
    expect(results[2][0]).toBe('missing');
    expect(results[2][1]).toBe(undefined);
    expect(results[2][3]).toBeNull();
  });

  test('should apply async entry results', async () => {
    const input = { invalid: 123 };
    const entries = {
      defaulted: exactOptionalAsync(string(), async () => 'foo'),
      fallbacked: fallbackAsync(number(), async () => 123),
      invalid: string(),
    };
    const context = createContextAsync(entries);
    const results = await _collectObjectEntriesAsync(context, config, input);
    const dataset: UnknownDataset = { value: input };

    const aborted = await _applyObjectEntriesAsync(
      context,
      dataset,
      config,
      input,
      results
    );

    expect(aborted).toBe(false);
    expect(dataset.typed).toBe(false);
    expect(dataset.value).toStrictEqual({
      defaulted: 'foo',
      fallbacked: 123,
      invalid: 123,
    });
    const issues = getIssues(dataset);
    expect(issues).toHaveLength(1);
    expect(issues[0].path).toStrictEqual([
      {
        type: 'object',
        origin: 'value',
        input,
        key: 'invalid',
        value: 123,
      },
    ]);
  });

  test('should parse async entries end to end', async () => {
    const input = { key: 'foo' };
    const dataset: UnknownDataset = { value: input };

    const aborted = await _parseObjectEntriesAsync(
      createContextAsync({
        key: string(),
        fallbacked: fallbackAsync(number(), async () => 123),
      }),
      dataset,
      config,
      input
    );

    expect(aborted).toBe(false);
    expect(dataset).toStrictEqual({
      typed: true,
      value: { key: 'foo', fallbacked: 123 },
    });
  });

  test('should abort early when applying async entry results', async () => {
    const input = { invalid: 123, next: 'foo' };
    const entries = { invalid: string(), next: string() };
    const context = createContextAsync(entries);
    const results = await _collectObjectEntriesAsync(context, config, input);
    const dataset: UnknownDataset = { value: input };

    const aborted = await _applyObjectEntriesAsync(
      context,
      dataset,
      { abortEarly: true },
      input,
      results
    );

    expect(aborted).toBe(true);
    expect(dataset.typed).toBe(false);
    expect(dataset.value).toStrictEqual({});
    const issues = getIssues(dataset);
    expect(issues).toHaveLength(1);
    expect(issues[0].path).toStrictEqual([
      {
        type: 'object',
        origin: 'value',
        input,
        key: 'invalid',
        value: 123,
      },
    ]);
  });
});
