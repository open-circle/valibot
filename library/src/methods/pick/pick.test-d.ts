import { describe, expectTypeOf, test } from 'vitest';
import {
  boolean,
  type BooleanIssue,
  type BooleanSchema,
  looseObject,
  looseObjectAsync,
  type LooseObjectIssue,
  type LooseObjectSchema,
  type LooseObjectSchemaAsync,
  number,
  type NumberIssue,
  type NumberSchema,
  object,
  objectAsync,
  type ObjectIssue,
  type ObjectSchema,
  type ObjectSchemaAsync,
  objectWithRest,
  objectWithRestAsync,
  type ObjectWithRestIssue,
  type ObjectWithRestSchema,
  type ObjectWithRestSchemaAsync,
  strictObject,
  strictObjectAsync,
  type StrictObjectIssue,
  type StrictObjectSchema,
  type StrictObjectSchemaAsync,
  string,
  type StringIssue,
  type StringSchema,
} from '../../schemas/index.ts';
import type { InferInput, InferIssue, InferOutput } from '../../types/index.ts';
import { pick, type SchemaWithPick } from './pick.ts';

describe('pick', () => {
  describe('object', () => {
    type Schema = SchemaWithPick<
      ObjectSchema<
        {
          readonly key1: StringSchema<undefined>;
          readonly key2: NumberSchema<undefined>;
          readonly key3: StringSchema<undefined>;
          readonly key4: NumberSchema<undefined>;
        },
        undefined
      >,
      ['key1', 'key3']
    >;

    test('should return schema object', () => {
      expectTypeOf(
        pick(
          object({
            key1: string(),
            key2: number(),
            key3: string(),
            key4: number(),
          }),
          ['key1', 'key3']
        )
      ).toEqualTypeOf<Schema>();
    });

    describe('should infer correct types', () => {
      test('of input', () => {
        expectTypeOf<InferInput<Schema>>().toEqualTypeOf<{
          key1: string;
          key3: string;
        }>();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<{
          key1: string;
          key3: string;
        }>();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          ObjectIssue | StringIssue
        >();
      });
    });
  });

  describe('looseObject', () => {
    type Schema = SchemaWithPick<
      LooseObjectSchema<
        {
          readonly key1: StringSchema<undefined>;
          readonly key2: NumberSchema<undefined>;
          readonly key3: StringSchema<undefined>;
          readonly key4: NumberSchema<undefined>;
        },
        undefined
      >,
      ['key1', 'key3']
    >;

    test('should return schema object', () => {
      expectTypeOf(
        pick(
          looseObject({
            key1: string(),
            key2: number(),
            key3: string(),
            key4: number(),
          }),
          ['key1', 'key3']
        )
      ).toEqualTypeOf<Schema>();
    });

    describe('should infer correct types', () => {
      test('of input', () => {
        expectTypeOf<InferInput<Schema>>().toEqualTypeOf<
          { key1: string; key3: string } & { [key: string]: unknown }
        >();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
          { key1: string; key3: string } & { [key: string]: unknown }
        >();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          LooseObjectIssue | StringIssue
        >();
      });
    });
  });

  describe('strictObject', () => {
    type Schema = SchemaWithPick<
      StrictObjectSchema<
        {
          readonly key1: StringSchema<undefined>;
          readonly key2: NumberSchema<undefined>;
          readonly key3: StringSchema<undefined>;
          readonly key4: NumberSchema<undefined>;
        },
        undefined
      >,
      ['key1', 'key3']
    >;

    test('should return schema object', () => {
      expectTypeOf(
        pick(
          strictObject({
            key1: string(),
            key2: number(),
            key3: string(),
            key4: number(),
          }),
          ['key1', 'key3']
        )
      ).toEqualTypeOf<Schema>();
    });

    describe('should infer correct types', () => {
      test('of input', () => {
        expectTypeOf<InferInput<Schema>>().toEqualTypeOf<{
          key1: string;
          key3: string;
        }>();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<{
          key1: string;
          key3: string;
        }>();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          StrictObjectIssue | StringIssue
        >();
      });
    });
  });

  describe('objectWithRest', () => {
    type Schema = SchemaWithPick<
      ObjectWithRestSchema<
        {
          readonly key1: StringSchema<undefined>;
          readonly key2: NumberSchema<undefined>;
          readonly key3: StringSchema<undefined>;
          readonly key4: NumberSchema<undefined>;
        },
        BooleanSchema<undefined>,
        undefined
      >,
      ['key2', 'key3']
    >;

    test('should return schema object', () => {
      expectTypeOf(
        pick(
          objectWithRest(
            { key1: string(), key2: number(), key3: string(), key4: number() },
            boolean()
          ),
          ['key2', 'key3']
        )
      ).toEqualTypeOf<Schema>();
    });

    describe('should infer correct types', () => {
      test('of input', () => {
        expectTypeOf<InferInput<Schema>>().toEqualTypeOf<
          { key2: number; key3: string } & { [key: string]: boolean }
        >();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
          { key2: number; key3: string } & { [key: string]: boolean }
        >();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          ObjectWithRestIssue | NumberIssue | StringIssue | BooleanIssue
        >();
      });
    });
  });

  describe('objectAsync', () => {
    type Schema = SchemaWithPick<
      ObjectSchemaAsync<
        {
          readonly key1: StringSchema<undefined>;
          readonly key2: NumberSchema<undefined>;
          readonly key3: StringSchema<undefined>;
          readonly key4: NumberSchema<undefined>;
        },
        undefined
      >,
      ['key1', 'key3']
    >;

    test('should return schema object', () => {
      expectTypeOf(
        pick(
          objectAsync({
            key1: string(),
            key2: number(),
            key3: string(),
            key4: number(),
          }),
          ['key1', 'key3']
        )
      ).toEqualTypeOf<Schema>();
    });

    describe('should infer correct types', () => {
      test('of input', () => {
        expectTypeOf<InferInput<Schema>>().toEqualTypeOf<{
          key1: string;
          key3: string;
        }>();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<{
          key1: string;
          key3: string;
        }>();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          ObjectIssue | StringIssue
        >();
      });
    });
  });

  describe('looseObjectAsync', () => {
    type Schema = SchemaWithPick<
      LooseObjectSchemaAsync<
        {
          readonly key1: StringSchema<undefined>;
          readonly key2: NumberSchema<undefined>;
          readonly key3: StringSchema<undefined>;
          readonly key4: NumberSchema<undefined>;
        },
        undefined
      >,
      ['key1', 'key3']
    >;

    test('should return schema object', () => {
      expectTypeOf(
        pick(
          looseObjectAsync({
            key1: string(),
            key2: number(),
            key3: string(),
            key4: number(),
          }),
          ['key1', 'key3']
        )
      ).toEqualTypeOf<Schema>();
    });

    describe('should infer correct types', () => {
      test('of input', () => {
        expectTypeOf<InferInput<Schema>>().toEqualTypeOf<
          { key1: string; key3: string } & { [key: string]: unknown }
        >();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
          { key1: string; key3: string } & { [key: string]: unknown }
        >();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          LooseObjectIssue | StringIssue
        >();
      });
    });
  });

  describe('strictObjectAsync', () => {
    type Schema = SchemaWithPick<
      StrictObjectSchemaAsync<
        {
          readonly key1: StringSchema<undefined>;
          readonly key2: NumberSchema<undefined>;
          readonly key3: StringSchema<undefined>;
          readonly key4: NumberSchema<undefined>;
        },
        undefined
      >,
      ['key1', 'key3']
    >;

    test('should return schema object', () => {
      expectTypeOf(
        pick(
          strictObjectAsync({
            key1: string(),
            key2: number(),
            key3: string(),
            key4: number(),
          }),
          ['key1', 'key3']
        )
      ).toEqualTypeOf<Schema>();
    });

    describe('should infer correct types', () => {
      test('of input', () => {
        expectTypeOf<InferInput<Schema>>().toEqualTypeOf<{
          key1: string;
          key3: string;
        }>();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<{
          key1: string;
          key3: string;
        }>();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          StrictObjectIssue | StringIssue
        >();
      });
    });
  });

  describe('objectWithRestAsync', () => {
    type Schema = SchemaWithPick<
      ObjectWithRestSchemaAsync<
        {
          readonly key1: StringSchema<undefined>;
          readonly key2: NumberSchema<undefined>;
          readonly key3: StringSchema<undefined>;
          readonly key4: NumberSchema<undefined>;
        },
        BooleanSchema<undefined>,
        undefined
      >,
      ['key2', 'key3']
    >;

    test('should return schema object', () => {
      expectTypeOf(
        pick(
          objectWithRestAsync(
            { key1: string(), key2: number(), key3: string(), key4: number() },
            boolean()
          ),
          ['key2', 'key3']
        )
      ).toEqualTypeOf<Schema>();
    });

    describe('should infer correct types', () => {
      test('of input', () => {
        expectTypeOf<InferInput<Schema>>().toEqualTypeOf<
          { key2: number; key3: string } & { [key: string]: boolean }
        >();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
          { key2: number; key3: string } & { [key: string]: boolean }
        >();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          ObjectWithRestIssue | NumberIssue | StringIssue | BooleanIssue
        >();
      });
    });
  });
});
