import { describe, expectTypeOf, test } from 'vitest';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import {
  arrayAsync,
  type ArrayIssue,
  type ArraySchemaAsync,
} from '../array/index.ts';
import { instance } from '../instance/index.ts';
import { mapAsync } from '../map/index.ts';
import {
  objectAsync,
  type ObjectIssue,
  type ObjectSchemaAsync,
} from '../object/index.ts';
import { setAsync } from '../set/index.ts';
import {
  string,
  type StringIssue,
  type StringSchema,
} from '../string/index.ts';
import type { UnionIssue, UnionSchemaAsync } from '../union/index.ts';
import {
  recursiveAsync,
  type RecursiveSchemaAsync,
  type RecursiveSelfSchemaAsync,
} from './recursiveAsync.ts';

describe('recursiveAsync', () => {
  test('should return schema object', () => {
    const getter = (self: RecursiveSelfSchemaAsync) =>
      objectAsync({
        name: string(),
        subcategories: arrayAsync(self),
      });
    expectTypeOf(recursiveAsync(getter)).toEqualTypeOf<
      RecursiveSchemaAsync<ReturnType<typeof getter>>
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
          ArraySchemaAsync<RecursiveSelfSchemaAsync, undefined>,
        ],
        undefined
      >
    >;

    type Json = string | Json[];

    expectTypeOf<InferInput<Schema>>().toEqualTypeOf<Json>();
    expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<Json>();
    expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
      StringIssue | ArrayIssue | UnionIssue<StringIssue | ArrayIssue>
    >();
  });

  test('should support schema interface', () => {
    type Schema = RecursiveSchemaAsync<
      ObjectSchemaAsync<
        {
          name: StringSchema<undefined>;
          subcategories: ArraySchemaAsync<RecursiveSelfSchemaAsync, undefined>;
        },
        undefined
      >
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
