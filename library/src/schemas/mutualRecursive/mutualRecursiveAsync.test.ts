import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import { readonly, transformAsync } from '../../actions/index.ts';
import { parseAsync, pipeAsync, safeParseAsync } from '../../methods/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { arrayAsync, type ArrayIssue } from '../array/index.ts';
import { mapAsync } from '../map/index.ts';
import { number } from '../number/index.ts';
import { objectAsync, type ObjectIssue } from '../object/index.ts';
import { optionalAsync } from '../optional/index.ts';
import { recordAsync } from '../record/index.ts';
import { setAsync } from '../set/index.ts';
import { string, type StringIssue } from '../string/index.ts';
import { tupleAsync } from '../tuple/index.ts';
import type { RefFactoryAsync } from './mutualRecursive.ts';
import { mutualRecursiveAsync as recursiveAsync } from './mutualRecursiveAsync.ts';

interface AInput {
  value: string;
  bs: BInput[];
}
interface BInput {
  parent?: AInput | undefined;
}
interface AOutput {
  value: number;
  bs: BOutput[];
}
interface BOutput {
  parent?: AOutput | undefined;
}

const definition = vi.fn((ref: RefFactoryAsync) => ({
  a: objectAsync({
    value: pipeAsync(
      string('invalid value'),
      transformAsync(async (value) => value.length)
    ),
    bs: arrayAsync(ref('b')),
  }),
  b: objectAsync({ parent: optionalAsync(ref('a')) }),
}));
const group = recursiveAsync(definition);

const input = { value: 'root', bs: [{ parent: { value: 'child', bs: [] } }] };
const output = { value: 4, bs: [{ parent: { value: 5, bs: [] } }] };

describe('mutualRecursiveAsync', () => {
  test('infers input, output, and issues for both roots', () => {
    expectTypeOf<InferInput<typeof group.a>>().toEqualTypeOf<AInput>();
    expectTypeOf<InferInput<typeof group.b>>().toEqualTypeOf<BInput>();
    expectTypeOf<InferOutput<typeof group.a>>().toEqualTypeOf<AOutput>();
    expectTypeOf<InferOutput<typeof group.b>>().toEqualTypeOf<BOutput>();
    expectTypeOf<InferIssue<typeof group.b>>().toEqualTypeOf<
      StringIssue | ObjectIssue | ArrayIssue
    >();
  });

  test('constructs once and transforms both roots across recursive levels', async () => {
    expect(definition).toHaveBeenCalledTimes(1);
    expect(await parseAsync(group.a, input)).toStrictEqual(output);
    expect(await parseAsync(group.b, { parent: input })).toStrictEqual({
      parent: output,
    });
    expect(definition).toHaveBeenCalledTimes(1);
  });

  test('composes a selected root without changing internal references', async () => {
    const selected = pipeAsync(
      group.a,
      transformAsync(async (value) => value.bs)
    );
    expectTypeOf<InferInput<typeof selected>>().toEqualTypeOf<AInput>();
    expectTypeOf<InferOutput<typeof selected>>().toEqualTypeOf<BOutput[]>();
    expect(await parseAsync(arrayAsync(selected), [input])).toStrictEqual([
      output.bs,
    ]);
  });

  test('supports Standard Schema on both roots', async () => {
    expect(await group.a['~standard'].validate(input)).toStrictEqual({
      typed: true,
      value: output,
    });
    expect(
      await group.b['~standard'].validate({ parent: input })
    ).toStrictEqual({ typed: true, value: { parent: output } });
  });

  test('preserves nested issue paths and messages', async () => {
    const result = await safeParseAsync(group.a, {
      value: 'root',
      bs: [{ parent: { value: 123, bs: [] } }],
    });
    expect(result.success).toBe(false);
    expect(result.issues?.[0].message).toBe('invalid value');
    expect(result.issues?.[0].path?.map(({ key }) => key)).toStrictEqual([
      'bs',
      0,
      'parent',
      'value',
    ]);
  });

  test('resolves a cycle through three definitions', async () => {
    const schemas = recursiveAsync((ref) => ({
      a: objectAsync({ b: optionalAsync(ref('b')) }),
      b: objectAsync({ c: optionalAsync(ref('c')) }),
      c: objectAsync({ a: optionalAsync(ref('a')) }),
    }));
    const value = { b: { c: { a: {} } } };
    expect(await parseAsync(schemas.a, value)).toStrictEqual(value);
  });

  test('accepts labels that collide with Object prototype names', async () => {
    const schemas = recursiveAsync((ref) => ({
      constructor: objectAsync({ next: optionalAsync(ref('toString')) }),
      toString: string(),
    }));
    expect(
      await parseAsync(schemas.constructor, { next: 'end' })
    ).toStrictEqual({ next: 'end' });
  });

  test('rejects unmatched references during construction', () => {
    expect(() => {
      // @ts-expect-error Deliberately exercise the runtime unmatched-label check.
      return recursiveAsync((ref) => ({
        a: objectAsync({ bad: ref('missing') }),
      }));
    }).toThrowError("Unmatched recursive reference: 'missing'");
  });

  test('passes a plain factory that creates separate reference schemas', async () => {
    const group = recursiveAsync((ref) => {
      expect(typeof ref).toBe('function');
      expect(ref).not.toHaveProperty('kind');
      expect(ref).not.toHaveProperty('~run');
      expect(ref).not.toHaveProperty('~standard');
      const next = ref('a');
      expect(typeof next).toBe('object');
      expect(next).toMatchObject({ kind: 'schema', name: 'a', async: true });
      return { a: objectAsync({ next: optionalAsync(next) }) };
    });
    await expect(parseAsync(group.a, { next: {} })).resolves.toStrictEqual({
      next: {},
    });
  });

  test('resolves named references through containers, tuples, and readonly output', async () => {
    const schemas = recursiveAsync((ref) => ({
      a: objectAsync({
        records: recordAsync(string(), ref('b')),
        maps: mapAsync(string(), ref('b')),
        sets: setAsync(ref('b')),
        pair: tupleAsync([number(), optionalAsync(ref('b'))]),
        children: pipeAsync(arrayAsync(ref('b')), readonly()),
      }),
      b: objectAsync({ parent: optionalAsync(ref('a')) }),
    }));
    interface A {
      records: Record<string, B>;
      maps: Map<string, B>;
      sets: Set<B>;
      pair: [number, B | undefined];
      children: B[];
    }
    interface B {
      parent?: A | undefined;
    }
    interface OutA {
      records: Record<string, OutB>;
      maps: Map<string, OutB>;
      sets: Set<OutB>;
      pair: [number, OutB | undefined];
      readonly children: readonly OutB[];
    }
    interface OutB {
      parent?: OutA | undefined;
    }
    expectTypeOf<InferInput<typeof schemas.a>>().toEqualTypeOf<A>();
    expectTypeOf<InferOutput<typeof schemas.a>>().toEqualTypeOf<OutA>();
    const value = {
      records: { item: {} },
      maps: new Map([['item', {}]]),
      sets: new Set([{}]),
      pair: [1, {}],
      children: [{}],
    };
    expect(await parseAsync(schemas.a, value)).toStrictEqual(value);
  });

  test('keeps independent self-recursive edges on each definition', async () => {
    const schemas = recursiveAsync((ref) => ({
      a: objectAsync({
        self: optionalAsync(ref('a')),
        other: optionalAsync(ref('b')),
      }),
      b: objectAsync({
        self: optionalAsync(ref('b')),
        other: optionalAsync(ref('a')),
      }),
    }));
    const value = { self: {}, other: { self: {}, other: {} } };
    expect(await parseAsync(schemas.a, value)).toStrictEqual(value);
    expect(await parseAsync(schemas.b, value)).toStrictEqual(value);
  });

  test('keeps concurrent parses independent', async () => {
    expect(
      await Promise.all([
        parseAsync(group.a, input),
        parseAsync(group.a, input),
      ])
    ).toStrictEqual([output, output]);
  });
});
