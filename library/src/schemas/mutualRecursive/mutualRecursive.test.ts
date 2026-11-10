import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import { readonly, returns, transform } from '../../actions/index.ts';
import { parse, pipe, safeParse } from '../../methods/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { any } from '../any/index.ts';
import { array, type ArrayIssue } from '../array/index.ts';
import { lazy } from '../lazy/index.ts';
import { map } from '../map/index.ts';
import { nullable } from '../nullable/index.ts';
import { number, type NumberIssue } from '../number/index.ts';
import { object, type ObjectIssue } from '../object/index.ts';
import { optional } from '../optional/index.ts';
import { record } from '../record/index.ts';
import { set } from '../set/index.ts';
import { string, type StringIssue } from '../string/index.ts';
import { tuple } from '../tuple/index.ts';
import { mutualRecursive as recursive } from './mutualRecursive.ts';

const schemas = recursive((ref) => ({
  outer: object({
    name: string(),
    children: array(ref('outer')),
    links: array(ref('inner')),
  }),
  inner: pipe(
    object({
      score: pipe(
        string(),
        transform((value) => value.length)
      ),
      parent: optional(ref('outer')),
      next: nullable(ref('inner')),
    }),
    transform((value) => ({ ...value, label: 'link' as const }))
  ),
}));

interface OuterInput {
  name: string;
  children: OuterInput[];
  links: InnerInput[];
}
interface InnerInput {
  score: string;
  parent?: OuterInput | undefined;
  next: InnerInput | null;
}
interface OuterOutput {
  name: string;
  children: OuterOutput[];
  links: InnerOutput[];
}
interface InnerOutput {
  score: number;
  parent?: OuterOutput | undefined;
  next: InnerOutput | null;
  label: 'link';
}

const input = {
  name: 'root',
  children: [],
  links: [
    {
      score: 'one',
      parent: {
        name: 'parent',
        children: [],
        links: [{ score: 'two!', next: null }],
      },
      next: { score: 'x', next: null },
    },
  ],
};

const output = {
  name: 'root',
  children: [],
  links: [
    {
      score: 3,
      parent: {
        name: 'parent',
        children: [],
        links: [{ score: 4, next: null, label: 'link' }],
      },
      next: { score: 1, next: null, label: 'link' },
      label: 'link',
    },
  ],
};

describe('mutualRecursive', () => {
  test('infers distinct recursive input and transformed output for both roots', () => {
    expectTypeOf<keyof typeof schemas>().toEqualTypeOf<'outer' | 'inner'>();
    expectTypeOf<
      InferInput<typeof schemas.outer>
    >().toEqualTypeOf<OuterInput>();
    expectTypeOf<
      InferOutput<typeof schemas.outer>
    >().toEqualTypeOf<OuterOutput>();
    expectTypeOf<
      InferInput<typeof schemas.inner>
    >().toEqualTypeOf<InnerInput>();
    expectTypeOf<
      InferOutput<typeof schemas.inner>
    >().toEqualTypeOf<InnerOutput>();
    expectTypeOf<InferIssue<typeof schemas.outer>>().toEqualTypeOf<
      ObjectIssue | ArrayIssue | StringIssue
    >();
  });

  test('parses alternating outer and inner nodes and transforms every inner node', () => {
    expect(parse(schemas.outer, input)).toStrictEqual(output);
    expect(parse(schemas.inner, input.links[0])).toStrictEqual(output.links[0]);
  });

  test('keeps independent self-recursive edges on each definition', () => {
    expect(
      parse(schemas.outer, {
        name: 'root',
        children: [{ name: 'child', children: [], links: [] }],
        links: [],
      })
    ).toStrictEqual({
      name: 'root',
      children: [{ name: 'child', children: [], links: [] }],
      links: [],
    });
  });

  test('constructs all definitions once and does not reconstruct during parsing', () => {
    const construct = vi.fn(
      (ref: Parameters<Parameters<typeof recursive>[0]>[0]) => ({
        a: object({ bs: array(ref('b')) }),
        b: object({ as: array(ref('a')) }),
      })
    );
    const group = recursive(construct);
    expect(construct).toHaveBeenCalledTimes(1);
    const value = { bs: [{ as: [{ bs: [] }] }] };
    expect(parse(group.a, value)).toStrictEqual(value);
    expect(parse(group.a, value)).toStrictEqual(value);
    expect(construct).toHaveBeenCalledTimes(1);
  });

  test('composes a selected root through pipe and array without changing internal references', () => {
    const selected = pipe(
      schemas.outer,
      transform((value) => value.links)
    );
    expectTypeOf<InferInput<typeof selected>>().toEqualTypeOf<OuterInput>();
    expectTypeOf<InferOutput<typeof selected>>().toEqualTypeOf<InnerOutput[]>();
    expect(parse(selected, input)).toStrictEqual(output.links);
    expect(parse(array(schemas.outer), [input])).toStrictEqual([output]);
  });

  test('implements Standard Schema validation on both roots', () => {
    expect(schemas.outer['~standard'].validate(input)).toStrictEqual({
      typed: true,
      value: output,
    });
    expect(schemas.inner['~standard'].validate(input.links[0])).toStrictEqual({
      typed: true,
      value: output.links[0],
    });
  });

  test('preserves the exact path and message for an invalid nested inner value', () => {
    const result = safeParse(schemas.outer, {
      ...input,
      links: [{ score: 'valid', next: { score: 42, next: null } }],
    });
    expect(result.success).toBe(false);
    expect(
      result.issues?.map((issue) => ({
        type: issue.type,
        message: issue.message,
        path: issue.path?.map((item) => item.key),
      }))
    ).toStrictEqual([
      {
        type: 'string',
        message: 'Invalid type: Expected string but received 42',
        path: ['links', 0, 'next', 'score'],
      },
    ]);
  });

  test('preserves the exact path and message when recursion returns to the outer definition', () => {
    const result = safeParse(schemas.outer, {
      name: 'root',
      children: [],
      links: [
        {
          score: 'valid',
          next: null,
          parent: { name: 42, children: [], links: [] },
        },
      ],
    });
    expect(result.success).toBe(false);
    expect(
      result.issues?.map((issue) => ({
        type: issue.type,
        message: issue.message,
        path: issue.path?.map((item) => item.key),
      }))
    ).toStrictEqual([
      {
        type: 'string',
        message: 'Invalid type: Expected string but received 42',
        path: ['links', 0, 'parent', 'name'],
      },
    ]);
  });

  test('resolves a cycle through three definitions', () => {
    const group = recursive((ref) => ({
      a: object({ b: optional(ref('b')) }),
      b: object({ c: optional(ref('c')) }),
      c: object({ a: optional(ref('a')) }),
    }));
    interface A {
      b?: B | undefined;
    }
    interface B {
      c?: C | undefined;
    }
    interface C {
      a?: A | undefined;
    }
    expectTypeOf<InferInput<typeof group.a>>().toEqualTypeOf<A>();
    expectTypeOf<InferOutput<typeof group.c>>().toEqualTypeOf<C>();
    expect(parse(group.a, { b: { c: { a: {} } } })).toStrictEqual({
      b: { c: { a: {} } },
    });
  });

  test('resolves named references through containers, tuples, and readonly output', () => {
    const group = recursive((ref) => ({
      a: object({
        records: record(string(), ref('b')),
        maps: map(string(), ref('b')),
        sets: set(ref('b')),
        pair: tuple([number(), optional(ref('b'))]),
        children: pipe(array(ref('b')), readonly()),
      }),
      b: object({ parent: optional(ref('a')) }),
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
    expectTypeOf<InferInput<typeof group.a>>().toEqualTypeOf<A>();
    expectTypeOf<InferOutput<typeof group.a>>().toEqualTypeOf<OutA>();
    const value = {
      records: { item: {} },
      maps: new Map([['item', {}]]),
      sets: new Set([{}]),
      pair: [1, {}],
      children: [{}],
    };
    expect(parse(group.a, value)).toStrictEqual(value);
  });

  test('includes issues from referenced definitions in the selected root issue type', () => {
    const group = recursive((ref) => ({
      a: object({ bs: array(ref('b')) }),
      b: object({ score: number(), parent: optional(ref('a')) }),
    }));
    expectTypeOf<InferIssue<typeof group.a>>().toEqualTypeOf<
      ObjectIssue | ArrayIssue | NumberIssue
    >();
    expect(parse(group.a, { bs: [{ score: 1 }] })).toStrictEqual({
      bs: [{ score: 1 }],
    });
  });

  test('accepts definition labels that collide with Object prototype names', () => {
    const group = recursive((ref) => ({
      constructor: object({ next: optional(ref('toString')) }),
      toString: object({ next: optional(ref('constructor')) }),
    }));
    expect(parse(group.constructor, { next: { next: {} } })).toStrictEqual({
      next: { next: {} },
    });
  });

  test('checks references created by a lazy getter during parsing', () => {
    const getter = vi.fn();
    // @ts-expect-error Deliberately exercise the runtime check for a late unmatched label.
    const group = recursive((ref) => ({
      a: lazy(() => {
        getter();
        return ref('missing');
      }),
    }));

    expect(getter).not.toHaveBeenCalled();
    expect(() => parse(group.a, {})).toThrowError(
      new Error("Unmatched recursive reference: 'missing'")
    );
    expect(getter).toHaveBeenCalledOnce();
  });

  test('passes a plain factory that creates separate reference schemas', () => {
    const group = recursive((ref) => {
      expect(typeof ref).toBe('function');
      expect(ref).not.toHaveProperty('kind');
      expect(ref).not.toHaveProperty('~run');
      expect(ref).not.toHaveProperty('~standard');
      const next = ref('a');
      expect(typeof next).toBe('object');
      expect(next).toMatchObject({ kind: 'schema', name: 'a', async: false });
      return { a: object({ next: optional(next) }) };
    });
    expect(parse(group.a, { next: {} })).toStrictEqual({ next: {} });
  });

  test('rejects direct labelled reference execution', () => {
    const definition = vi.fn(
      (ref: Parameters<Parameters<typeof recursive>[0]>[0]) => ({
        a: object({ children: array(ref('b')) }),
        b: object({ children: array(ref('a')) }),
      })
    );
    const schemas = recursive(definition);
    const marker = definition.mock.results[0].value.a.entries.children.item;
    const input = { children: [{ children: [] }] };
    const message = 'Recursive reference used outside its recursive schema';

    expect(() => parse(marker, input)).toThrowError(message);
    expect(() => marker['~run']({ value: input }, {})).toThrowError(message);
    expect(() => marker['~standard'].validate(input)).toThrowError(message);
    expect(parse(schemas.a, input)).toStrictEqual(input);
    expect(parse(schemas.b, input)).toStrictEqual(input);
  });

  test('rejects a foreign reference during construction', () => {
    const definition = vi.fn(
      (ref: Parameters<Parameters<typeof recursive>[0]>[0]) => ({
        a: object({ children: array(ref('a')) }),
      })
    );
    recursive(definition);
    const result = definition.mock.results[0];
    if (result.type !== 'return') {
      throw new Error('Expected the recursive definition to return');
    }
    const marker = result.value.a.entries.children.item;

    expect(() =>
      recursive(() => ({ a: object({ children: array(marker) }) }))
    ).toThrowError('Recursive reference used outside its recursive schema');
  });

  test('rejects a foreign reference inside a returns action during construction', () => {
    const definition = vi.fn(
      (ref: Parameters<Parameters<typeof recursive>[0]>[0]) => ({
        a: object({ children: array(ref('a')) }),
      })
    );
    recursive(definition);
    const result = definition.mock.results[0];
    if (result.type !== 'return') {
      throw new Error('Expected the recursive definition to return');
    }
    const marker = result.value.a.entries.children.item;

    expect(() =>
      recursive(() => ({ a: pipe(any(), returns(marker)) }))
    ).toThrowError('Recursive reference used outside its recursive schema');
  });

  test('throws the exact unmatched-reference error during construction', () => {
    expect(() => {
      // @ts-expect-error Deliberately exercise the runtime check for an unmatched label.
      return recursive((ref) => ({
        a: object({ b: ref('b'), bad: ref('typo') }),
        b: object({ a: optional(ref('a')) }),
      }));
    }).toThrowError(new Error("Unmatched recursive reference: 'typo'"));
  });
});
