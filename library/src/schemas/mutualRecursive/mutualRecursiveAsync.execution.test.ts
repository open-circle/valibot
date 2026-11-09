import { describe, expect, test, vi } from 'vitest';
import {
  checkAsync,
  returnsAsync,
  transformAsync,
} from '../../actions/index.ts';
import { parseAsync, pipeAsync, safeParseAsync } from '../../methods/index.ts';
import { any } from '../any/index.ts';
import { arrayAsync } from '../array/index.ts';
import { lazyAsync } from '../lazy/index.ts';
import { objectAsync } from '../object/index.ts';
import { optionalAsync } from '../optional/index.ts';
import { recursiveAsync } from '../recursive/recursiveAsync.ts';
import { string } from '../string/index.ts';
import type { RefFactoryAsync } from './_mutualRecursive.ts';
import { mutualRecursive } from './mutualRecursive.ts';
import { mutualRecursiveAsync } from './mutualRecursiveAsync.ts';

const outside = 'Recursive reference used outside its recursive schema';

describe('mutualRecursiveAsync execution', () => {
  test('creates async wrappers for mixed sync and async definitions once', async () => {
    const definition = vi.fn((ref: RefFactoryAsync) => ({
      node: objectAsync({ name: string(), next: optionalAsync(ref('leaf')) }),
      leaf: string(),
    }));
    const group = mutualRecursiveAsync(definition);
    expect(Object.getPrototypeOf(group)).toBeNull();
    expect(Object.keys(group)).toStrictEqual(['node', 'leaf']);
    for (const key of ['node', 'leaf'] as const) {
      expect(group[key]).toMatchObject({
        kind: 'schema',
        type: 'mutualRecursiveAsync',
        expects: 'unknown',
        async: true,
      });
      expect(group[key].wrapped).toBe(definition.mock.results[0].value[key]);
      expect(group[key]['~standard']).toMatchObject({
        version: 1,
        vendor: 'valibot',
      });
    }
    expect(group.node.reference).toBe(group.leaf.reference);
    await expect(
      parseAsync(group.node, { name: 'root', next: 'end' })
    ).resolves.toStrictEqual({ name: 'root', next: 'end' });
    await expect(
      group.leaf['~run']({ value: 'end' }, {})
    ).resolves.toStrictEqual({ typed: true, value: 'end' });
    expect(definition).toHaveBeenCalledOnce();
  });

  test('supports an empty definitions object', () => {
    expect(Object.keys(mutualRecursiveAsync(() => ({})))).toStrictEqual([]);
  });

  test('accepts __proto__ as an own definition name without prototype mutation', async () => {
    const group = mutualRecursiveAsync((ref) => ({
      ['__proto__']: objectAsync({ next: optionalAsync(ref('__proto__')) }),
    }));
    expect(Object.getPrototypeOf(group)).toBeNull();
    await expect(
      parseAsync(group.__proto__, { next: {} })
    ).resolves.toStrictEqual({ next: {} });
  });

  test('rejects all direct reference execution without mutating parse configuration', async () => {
    const definition = vi.fn((ref: RefFactoryAsync) => ({
      a: objectAsync({ children: arrayAsync(ref('b')) }),
      b: objectAsync({ children: arrayAsync(ref('a')) }),
    }));
    const group = mutualRecursiveAsync(definition);
    const marker = definition.mock.results[0].value.a.entries.children.item;
    const input = { children: [{ children: [] }] };
    const config = { abortEarly: true };
    await expect(parseAsync(marker, input, config)).rejects.toThrow(outside);
    await expect(marker['~run']({ value: input }, config)).rejects.toThrow(
      outside
    );
    await expect(marker['~standard'].validate(input)).rejects.toThrow(outside);
    await expect(parseAsync(group.a, input, config)).resolves.toStrictEqual(
      input
    );
    await expect(parseAsync(marker, input, config)).rejects.toThrow(outside);
    expect(Reflect.ownKeys(config)).toStrictEqual(['abortEarly']);
    expect(config).toStrictEqual({ abortEarly: true });
  });

  test('rejects foreign references in schemas and async return actions', () => {
    const definition = vi.fn((ref: RefFactoryAsync) => ({
      a: objectAsync({ children: arrayAsync(ref('a')) }),
    }));
    mutualRecursiveAsync(definition);
    const marker = definition.mock.results[0].value.a.entries.children.item;
    expect(() =>
      mutualRecursiveAsync(() => ({
        a: objectAsync({ children: arrayAsync(marker) }),
      }))
    ).toThrow(outside);
    expect(() =>
      mutualRecursiveAsync(() => ({
        a: pipeAsync(any(), returnsAsync(marker)),
      }))
    ).toThrow(outside);
  });

  test('checks references created by async lazy getters during parsing', async () => {
    const getter = vi.fn();
    // @ts-expect-error Deliberately exercise a late unmatched label.
    const group = mutualRecursiveAsync((ref) => ({
      a: lazyAsync(async () => {
        getter();
        return ref('missing');
      }),
    }));
    expect(getter).not.toHaveBeenCalled();
    await expect(parseAsync(group.a, {})).rejects.toThrow(
      "Unmatched recursive reference: 'missing'"
    );
    expect(getter).toHaveBeenCalledOnce();
  });

  test('rejects inherited names that are not definitions', () => {
    expect(() =>
      // @ts-expect-error Object prototype properties are not definitions.
      mutualRecursiveAsync((ref) => ({
        a: objectAsync({ next: ref('toString') }),
      }))
    ).toThrow("Unmatched recursive reference: 'toString'");
  });

  test('preserves nested async validation paths and abort configuration', async () => {
    const group = mutualRecursiveAsync((ref) => ({
      a: objectAsync({ items: arrayAsync(ref('b')) }),
      b: objectAsync({
        value: pipeAsync(
          string(),
          checkAsync(async (value) => value !== 'bad', 'invalid value')
        ),
        parent: optionalAsync(ref('a')),
      }),
    }));
    const input = {
      items: [
        {
          value: 'ok',
          parent: { items: [{ value: 'bad' }, { value: 'bad' }] },
        },
      ],
    };
    const result = await safeParseAsync(group.a, input, { abortEarly: true });
    expect(result.issues).toHaveLength(1);
    expect(result.issues?.[0]).toMatchObject({
      message: 'invalid value',
      abortEarly: true,
    });
    expect(result.issues?.[0].path?.map(({ key }) => key)).toStrictEqual([
      'items',
      0,
      'parent',
      'items',
      0,
      'value',
    ]);
    const standard = await group.a['~standard'].validate(input);
    expect(standard.issues).toHaveLength(2);
  });

  test('propagates async transformation exceptions', async () => {
    const error = new Error('transform failed');
    const group = mutualRecursiveAsync((ref) => ({
      a: objectAsync({ item: ref('b') }),
      b: pipeAsync(
        string(),
        transformAsync(async () => {
          throw error;
        })
      ),
    }));
    await expect(parseAsync(group.a, { item: 'value' })).rejects.toBe(error);
  });

  test('propagates definition exceptions during construction', () => {
    const error = new Error('construction failed');
    expect(() =>
      mutualRecursiveAsync(() => {
        throw error;
      })
    ).toThrow(error);
  });

  test('composes independent single, mutual, sync, and async owners', async () => {
    const single = recursiveAsync((self) =>
      objectAsync({ children: arrayAsync(self) })
    );
    const sync = mutualRecursive(() => ({ leaf: string() }));
    const inner = mutualRecursiveAsync((ref) => ({
      tag: objectAsync({ next: optionalAsync(ref('tag')) }),
    }));
    const outer = mutualRecursiveAsync((ref) => ({
      a: objectAsync({
        single,
        leaf: sync.leaf,
        tags: arrayAsync(inner.tag),
        next: optionalAsync(ref('a')),
      }),
    }));
    const value = {
      single: { children: [{ children: [] }] },
      leaf: 'end',
      tags: [{ next: {} }],
    };
    await expect(
      parseAsync(outer.a, { ...value, next: value })
    ).resolves.toStrictEqual({ ...value, next: value });
  });
});
