import { describe, expect, test, vi } from 'vitest';
import { minLength, transformAsync } from '../../actions/index.ts';
import { string } from '../../schemas/index.ts';
import { pipe, pipeAsync } from '../index.ts';
import { cacheAsync, type SchemaWithCacheAsync } from './cacheAsync.ts';

describe('cacheAsync', () => {
  describe('should return schema object', () => {
    const schema = string();
    type Schema = typeof schema;
    const baseSchema: Omit<
      SchemaWithCacheAsync<Schema, never>,
      'cacheConfig'
    > = {
      ...schema,
      async: true,
      cache: expect.any(Object),
      '~run': expect.any(Function),
    };

    test('without cache config', () => {
      expect(cacheAsync(schema)).toStrictEqual({
        ...baseSchema,
        cacheConfig: undefined,
        '~standard': {
          version: 1,
          vendor: 'valibot',
          validate: expect.any(Function),
        },
      } satisfies SchemaWithCacheAsync<Schema, undefined>);
    });

    test('with cache config', () => {
      expect(cacheAsync(schema, { maxSize: 123 })).toStrictEqual({
        ...baseSchema,
        cacheConfig: { maxSize: 123 },
        '~standard': {
          version: 1,
          vendor: 'valibot',
          validate: expect.any(Function),
        },
      } satisfies SchemaWithCacheAsync<Schema, { maxSize: 123 }>);
    });
  });

  describe('should cache output', () => {
    test('for same input and config', async () => {
      const baseSchema = string();
      const runSpy = vi.spyOn(baseSchema, '~run');
      const schema = cacheAsync(baseSchema);
      const dataset1 = await schema['~run']({ value: 'foo' }, {});
      const dataset2 = await schema['~run']({ value: 'foo' }, {});

      expect(dataset1).toStrictEqual({
        typed: true,
        value: 'foo',
        issues: undefined,
      });
      expect(dataset2).toStrictEqual({
        typed: true,
        value: 'foo',
        issues: undefined,
      });
      expect(dataset1).not.toBe(dataset2);
      expect(runSpy).toHaveBeenCalledTimes(1);
    });

    test('without reusing mutated pipe datasets', async () => {
      const baseSchema = string();
      const runSpy = vi.spyOn(baseSchema, '~run');
      const schema = pipeAsync(
        cacheAsync(baseSchema),
        transformAsync(async (input) => `${input}!`)
      );

      await expect(schema['~run']({ value: 'foo' }, {})).resolves.toStrictEqual(
        {
          typed: true,
          value: 'foo!',
          issues: undefined,
        }
      );
      await expect(schema['~run']({ value: 'foo' }, {})).resolves.toStrictEqual(
        {
          typed: true,
          value: 'foo!',
          issues: undefined,
        }
      );
      expect(runSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('should respect config changes', () => {
    test('for lang config', async () => {
      const baseSchema = string();
      const runSpy = vi.spyOn(baseSchema, '~run');
      const schema = cacheAsync(baseSchema);
      const defaultDataset = await schema['~run']({ value: 'foo' }, {});
      const langDataset = await schema['~run'](
        { value: 'foo' },
        { lang: 'de' }
      );
      const defaultDataset2 = await schema['~run']({ value: 'foo' }, {});
      const langDataset2 = await schema['~run'](
        { value: 'foo' },
        { lang: 'de' }
      );

      expect(defaultDataset).not.toBe(langDataset);
      expect(defaultDataset).toStrictEqual({
        typed: true,
        value: 'foo',
        issues: undefined,
      });
      expect(defaultDataset2).toStrictEqual({
        typed: true,
        value: 'foo',
        issues: undefined,
      });
      expect(defaultDataset2).not.toBe(defaultDataset);
      expect(langDataset).toStrictEqual({
        typed: true,
        value: 'foo',
        issues: undefined,
      });
      expect(langDataset2).toStrictEqual({
        typed: true,
        value: 'foo',
        issues: undefined,
      });
      expect(langDataset2).not.toBe(langDataset);
      expect(runSpy).toHaveBeenCalledTimes(2);
    });

    test('for abort config', async () => {
      const schema = cacheAsync(pipe(string(), minLength(4), minLength(6)));
      const defaultDataset = await schema['~run']({ value: 'foo' }, {});
      const abortDataset = await schema['~run'](
        { value: 'foo' },
        { abortEarly: true }
      );

      expect(defaultDataset).not.toBe(abortDataset);
      expect(defaultDataset.issues).toHaveLength(2);
      expect(abortDataset.issues).toHaveLength(1);
    });
  });

  describe('should expose cache for manual clearing', () => {
    test('to invalidate cached output', async () => {
      const baseSchema = string();
      const runSpy = vi.spyOn(baseSchema, '~run');
      const schema = cacheAsync(baseSchema);

      await expect(schema['~run']({ value: 'foo' }, {})).resolves.toStrictEqual(
        {
          typed: true,
          value: 'foo',
          issues: undefined,
        }
      );
      await expect(schema['~run']({ value: 'foo' }, {})).resolves.toStrictEqual(
        {
          typed: true,
          value: 'foo',
          issues: undefined,
        }
      );
      expect(runSpy).toHaveBeenCalledTimes(1);

      schema.cache.clear();

      await expect(schema['~run']({ value: 'foo' }, {})).resolves.toStrictEqual(
        {
          typed: true,
          value: 'foo',
          issues: undefined,
        }
      );
      expect(runSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('should deduplicate concurrent calls', () => {
    test('for matching input and config', async () => {
      const baseSchema = string();
      const runSpy = vi.spyOn(baseSchema, '~run');
      const schema = cacheAsync(baseSchema);
      const promise1 = schema['~run']({ value: 'foo' }, {});
      const promise2 = schema['~run']({ value: 'foo' }, {});
      const [dataset1, dataset2] = await Promise.all([promise1, promise2]);

      expect(dataset1).toStrictEqual(dataset2);
      expect(dataset1).not.toBe(dataset2);
      expect(runSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('should retry after rejection', () => {
    test('for later calls', async () => {
      const baseSchema = string();
      vi.spyOn(baseSchema, '~run').mockReturnValueOnce(
        Promise.reject(new Error('test error')) as never
      );
      const schema = cacheAsync(baseSchema);

      await expect(schema['~run']({ value: 'foo' }, {})).rejects.toThrow(
        'test error'
      );
      await expect(schema['~run']({ value: 'foo' }, {})).resolves.toStrictEqual(
        {
          typed: true,
          value: 'foo',
          issues: undefined,
        }
      );
    });
  });

  describe('should propagate errors', () => {
    test('to concurrent callers', async () => {
      const baseSchema = string();
      const runSpy = vi
        .spyOn(baseSchema, '~run')
        .mockReturnValue(Promise.reject(new Error('test error')) as never);
      const schema = cacheAsync(baseSchema);
      const promise1 = schema['~run']({ value: 'foo' }, {});
      const promise2 = schema['~run']({ value: 'foo' }, {});

      await expect(promise1).rejects.toThrow('test error');
      await expect(promise2).rejects.toThrow('test error');
      expect(runSpy).toHaveBeenCalledTimes(1);
    });
  });
});
