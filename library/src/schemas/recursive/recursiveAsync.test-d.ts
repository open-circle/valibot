import { describe, expectTypeOf, test } from 'vitest';
import { readonly, transformAsync } from '../../actions/index.ts';
import { pipeAsync } from '../../methods/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  arrayAsync,
  type ArrayIssue,
  type ArraySchemaAsync,
} from '../array/index.ts';
import { instance } from '../instance/index.ts';
import { intersectAsync } from '../intersect/index.ts';
import { literal } from '../literal/index.ts';
import { mapAsync } from '../map/index.ts';
import { nullableAsync } from '../nullable/index.ts';
import { number } from '../number/index.ts';
import {
  objectAsync,
  type ObjectIssue,
  type ObjectSchemaAsync,
} from '../object/index.ts';
import { optional, optionalAsync } from '../optional/index.ts';
import { recordAsync } from '../record/index.ts';
import { setAsync } from '../set/index.ts';
import {
  string,
  type StringIssue,
  type StringSchema,
} from '../string/index.ts';
import { tupleAsync } from '../tuple/index.ts';
import type { UnionIssue, UnionSchemaAsync } from '../union/index.ts';
import { variantAsync } from '../variant/index.ts';
import type { RefAsync } from './_recursive.ts';
import { recursiveAsync, type RecursiveSchemaAsync } from './recursiveAsync.ts';

describe('recursiveAsync', () => {
  test('rejects maps, invalid definitions, and named references', () => {
    // @ts-expect-error Mutual recursion belongs to mutualRecursiveAsync.
    recursiveAsync(() => ({ a: string() }));
    // @ts-expect-error A definition must return a schema, not a promise.
    recursiveAsync(async () => string());
    // @ts-expect-error A definition must return a schema.
    recursiveAsync(() => undefined);
    recursiveAsync((self) => {
      // @ts-expect-error A self reference is not callable.
      self('a');
      return string();
    });
  });

  test('accepts synchronous schemas and preserves literal outputs', () => {
    const schema = recursiveAsync(() => literal('leaf'));
    expectTypeOf(schema.async).toEqualTypeOf<true>();
    expectTypeOf<InferInput<typeof schema>>().toEqualTypeOf<'leaf'>();
    expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<'leaf'>();
    expectTypeOf(schema.wrapped).toEqualTypeOf<
      ReturnType<typeof literal<'leaf'>>
    >();
  });
  test('should return schema object', () => {
    const definition = (self: RefAsync) =>
      objectAsync({
        name: string(),
        subcategories: arrayAsync(self),
      });
    interface Category {
      name: string;
      subcategories: Category[];
    }

    expectTypeOf(recursiveAsync(definition)).toEqualTypeOf<
      RecursiveSchemaAsync<
        ReturnType<typeof definition>,
        Category,
        Category,
        ObjectIssue | ArrayIssue | StringIssue
      >
    >();
  });

  describe('should infer correct types', () => {
    const Category = recursiveAsync((Category) =>
      objectAsync({
        name: string(),
        subcategories: arrayAsync(Category),
      })
    );

    interface Category {
      name: string;
      subcategories: Category[];
    }

    test('of input', () => {
      expectTypeOf<InferInput<typeof Category>>().toEqualTypeOf<Category>();
    });

    test('of output', () => {
      expectTypeOf<InferOutput<typeof Category>>().toEqualTypeOf<Category>();
    });

    test('of issue', () => {
      expectTypeOf<InferIssue<typeof Category>>().toEqualTypeOf<
        ObjectIssue | ArrayIssue | StringIssue
      >();
    });
  });

  test('should preserve non-recursive object instances', () => {
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

    const Category = recursiveAsync((self) =>
      objectAsync({
        name: string(),
        subcategories: arrayAsync(self),
        owner: instance(User),
        url: instance(URL),
        error: instance(Error),
        bytes: instance(Uint8Array),
        customMap: instance(CustomMap),
        customSet: instance(CustomSet),
        customArray: instance(CustomArray),
      })
    );

    interface Category {
      name: string;
      subcategories: Category[];
      owner: User;
      url: URL;
      error: Error;
      bytes: InstanceType<typeof Uint8Array>;
      customMap: CustomMap;
      customSet: CustomSet;
      customArray: CustomArray;
    }

    expectTypeOf<InferInput<typeof Category>>().toEqualTypeOf<Category>();
    expectTypeOf<InferOutput<typeof Category>>().toEqualTypeOf<Category>();
  });

  test('should infer recursive collection fields', () => {
    const Category = recursiveAsync((self) =>
      objectAsync({
        name: string(),
        childrenByName: mapAsync(string(), self),
        related: setAsync(self),
      })
    );

    interface Category {
      name: string;
      childrenByName: Map<string, Category>;
      related: Set<Category>;
    }

    expectTypeOf<InferInput<typeof Category>>().toEqualTypeOf<Category>();
    expectTypeOf<InferOutput<typeof Category>>().toEqualTypeOf<Category>();
  });

  test('should infer recursive union issues', () => {
    type Schema = RecursiveSchemaAsync<
      UnionSchemaAsync<
        readonly [
          StringSchema<undefined>,
          ArraySchemaAsync<RefAsync, undefined>,
        ],
        undefined
      >,
      Json,
      Json,
      StringIssue | ArrayIssue | UnionIssue<StringIssue | ArrayIssue>
    >;

    type Json = string | Json[];

    expectTypeOf<InferInput<Schema>>().toEqualTypeOf<Json>();
    expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<Json>();
    expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
      StringIssue | ArrayIssue | UnionIssue<StringIssue | ArrayIssue>
    >();
  });

  test('should resolve async transforms and defaults at every recursive level', () => {
    const Schema = recursiveAsync((self) =>
      objectAsync({
        value: pipeAsync(
          string(),
          transformAsync(async (value) => Number(value))
        ),
        label: optional(string(), 'default'),
        children: arrayAsync(self),
      })
    );

    interface Input {
      value: string;
      label?: string | undefined;
      children: Input[];
    }
    interface Output {
      value: number;
      label: string;
      children: Output[];
    }

    expectTypeOf(Schema).toHaveProperty('~run');
    expectTypeOf<InferInput<typeof Schema>>().toEqualTypeOf<Input>();
    expectTypeOf<InferOutput<typeof Schema>>().toEqualTypeOf<Output>();
    expectTypeOf<{
      value: string;
      children: { value: number; children: [] }[];
    }>().not.toExtend<InferInput<typeof Schema>>();
    expectTypeOf<{
      value: number;
      label: string;
      children: { value: number; children: [] }[];
    }>().not.toExtend<InferOutput<typeof Schema>>();
  });

  test('should resolve nullable records and readonly arrays in async schemas', () => {
    const Schema = recursiveAsync((self) =>
      objectAsync({
        children: recordAsync(string(), nullableAsync(self)),
        siblings: pipeAsync(arrayAsync(self), readonly()),
        pair: tupleAsync([string(), optionalAsync(self)]),
      })
    );

    interface Input {
      children: Record<string, Input | null>;
      siblings: Input[];
      pair: [string, Input | undefined];
    }
    interface Output {
      children: Record<string, Output | null>;
      readonly siblings: readonly Output[];
      pair: [string, Output | undefined];
    }

    expectTypeOf(Schema).toHaveProperty('~run');
    expectTypeOf<InferInput<typeof Schema>>().toEqualTypeOf<Input>();
    expectTypeOf<InferOutput<typeof Schema>>().toEqualTypeOf<Output>();
  });

  test('should resolve recursive async variants inside intersections', () => {
    const Schema = recursiveAsync((self) =>
      intersectAsync([
        objectAsync({ id: number() }),
        variantAsync('kind', [
          objectAsync({ kind: literal('leaf'), value: string() }),
          objectAsync({ kind: literal('branch'), children: arrayAsync(self) }),
        ]),
      ])
    );

    type Node = { id: number } & (
      | { kind: 'leaf'; value: string }
      | { kind: 'branch'; children: Node[] }
    );

    expectTypeOf(Schema).toHaveProperty('~run');
    expectTypeOf<InferInput<typeof Schema>>().toExtend<Node>();
    expectTypeOf<Node>().toExtend<InferInput<typeof Schema>>();
    expectTypeOf<InferOutput<typeof Schema>>().toExtend<Node>();
    expectTypeOf<Node>().toExtend<InferOutput<typeof Schema>>();
    expectTypeOf<{
      id: number;
      kind: 'branch';
      children: { id: number; kind: 'leaf'; value: number }[];
    }>().not.toExtend<InferOutput<typeof Schema>>();
  });

  test('should support schema interface', () => {
    type Schema = RecursiveSchemaAsync<
      ObjectSchemaAsync<
        {
          name: StringSchema<undefined>;
          subcategories: ArraySchemaAsync<RefAsync, undefined>;
        },
        undefined
      >,
      Input,
      Input,
      ObjectIssue | StringIssue | ArrayIssue
    >;

    interface Input {
      name: string;
      subcategories: Input[];
    }

    expectTypeOf<InferInput<Schema>>().toEqualTypeOf<Input>();
    expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<Input>();
    expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
      ObjectIssue | StringIssue | ArrayIssue
    >();
  });
});
