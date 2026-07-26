import { describe, expectTypeOf, test } from 'vitest';
import {
  boolean,
  type BooleanSchema,
  number,
  type NumberSchema,
  object,
  objectAsync,
  string,
  type StringSchema,
} from '../../schemas/index.ts';
import { entriesFromObjects } from './entriesFromObjects.ts';

describe('entriesFromObjects', () => {
  describe('should return objects entries', () => {
    const schema1 = object({ foo: string(), bar: string() });
    const schema2 = objectAsync({ baz: number(), qux: number() });
    const schema3 = object({ foo: boolean(), baz: boolean() });

    test('for missing schema', () => {
      expectTypeOf(
        // @ts-expect-error
        entriesFromObjects([])
      ).toEqualTypeOf<never>();
    });

    test('for single schema', () => {
      expectTypeOf(entriesFromObjects([schema1])).toEqualTypeOf<{
        readonly foo: StringSchema<undefined>;
        readonly bar: StringSchema<undefined>;
      }>();
    });

    test('for multiple schemes', () => {
      expectTypeOf(entriesFromObjects([schema1, schema2])).toEqualTypeOf<{
        readonly foo: StringSchema<undefined>;
        readonly bar: StringSchema<undefined>;
        readonly baz: NumberSchema<undefined>;
        readonly qux: NumberSchema<undefined>;
      }>();
    });

    test('with overwrites', () => {
      expectTypeOf(
        entriesFromObjects([schema1, schema2, schema3])
      ).toEqualTypeOf<{
        readonly bar: StringSchema<undefined>;
        readonly qux: NumberSchema<undefined>;
        readonly foo: BooleanSchema<undefined>;
        readonly baz: BooleanSchema<undefined>;
      }>();
    });

    test('for empty entries', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      expectTypeOf(entriesFromObjects([object({})])).toEqualTypeOf<{}>();
      expectTypeOf(
        entriesFromObjects([object({}), objectAsync({})])
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      ).toEqualTypeOf<{}>();
    });
  });
});
