import { describe, expectTypeOf, test } from 'vitest';
import { readonly, transform } from '../../actions/index.ts';
import { pipe } from '../../methods/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  GenericSchema,
  InferInput,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import { array, type ArrayIssue } from '../array/index.ts';
import { instance } from '../instance/index.ts';
import { intersect } from '../intersect/index.ts';
import { literal } from '../literal/index.ts';
import { map } from '../map/index.ts';
import { nullable } from '../nullable/index.ts';
import { number, type NumberIssue } from '../number/index.ts';
import { object, type ObjectIssue } from '../object/index.ts';
import { objectAsync } from '../object/objectAsync.ts';
import { optional } from '../optional/index.ts';
import { record } from '../record/index.ts';
import { set } from '../set/index.ts';
import { string, type StringIssue } from '../string/index.ts';
import { tuple } from '../tuple/index.ts';
import { tupleWithRest } from '../tupleWithRest/index.ts';
import { union, type UnionIssue } from '../union/index.ts';
import { variant } from '../variant/index.ts';
import {
  mutualRecursive,
  type MutualRecursiveSchema,
  type RecursiveMarker,
  type RecursiveReferences,
  type RefFactory,
  type ResolveRecursiveInput,
  type ResolveRecursiveOutput,
} from './mutualRecursive.ts';

describe('mutualRecursive', () => {
  const definition = (ref: RefFactory) => ({
    a: object({ name: string(), bs: array(ref('b')) }),
    b: object({ score: number(), parent: optional(ref('a')) }),
  });
  const schemas = mutualRecursive(definition);
  interface A {
    name: string;
    bs: B[];
  }
  interface B {
    score: number;
    parent?: A | undefined;
  }
  type Issues = ObjectIssue | ArrayIssue | StringIssue | NumberIssue;

  test('preserves exact definition names', () => {
    expectTypeOf<keyof typeof schemas>().toEqualTypeOf<'a' | 'b'>();

    // @ts-expect-error Only declared definitions are returned.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- This access checks that an undeclared name is rejected.
    schemas.missing;
  });

  test('returns a schema with the exact wrapped definition at each name', () => {
    expectTypeOf(schemas.a).toEqualTypeOf<
      MutualRecursiveSchema<ReturnType<typeof definition>['a'], A, A, Issues>
    >();
    expectTypeOf(schemas.b).toEqualTypeOf<
      MutualRecursiveSchema<ReturnType<typeof definition>['b'], B, B, Issues>
    >();
    expectTypeOf(schemas.a.wrapped).toEqualTypeOf<
      ReturnType<typeof definition>['a']
    >();
    expectTypeOf(schemas.a).toExtend<GenericSchema>();
    expectTypeOf(schemas.a.async).toEqualTypeOf<false>();
    expectTypeOf(schemas.a.type).toEqualTypeOf<'mutualRecursive'>();
  });

  test('infers input and output for every root', () => {
    expectTypeOf<InferInput<typeof schemas.a>>().toEqualTypeOf<A>();
    expectTypeOf<InferOutput<typeof schemas.a>>().toEqualTypeOf<A>();
    expectTypeOf<InferInput<typeof schemas.b>>().toEqualTypeOf<B>();
    expectTypeOf<InferOutput<typeof schemas.b>>().toEqualTypeOf<B>();
    expectTypeOf<InferIssue<typeof schemas.a>>().toEqualTypeOf<Issues>();
    expectTypeOf<InferIssue<typeof schemas.b>>().toEqualTypeOf<Issues>();
  });

  test('resolves independent self-recursion and mutual recursion', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const group = mutualRecursive((ref) => ({
      a: object({ children: array(ref('a')), links: array(ref('b')) }),
      b: object({ children: array(ref('b')), parent: optional(ref('a')) }),
    }));
    interface A {
      children: A[];
      links: B[];
    }
    interface B {
      children: B[];
      parent?: A | undefined;
    }
    expectTypeOf<InferInput<typeof group.a>>().toEqualTypeOf<A>();
    expectTypeOf<InferOutput<typeof group.a>>().toEqualTypeOf<A>();
    expectTypeOf<InferInput<typeof group.b>>().toEqualTypeOf<B>();
    expectTypeOf<InferOutput<typeof group.b>>().toEqualTypeOf<B>();
  });

  test('resolves cycles through three definitions', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const group = mutualRecursive((ref) => ({
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
    expectTypeOf<InferOutput<typeof group.a>>().toEqualTypeOf<A>();
    expectTypeOf<InferInput<typeof group.b>>().toEqualTypeOf<B>();
    expectTypeOf<InferOutput<typeof group.b>>().toEqualTypeOf<B>();
    expectTypeOf<InferInput<typeof group.c>>().toEqualTypeOf<C>();
    expectTypeOf<InferOutput<typeof group.c>>().toEqualTypeOf<C>();
  });

  test('resolves transformations and defaults at every level', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const group = mutualRecursive((ref) => ({
      a: object({ items: array(ref('b')) }),
      b: object({
        value: pipe(string(), transform(Number)),
        label: optional(string(), 'default'),
        parent: optional(ref('a')),
      }),
    }));
    interface InputA {
      items: InputB[];
    }
    interface InputB {
      value: string;
      label?: string | undefined;
      parent?: InputA | undefined;
    }
    interface OutputA {
      items: OutputB[];
    }
    interface OutputB {
      value: number;
      label: string;
      parent?: OutputA | undefined;
    }
    expectTypeOf<InferInput<typeof group.a>>().toEqualTypeOf<InputA>();
    expectTypeOf<InferOutput<typeof group.a>>().toEqualTypeOf<OutputA>();
    expectTypeOf<InferInput<typeof group.b>>().toEqualTypeOf<InputB>();
    expectTypeOf<InferOutput<typeof group.b>>().toEqualTypeOf<OutputB>();
    expectTypeOf<{ items: { value: number }[] }>().not.toExtend<
      InferInput<typeof group.a>
    >();
    expectTypeOf<{ items: { value: string; label: string }[] }>().not.toExtend<
      InferOutput<typeof group.a>
    >();
    expectTypeOf<{ items: { value: number }[] }>().not.toExtend<
      InferOutput<typeof group.a>
    >();
  });

  test('resolves whole-object transformations across definitions', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const group = mutualRecursive((ref) => ({
      a: object({ items: array(ref('b')) }),
      b: pipe(
        object({ parent: optional(ref('a')) }),
        transform((value) => ({ ...value, label: 'item' as const }))
      ),
    }));
    interface InputA {
      items: InputB[];
    }
    interface InputB {
      parent?: InputA | undefined;
    }
    interface OutputA {
      items: OutputB[];
    }
    interface OutputB {
      parent?: OutputA | undefined;
      label: 'item';
    }
    expectTypeOf<InferInput<typeof group.a>>().toEqualTypeOf<InputA>();
    expectTypeOf<InferOutput<typeof group.a>>().toEqualTypeOf<OutputA>();
    expectTypeOf<InferInput<typeof group.b>>().toEqualTypeOf<InputB>();
    expectTypeOf<InferOutput<typeof group.b>>().toEqualTypeOf<OutputB>();
  });

  test('preserves recursion when composing a selected root', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const selected = pipe(
      schemas.a,
      transform((value) => value.bs)
    );
    expectTypeOf<InferInput<typeof selected>>().toEqualTypeOf<A>();
    expectTypeOf<InferOutput<typeof selected>>().toEqualTypeOf<B[]>();
    expectTypeOf<InferIssue<typeof selected>>().toEqualTypeOf<Issues>();
    expectTypeOf<
      InferInput<ReturnType<typeof array<typeof schemas.a>>>
    >().toEqualTypeOf<A[]>();
  });

  test('resolves containers and readonly arrays', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const group = mutualRecursive((ref) => ({
      a: object({
        records: record(string(), nullable(ref('b'))),
        maps: map(ref('b'), ref('b')),
        sets: set(ref('b')),
        pair: tuple([string(), optional(ref('b'))]),
        children: pipe(array(ref('b')), readonly()),
      }),
      b: object({ parent: optional(ref('a')) }),
    }));
    interface InputA {
      records: Record<string, InputB | null>;
      maps: Map<InputB, InputB>;
      sets: Set<InputB>;
      pair: [string, InputB | undefined];
      children: InputB[];
    }
    interface InputB {
      parent?: InputA | undefined;
    }
    interface OutputA {
      records: Record<string, OutputB | null>;
      maps: Map<OutputB, OutputB>;
      sets: Set<OutputB>;
      pair: [string, OutputB | undefined];
      readonly children: readonly OutputB[];
    }
    interface OutputB {
      parent?: OutputA | undefined;
    }
    expectTypeOf<InferInput<typeof group.a>>().toEqualTypeOf<InputA>();
    expectTypeOf<InferOutput<typeof group.a>>().toEqualTypeOf<OutputA>();
    expectTypeOf<InferInput<typeof group.b>>().toEqualTypeOf<InputB>();
    expectTypeOf<InferOutput<typeof group.b>>().toEqualTypeOf<OutputB>();
  });

  test('resolves recursive tuples and variadic tuples', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const group = mutualRecursive((ref) => ({
      a: union([tuple([string()]), tuple([string(), ref('b')])]),
      b: tupleWithRest([number()], ref('a')),
    }));
    type A = [string] | [string, B];
    type B = [number, ...A[]];
    expectTypeOf<InferInput<typeof group.a>>().toEqualTypeOf<A>();
    expectTypeOf<InferOutput<typeof group.a>>().toEqualTypeOf<A>();
    expectTypeOf<InferInput<typeof group.b>>().toEqualTypeOf<B>();
    expectTypeOf<InferOutput<typeof group.b>>().toEqualTypeOf<B>();
  });

  test('resolves unions without an enclosing object', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const group = mutualRecursive((ref) => ({
      a: union([string(), array(ref('b'))]),
      b: union([string(), array(ref('a'))]),
    }));
    type A = string | B[];
    type B = string | A[];
    type Issues =
      | StringIssue
      | ArrayIssue
      | UnionIssue<StringIssue | ArrayIssue>;
    expectTypeOf<InferInput<typeof group.a>>().toEqualTypeOf<A>();
    expectTypeOf<InferOutput<typeof group.b>>().toEqualTypeOf<B>();
    expectTypeOf<InferIssue<typeof group.a>>().toEqualTypeOf<Issues>();
  });

  test('resolves variants inside intersections', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const group = mutualRecursive((ref) => ({
      node: intersect([
        object({ id: number() }),
        variant('kind', [
          object({ kind: literal('leaf'), value: string() }),
          object({ kind: literal('branch'), children: array(ref('node')) }),
        ]),
      ]),
      root: object({ node: ref('node') }),
    }));
    type Node = { id: number } & (
      | { kind: 'leaf'; value: string }
      | { kind: 'branch'; children: Node[] }
    );
    expectTypeOf<InferInput<typeof group.node>>().toExtend<Node>();
    expectTypeOf<Node>().toExtend<InferInput<typeof group.node>>();
    expectTypeOf<InferOutput<typeof group.root>>().toExtend<{ node: Node }>();
    expectTypeOf<{ node: Node }>().toExtend<InferOutput<typeof group.root>>();
    expectTypeOf<{
      id: number;
      kind: 'branch';
      children: { id: number; kind: 'leaf'; value: number }[];
    }>().not.toExtend<InferOutput<typeof group.node>>();
  });

  test('preserves non-recursive instances and branded container subclasses', () => {
    class User {
      private readonly _brand!: 'User';
    }
    class CustomMap extends Map<string, string> {
      private readonly _brand!: 'CustomMap';
    }
    class CustomSet extends Set<string> {
      private readonly _brand!: 'CustomSet';
    }
    class CustomArray extends Array<string> {
      private readonly _brand!: 'CustomArray';
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const group = mutualRecursive((ref) => ({
      a: object({
        user: instance(User),
        url: instance(URL),
        error: instance(Error),
        bytes: instance(Uint8Array),
        maps: instance(CustomMap),
        sets: instance(CustomSet),
        arrays: instance(CustomArray),
        next: optional(ref('a')),
      }),
    }));
    interface A {
      user: User;
      url: URL;
      error: Error;
      bytes: InstanceType<typeof Uint8Array>;
      maps: CustomMap;
      sets: CustomSet;
      arrays: CustomArray;
      next?: A | undefined;
    }
    expectTypeOf<InferInput<typeof group.a>>().toEqualTypeOf<A>();
    expectTypeOf<InferOutput<typeof group.a>>().toEqualTypeOf<A>();
  });

  test('keeps nested independent definitions independent', () => {
    const inner = mutualRecursive((ref) => ({
      tag: object({ aliases: array(ref('tag')) }),
    }));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const outer = mutualRecursive((ref) => ({
      node: object({ children: array(ref('node')), tags: array(inner.tag) }),
    }));
    interface Tag {
      aliases: Tag[];
    }
    interface Node {
      children: Node[];
      tags: Tag[];
    }
    expectTypeOf<InferInput<typeof outer.node>>().toEqualTypeOf<Node>();
    expectTypeOf<InferOutput<typeof outer.node>>().toEqualTypeOf<Node>();
  });

  test('preserves names that collide with Object prototype properties', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const group = mutualRecursive((ref) => ({
      constructor: object({ next: optional(ref('toString')) }),
      toString: object({ next: optional(ref('constructor')) }),
    }));
    expectTypeOf<keyof typeof group>().toEqualTypeOf<
      'constructor' | 'toString'
    >();
    interface A {
      next?: B | undefined;
    }
    interface B {
      next?: A | undefined;
    }
    expectTypeOf<InferInput<typeof group.constructor>>().toEqualTypeOf<A>();
    expectTypeOf<InferOutput<typeof group.toString>>().toEqualTypeOf<B>();
  });

  test('resolves promises, readonly containers, and tuple modifiers', () => {
    interface Root {
      value: number;
    }
    interface Definitions {
      node: Root;
    }
    type Marker = RecursiveMarker<'node'>;
    interface Input {
      promise: Promise<Marker>;
      map: ReadonlyMap<Marker, Marker>;
      set: ReadonlySet<Marker>;
      tuple: readonly [name: string, node?: Marker];
      array: readonly Marker[];
      long: [
        Marker,
        Marker,
        Marker,
        Marker,
        Marker,
        Marker,
        Marker,
        Marker,
        Marker,
      ];
    }
    interface Expected {
      promise: Promise<Root>;
      map: ReadonlyMap<Root, Root>;
      set: ReadonlySet<Root>;
      tuple: readonly [name: string, node?: Root];
      array: readonly Root[];
      long: [Root, Root, Root, Root, Root, Root, Root, Root, Root];
    }
    expectTypeOf<
      ResolveRecursiveInput<Input, Definitions>
    >().toEqualTypeOf<Expected>();
    expectTypeOf<
      ResolveRecursiveOutput<Input, Definitions>
    >().toEqualTypeOf<Expected>();
  });

  test('collects no references from any, unknown, or never', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Regression coverage requires any.
    expectTypeOf<RecursiveReferences<any>>().toEqualTypeOf<never>();
    expectTypeOf<RecursiveReferences<unknown>>().toEqualTypeOf<never>();
    expectTypeOf<RecursiveReferences<never>>().toEqualTypeOf<never>();
  });

  test('collects concrete references beside any and unknown properties', () => {
    expectTypeOf<
      RecursiveReferences<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Regression coverage requires any.
        arbitrary: any;
        unknown: unknown;
        next: RecursiveMarker<'node'>;
      }>
    >().toEqualTypeOf<RecursiveMarker<'node'>>();
  });

  test('collects references through containers and cyclic objects', () => {
    interface Cycle {
      next?: Cycle;
      reference: RecursiveMarker<'cycle'>;
    }
    interface Containers {
      optional?: RecursiveMarker<'optional'>;
      array: RecursiveMarker<'array'>[];
      tuple: readonly [RecursiveMarker<'tuple'>?];
      map: ReadonlyMap<RecursiveMarker<'key'>, RecursiveMarker<'value'>>;
      set: ReadonlySet<RecursiveMarker<'set'>>;
      promise: Promise<RecursiveMarker<'promise'>>;
      cycle: Cycle;
    }
    expectTypeOf<RecursiveReferences<Containers>>().toEqualTypeOf<
      | RecursiveMarker<'optional'>
      | RecursiveMarker<'array'>
      | RecursiveMarker<'tuple'>
      | RecursiveMarker<'key'>
      | RecursiveMarker<'value'>
      | RecursiveMarker<'set'>
      | RecursiveMarker<'promise'>
      | RecursiveMarker<'cycle'>
    >();
  });

  test('checks concrete output references independently of unknown input', () => {
    const valid = {} as BaseSchema<
      unknown,
      RecursiveMarker<'node'>,
      BaseIssue<unknown>
    >;
    const invalid = {} as BaseSchema<
      unknown,
      RecursiveMarker<'missing'>,
      BaseIssue<unknown>
    >;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const group = mutualRecursive(() => ({ node: string(), root: valid }));
    expectTypeOf<InferInput<typeof group.root>>().toEqualTypeOf<unknown>();
    expectTypeOf<InferOutput<typeof group.root>>().toEqualTypeOf<string>();
    // @ts-expect-error Unknown input must not hide a missing output reference.
    mutualRecursive(() => ({ node: string(), root: invalid }));
  });

  test('checks concrete input references independently of unknown output', () => {
    const valid = {} as BaseSchema<
      RecursiveMarker<'node'>,
      unknown,
      BaseIssue<unknown>
    >;
    const invalid = {} as BaseSchema<
      RecursiveMarker<'missing'>,
      unknown,
      BaseIssue<unknown>
    >;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- The type assertions use this variable.
    const group = mutualRecursive(() => ({ node: string(), root: valid }));
    expectTypeOf<InferInput<typeof group.root>>().toEqualTypeOf<string>();
    expectTypeOf<InferOutput<typeof group.root>>().toEqualTypeOf<unknown>();
    // @ts-expect-error Unknown output must not hide a missing input reference.
    mutualRecursive(() => ({ node: string(), root: invalid }));
  });

  test('checks sibling definitions independently of an any-typed definition', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Regression coverage requires any.
    const arbitrary = {} as any;
    mutualRecursive((ref) => ({
      arbitrary,
      node: object({ next: optional(ref('node')) }),
    }));
    // @ts-expect-error An any-typed definition must not hide a missing reference.
    mutualRecursive((ref) => ({
      arbitrary,
      node: object({ next: ref('missing') }),
    }));
  });

  test('rejects references to missing definitions', () => {
    // @ts-expect-error The referenced name is not declared.
    mutualRecursive((ref) => ({ a: object({ next: ref('missing') }) }));
    // @ts-expect-error References in input still count after a transform removes them.
    mutualRecursive((ref) => ({
      a: pipe(
        object({ bad: ref('missing') }),
        transform(() => 'done')
      ),
    }));
    mutualRecursive((ref) => ({
      a: object({
        // @ts-expect-error Named references require one argument.
        next: ref(),
      }),
    }));
  });

  test('keeps the reference factory separate from reference schemas', () => {
    mutualRecursive((ref) => {
      expectTypeOf(ref).toEqualTypeOf<RefFactory>();
      // @ts-expect-error A reference factory is not a schema.
      array(ref);
      // @ts-expect-error A reference factory has no schema execution method.
      expectTypeOf(ref['~run']);
      return { a: object({ next: optional(ref('a')) }) };
    });
  });

  test('rejects invalid callback results', () => {
    // @ts-expect-error A single schema is not a definitions object.
    mutualRecursive(() => string());
    // @ts-expect-error Every definition must be a schema.
    mutualRecursive(() => ({ a: 123 }));
    // @ts-expect-error A definition callback cannot return undefined.
    mutualRecursive(() => undefined);
    // @ts-expect-error Async definition callbacks are not supported.
    mutualRecursive(async () => ({ a: string() }));
    // @ts-expect-error Async schemas are not supported.
    mutualRecursive(() => ({ a: objectAsync({}) }));
  });
});
