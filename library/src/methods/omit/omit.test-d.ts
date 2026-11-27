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
import { omit, type SchemaWithOmit } from './omit.ts';

describe('omit', () => {
  describe('object', () => {
    type Schema = SchemaWithOmit<
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
        omit(
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
          key2: number;
          key4: number;
        }>();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<{
          key2: number;
          key4: number;
        }>();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          ObjectIssue | NumberIssue
        >();
      });
    });
  });

  describe('looseObject', () => {
    type Schema = SchemaWithOmit<
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
        omit(
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
          { key2: number; key4: number } & { [key: string]: unknown }
        >();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
          { key2: number; key4: number } & { [key: string]: unknown }
        >();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          LooseObjectIssue | NumberIssue
        >();
      });
    });
  });

  describe('strictObject', () => {
    type Schema = SchemaWithOmit<
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
        omit(
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
          key2: number;
          key4: number;
        }>();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<{
          key2: number;
          key4: number;
        }>();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          StrictObjectIssue | NumberIssue
        >();
      });
    });
  });

  describe('objectWithRest', () => {
    type Schema = SchemaWithOmit<
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
        omit(
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
          { key1: string; key4: number } & { [key: string]: boolean }
        >();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
          { key1: string; key4: number } & { [key: string]: boolean }
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
    type Schema = SchemaWithOmit<
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
        omit(
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
          key2: number;
          key4: number;
        }>();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<{
          key2: number;
          key4: number;
        }>();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          ObjectIssue | NumberIssue
        >();
      });
    });
  });

  describe('looseObjectAsync', () => {
    type Schema = SchemaWithOmit<
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
        omit(
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
          { key2: number; key4: number } & { [key: string]: unknown }
        >();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
          { key2: number; key4: number } & { [key: string]: unknown }
        >();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          LooseObjectIssue | NumberIssue
        >();
      });
    });
  });

  describe('strictObjectAsync', () => {
    type Schema = SchemaWithOmit<
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
        omit(
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
          key2: number;
          key4: number;
        }>();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<{
          key2: number;
          key4: number;
        }>();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          StrictObjectIssue | NumberIssue
        >();
      });
    });
  });

  describe('objectWithRestAsync', () => {
    type Schema = SchemaWithOmit<
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
        omit(
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
          { key1: string; key4: number } & { [key: string]: boolean }
        >();
      });

      test('of output', () => {
        expectTypeOf<InferOutput<Schema>>().toEqualTypeOf<
          { key1: string; key4: number } & { [key: string]: boolean }
        >();
      });

      test('of issue', () => {
        expectTypeOf<InferIssue<Schema>>().toEqualTypeOf<
          ObjectWithRestIssue | StringIssue | NumberIssue | BooleanIssue
        >();
      });
    });
  });
});
