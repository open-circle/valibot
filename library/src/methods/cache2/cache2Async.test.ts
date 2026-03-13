import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { string } from '../../schemas/index.ts';
import { cache2Async } from './cache2Async.ts';

describe('cache2Async', () => {
  test('should cache output', async () => {
    const baseSchema = string();
    const runSpy = vi.spyOn(baseSchema, '~run');
    const schema = cache2Async(baseSchema);
    expect(await schema['~run']({ value: 'foo' }, {})).toBe(
      await schema['~run']({ value: 'foo' }, {})
    );
    expect(runSpy).toHaveBeenCalledTimes(1);
  });

  test('should allow custom max size', async () => {
    const schema = cache2Async(string(), { maxSize: 2 });
    expect(schema.cacheConfig.maxSize).toBe(2);

    const fooDataset = await schema['~run']({ value: 'foo' }, {});
    expect(await schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);

    expect(await schema['~run']({ value: 'bar' }, {})).toBe(
      await schema['~run']({ value: 'bar' }, {})
    );

    expect(await schema['~run']({ value: 'baz' }, {})).toBe(
      await schema['~run']({ value: 'baz' }, {})
    );

    expect(await schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
  });

  describe('should allow custom max age', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterAll(() => {
      vi.useRealTimers();
    });

    test('and clear expired values', async () => {
      const schema = cache2Async(string(), { maxAge: 1000 });
      const fooDataset = await schema['~run']({ value: 'foo' }, {});
      expect(await schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(1001);
      expect(await schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
    });

    test('and not reset expiry on get', async () => {
      const schema = cache2Async(string(), { maxAge: 1000 });
      const fooDataset = await schema['~run']({ value: 'foo' }, {});
      expect(await schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(500);
      expect(await schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(501);
      expect(await schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
    });
  });

  test('should expose cache for manual clearing', async () => {
    const schema = cache2Async(string());
    const fooDataset = await schema['~run']({ value: 'foo' }, {});
    expect(await schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
    schema.cache.clear();
    expect(await schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
  });

  test('should deduplicate concurrent calls', async () => {
    const baseSchema = string();
    const runSpy = vi.spyOn(baseSchema, '~run');
    const schema = cache2Async(baseSchema);
    const p1 = schema['~run']({ value: 'foo' }, {});
    const p2 = schema['~run']({ value: 'foo' }, {});
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe(r2);
    expect(runSpy).toHaveBeenCalledTimes(1);
  });

  test('should retry after rejection', async () => {
    const baseSchema = string();
    vi.spyOn(baseSchema, '~run').mockReturnValueOnce(
      Promise.reject(new Error('test error')) as never
    );
    const schema = cache2Async(baseSchema);
    await expect(schema['~run']({ value: 'foo' }, {})).rejects.toThrow(
      'test error'
    );
    const result = await schema['~run']({ value: 'foo' }, {});
    expect(result.value).toBe('foo');
  });

  test('should propagate errors to all concurrent callers', async () => {
    const baseSchema = string();
    const runSpy = vi
      .spyOn(baseSchema, '~run')
      .mockReturnValue(Promise.reject(new Error('test error')) as never);
    const schema = cache2Async(baseSchema);
    const p1 = schema['~run']({ value: 'foo' }, {});
    const p2 = schema['~run']({ value: 'foo' }, {});
    await expect(p1).rejects.toThrow('test error');
    await expect(p2).rejects.toThrow('test error');
    expect(runSpy).toHaveBeenCalledTimes(1);
  });
});
