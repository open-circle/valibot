import { describe, expectTypeOf, test } from 'vitest';
import * as v from '../../index.ts';

interface Box<T> {
  readonly kind: 'box';
  readonly value: T;
}

declare module '../../types/generics.ts' {
  interface Generics<T, TArgs> {
    WeakMap: {
      getArgs: T extends WeakMap<infer K, infer V> ? [K, V] : never;
      applyArgs: TArgs extends [infer K extends object, infer V]
        ? WeakMap<K, V>
        : never;
    };
    Box: {
      getArgs: T extends Box<infer V> ? [V] : never;
      applyArgs: TArgs extends [infer V] ? Box<V> : never;
    };
  }
}

interface InputNode {
  name: string;
  children: InputNode[];
}

interface OutputNode {
  name: string;
  children: WeakMap<object, OutputNode>;
}

describe('registered recursive generics', () => {
  test('extracts and applies generic arguments', () => {
    expectTypeOf<
      v.Generics<WeakMap<object, string>, never>['WeakMap']['getArgs']
    >().toEqualTypeOf<[object, string]>();
    expectTypeOf<v.Generics<string, never>['WeakMap']['getArgs']>().toBeNever();
    expectTypeOf<
      v.Generics<never, [object, number]>['WeakMap']['applyArgs']
    >().toEqualTypeOf<WeakMap<object, number>>();
    expectTypeOf<
      v.Generics<never, [string, number]>['WeakMap']['applyArgs']
    >().toBeNever();
  });

  test('resolves transformed recursive values inside WeakMap', () => {
    const schema = v.recursive((self) =>
      v.pipe(
        v.object({ name: v.string(), children: v.array(self) }),
        v.transform((node) => ({
          name: node.name,
          children: new WeakMap<object, (typeof node.children)[number]>(
            node.children.map((child) => [child, child])
          ),
        }))
      )
    );
    expectTypeOf<v.InferInput<typeof schema>>().toEqualTypeOf<InputNode>();
    expectTypeOf(schema)
      .toHaveProperty('~types')
      .exclude<undefined>()
      .toHaveProperty('output')
      .toEqualTypeOf<OutputNode>();
    expectTypeOf<v.InferOutput<typeof schema>['children']>().toEqualTypeOf<
      WeakMap<object, OutputNode>
    >();
  });

  test('resolves transformed async recursive values inside WeakMap', () => {
    const schema = v.recursiveAsync((self) =>
      v.pipeAsync(
        v.objectAsync({ name: v.string(), children: v.arrayAsync(self) }),
        v.transform((node) => ({
          name: node.name,
          children: new WeakMap<object, (typeof node.children)[number]>(
            node.children.map((child) => [child, child])
          ),
        }))
      )
    );
    expectTypeOf<v.InferInput<typeof schema>>().toEqualTypeOf<InputNode>();
    expectTypeOf(schema)
      .toHaveProperty('~types')
      .exclude<undefined>()
      .toHaveProperty('output')
      .toEqualTypeOf<OutputNode>();
  });

  test('resolves mutually recursive values in registered generics', () => {
    const schemas = v.mutualRecursive((ref) => ({
      node: v.pipe(
        v.object({ leaf: ref('leaf') }),
        v.transform(
          (node) => new WeakMap<object, typeof node.leaf>([[{}, node.leaf]])
        )
      ),
      leaf: v.object({ parent: v.optional(ref('node')) }),
    }));
    interface Leaf {
      parent?: WeakMap<object, Leaf> | undefined;
    }
    expectTypeOf(schemas.node)
      .toHaveProperty('~types')
      .exclude<undefined>()
      .toHaveProperty('output')
      .toEqualTypeOf<WeakMap<object, Leaf>>();
  });

  test('resolves mutually recursive async values in registered generics', () => {
    const schemas = v.mutualRecursiveAsync((ref) => ({
      node: v.pipeAsync(
        v.objectAsync({ leaf: ref('leaf') }),
        v.transform(
          (node) => new WeakMap<object, typeof node.leaf>([[{}, node.leaf]])
        )
      ),
      leaf: v.objectAsync({ parent: v.optionalAsync(ref('node')) }),
    }));
    interface Leaf {
      parent?: WeakMap<object, Leaf> | undefined;
    }
    expectTypeOf(schemas.node)
      .toHaveProperty('~types')
      .exclude<undefined>()
      .toHaveProperty('output')
      .toEqualTypeOf<WeakMap<object, Leaf>>();
  });

  test('reports constraint errors after resolving named references', () => {
    const schemas = v.mutualRecursive((ref) => ({
      key: v.string(),
      lookup: v.pipe(
        v.object({ key: ref('key') }),
        v.transform((node) => new WeakMap([[node.key, true]]))
      ),
    }));
    expectTypeOf(schemas.lookup)
      .toHaveProperty('~types')
      .exclude<undefined>()
      .toHaveProperty('output')
      .toEqualTypeOf<
        v.GenericConstraintError<{
          generic: 'WeakMap';
          received: [string, boolean];
        }>
      >();
  });

  test('resolves user-defined generics inside built-in containers', () => {
    const schema = v.recursive((self) =>
      v.pipe(
        v.object({ name: v.string(), children: v.array(self) }),
        v.transform((node) => ({
          name: node.name,
          children: node.children.map((child) => ({
            kind: 'box' as const,
            value: child,
          })),
        }))
      )
    );
    interface BoxNode {
      name: string;
      children: Box<BoxNode>[];
    }
    expectTypeOf(schema)
      .toHaveProperty('~types')
      .exclude<undefined>()
      .toHaveProperty('output')
      .toEqualTypeOf<BoxNode>();
  });

  test('preserves registered types without recursive references', () => {
    const schema = v.recursive(() => v.instance(WeakMap<object, string>));
    expectTypeOf(schema)
      .toHaveProperty('~types')
      .exclude<undefined>()
      .toHaveProperty('output')
      .toEqualTypeOf<WeakMap<object, string>>();
  });
});
