import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { string } from '../../schemas/index.ts';
import { cache } from './cache.ts';

describe('cache', () => {
  test('should cache output', () => {
    const baseSchema = string();
    const runSpy = vi.spyOn(baseSchema, '~run');
    const schema = cache(baseSchema);
    expect(schema['~run']({ value: 'foo' }, {})).toBe(
      schema['~run']({ value: 'foo' }, {})
    );
    expect(runSpy).toHaveBeenCalledTimes(1);
  });
  test('should allow custom max size', () => {
    const schema = cache(string(), { maxSize: 2 });
    expect(schema.options.maxSize).toBe(2);

    const fooDataset = schema['~run']({ value: 'foo' }, {});
    expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
    expect(schema['~run']({ value: 'bar' }, {})).toBe(
      schema['~run']({ value: 'bar' }, {})
    );
    expect(schema['~run']({ value: 'baz' }, {})).toBe(
      schema['~run']({ value: 'baz' }, {})
    );
    expect(schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
  });
  describe('should allow custom duration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterAll(() => {
      vi.useRealTimers();
    });

    test('and clear expired values', () => {
      const schema = cache(string(), { duration: 1000 });
      const fooDataset = schema['~run']({ value: 'foo' }, {});
      expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(1000);
      expect(schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
    });

    test('and reset expiry on get', () => {
      const schema = cache(string(), { duration: 1000 });
      const fooDataset = schema['~run']({ value: 'foo' }, {});
      expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(500);
      expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
      vi.advanceTimersByTime(1000);
      expect(schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
    });
  });
  test('should expose cache for manual clearing', () => {
    const schema = cache(string());
    const fooDataset = schema['~run']({ value: 'foo' }, {});
    expect(schema['~run']({ value: 'foo' }, {})).toBe(fooDataset);
    schema.cache.clear();
    expect(schema['~run']({ value: 'foo' }, {})).not.toBe(fooDataset);
  });
});
