import { describe, expect, test, vi } from 'vitest';
import {
  expectNoSchemaIssueAsync,
  expectSchemaIssueAsync,
} from '../../vitest/index.ts';
import {
  string,
  type StringIssue,
  type StringSchema,
} from '../string/index.ts';
import { lazyAsync, type LazySchemaAsync } from './lazyAsync.ts';

describe('lazyAsync', () => {
  test('should return schema object', () => {
    const getter = async () => string();
    expect(lazyAsync(getter)).toStrictEqual({
      kind: 'schema',
      type: 'lazy',
      reference: lazyAsync,
      expects: 'unknown',
      getter,
      async: true,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    } satisfies LazySchemaAsync<StringSchema<undefined>>);
  });

  describe('should return dataset without issues', () => {
    const schema = lazyAsync(() => string());

    test('for strings', async () => {
      await expectNoSchemaIssueAsync(schema, ['', 'foo', '123']);
    });
  });

  describe('should return dataset with issues', () => {
    const schema = lazyAsync(() => string('message'));
    const baseIssue: Omit<StringIssue, 'input' | 'received'> = {
      kind: 'schema',
      type: 'string',
      expected: 'string',
      message: 'message',
    };

    // Primitive types

    test('for bigints', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [-1n, 0n, 123n]);
    });

    test('for booleans', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [true, false]);
    });

    test('for null', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [null]);
    });

    test('for numbers', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [-1, 0, 123, 45.67]);
    });

    test('for undefined', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [undefined]);
    });

    test('for symbols', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [
        Symbol(),
        Symbol('foo'),
      ]);
    });

    // Complex types

    test('for arrays', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [[], ['value']]);
    });

    test('for functions', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        function () {},
      ]);
    });

    test('for objects', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [{}, { key: 'value' }]);
    });
  });

  test('should call getter with input', () => {
    const getter = vi.fn(() => string());
    const dataset = { value: 'foo' };
    lazyAsync(getter)['~run'](dataset, {});
    expect(getter).toHaveBeenCalledWith(dataset.value, undefined);
  });

  test('should call getter with signal', () => {
    const getter = vi.fn(() => string());
    const dataset = { value: 'foo' };
    const signal = AbortSignal.abort();
    lazyAsync(getter)['~run'](dataset, { signal });
    expect(getter).toHaveBeenCalledWith(dataset.value, signal);
  });
});
