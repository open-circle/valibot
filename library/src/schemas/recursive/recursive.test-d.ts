import { describe, expectTypeOf, test } from 'vitest';
import { transform } from '../../actions/index.ts';
import { pipe } from '../../methods/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { array, type ArrayIssue, type ArraySchema } from '../array/index.ts';
import { instance } from '../instance/index.ts';
import { map } from '../map/index.ts';
import {
  object,
  type ObjectIssue,
  type ObjectSchema,
} from '../object/index.ts';
import { optional } from '../optional/index.ts';
import { set } from '../set/index.ts';
import {
  string,
  type StringIssue,
  type StringSchema,
} from '../string/index.ts';
import { tuple } from '../tuple/index.ts';
import { union, type UnionIssue, type UnionSchema } from '../union/index.ts';
import {
  type GenericRecursiveSchema,
  recursive,
  type RecursiveSchema,
  type RecursiveSelfSchema,
} from './recursive.ts';

describe('recursive', () => {
  test('should return schema object', () => {
    const getter = (self: RecursiveSelfSchema) =>
      object({
        name: string(),
        subcategories: array(self),
      });
    expectTypeOf(recursive(getter)).toEqualTypeOf<
      RecursiveSchema<ReturnType<typeof getter>>
    >();
  });

  describe('should infer correct types', () => {
    const Category = recursive((Category) =>
      object({
        name: string(),
        subcategories: array(Category),
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

  test('should infer optional recursive fields', () => {
    const Category = recursive((self) =>
      object({
        name: string(),
        parent: optional(self),
      })
    );

    interface Category {
      name: string;
      parent?: Category | undefined;
    }

    expectTypeOf<InferInput<typeof Category>>().toEqualTypeOf<Category>();
    expectTypeOf<InferOutput<typeof Category>>().toEqualTypeOf<Category>();
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

    const Category = recursive((self) =>
      object({
        name: string(),
        subcategories: array(self),
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
    const Category = recursive((self) =>
      object({
        name: string(),
        childrenByName: map(string(), self),
        related: set(self),
        pair: tuple([string(), self]),
      })
    );

    interface Category {
      name: string;
      childrenByName: Map<string, Category>;
      related: Set<Category>;
      pair: [string, Category];
    }

    expectTypeOf<InferInput<typeof Category>>().toEqualTypeOf<Category>();
    expectTypeOf<InferOutput<typeof Category>>().toEqualTypeOf<Category>();
  });

  test('should infer nested recursive schema types', () => {
    const Category = recursive((category) =>
      object({
        name: string(),
        subcategories: array(category),
        tags: array(
          recursive((tag) =>
            object({
              name: string(),
              aliases: array(tag),
            })
          )
        ),
      })
    );

    interface Tag {
      name: string;
      aliases: Tag[];
    }

    interface Category {
      name: string;
      subcategories: Category[];
      tags: Tag[];
    }

    expectTypeOf<InferInput<typeof Category>>().toEqualTypeOf<Category>();
    expectTypeOf<InferOutput<typeof Category>>().toEqualTypeOf<Category>();
  });

  test('should infer recursive union issues', () => {
    type Schema = RecursiveSchema<
      UnionSchema<
        readonly [
          StringSchema<undefined>,
          ArraySchema<RecursiveSelfSchema, undefined>,
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

  test('should infer recursive union values', () => {
    const Json = recursive((self) => union([string(), array(self)]));

    type Json = string | Json[];

    expectTypeOf<InferInput<typeof Json>>().toEqualTypeOf<Json>();
    expectTypeOf<InferOutput<typeof Json>>().toEqualTypeOf<Json>();
    expectTypeOf<InferIssue<typeof Json>>().toEqualTypeOf<
      StringIssue | ArrayIssue | UnionIssue<StringIssue | ArrayIssue>
    >();
  });

  test('should infer recursive output in pipes', () => {
    const Category = pipe(
      recursive((self) =>
        object({
          name: string(),
          subcategories: array(self),
        })
      ),
      transform((category) => ({ ...category, label: category.name }))
    );

    interface Subcategory {
      name: string;
      subcategories: Subcategory[];
    }

    interface Category extends Subcategory {
      label: string;
    }

    expectTypeOf<InferOutput<typeof Category>>().toEqualTypeOf<Category>();
  });

  test('should support schema interface', () => {
    type Schema = RecursiveSchema<
      ObjectSchema<
        {
          name: StringSchema<undefined>;
          subcategories: ArraySchema<RecursiveSelfSchema, undefined>;
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

  test('should support generic schema interface', () => {
    const Category = recursive((self) =>
      object({
        name: string(),
        subcategories: array(self),
      })
    );

    expectTypeOf(Category).toExtend<GenericRecursiveSchema>();
  });
});
