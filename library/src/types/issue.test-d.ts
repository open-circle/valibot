import { describe, expectTypeOf, test } from 'vitest';
import { check, checkAsync, minLength } from '../actions/index.ts';
import { pipe, pipeAsync } from '../methods/index.ts';
import {
  array,
  arrayAsync,
  exactOptional,
  intersect,
  lazy,
  lazyAsync,
  literal,
  looseObject,
  map,
  nonNullable,
  nullable,
  number,
  object,
  objectAsync,
  objectWithRest,
  optional,
  picklist,
  record,
  strictObject,
  strictTuple,
  string,
  tuple,
  tupleWithRest,
  union,
  unionAsync,
  variant,
} from '../schemas/index.ts';
import type { IssueDotPath } from './issue.ts';

describe('IssueDotPath', () => {
  test('should return never for schemas without nested paths', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = pipe(string(), minLength(1));
    expectTypeOf<IssueDotPath<typeof schema>>().toEqualTypeOf<never>();
  });

  test('should return object and array paths', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = object({
      key1: array(object({ key2: string() })),
      key3: looseObject({ key4: string() }),
      key5: strictObject({ key6: string() }),
      key7: objectWithRest({ key8: string() }, number()),
    });
    expectTypeOf<IssueDotPath<typeof schema>>().toEqualTypeOf<
      | 'key1'
      | `key1.${number}`
      | `key1.${number}.key2`
      | 'key3'
      | 'key3.key4'
      | 'key5'
      | 'key5.key6'
      | 'key7'
      | `key7.${string}`
    >();
  });

  test('should return tuple paths', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = object({
      key1: tuple([string(), object({ key2: string() })]),
      key3: strictTuple([string()]),
      key4: tupleWithRest([string()], object({ key5: string() })),
    });
    expectTypeOf<IssueDotPath<typeof schema>>().toEqualTypeOf<
      | 'key1'
      | 'key1.0'
      | 'key1.1'
      | 'key1.1.key2'
      | 'key3'
      | 'key3.0'
      | 'key4'
      | `key4.${number}`
      | `key4.${number}.key5`
    >();
  });

  test('should return union, intersect and variant paths', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = object({
      key1: union([object({ key2: string() }), array(string())]),
      key3: intersect([object({ key4: string() }), object({ key5: string() })]),
      key6: variant('type', [
        object({ type: literal('a'), key7: string() }),
        object({ type: literal('b'), key8: number() }),
      ]),
    });
    expectTypeOf<IssueDotPath<typeof schema>>().toEqualTypeOf<
      | 'key1'
      | 'key1.key2'
      | `key1.${number}`
      | 'key3'
      | 'key3.key4'
      | 'key3.key5'
      | 'key6'
      | 'key6.type'
      | 'key6.key7'
      | 'key6.key8'
    >();
  });

  test('should return map and record paths', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = object({
      key1: map(string(), object({ key2: string() })),
      key3: map(number(), string()),
      key4: record(picklist(['foo', 'bar']), object({ key5: string() })),
    });
    expectTypeOf<IssueDotPath<typeof schema>>().toEqualTypeOf<
      | 'key1'
      | `key1.${string}`
      | 'key3'
      | `key3.${number}`
      | 'key4'
      | 'key4.foo'
      | 'key4.bar'
      | 'key4.foo.key5'
      | 'key4.bar.key5'
    >();
  });

  test('should return wrapped, lazy and piped paths', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = object({
      key1: optional(object({ key2: string() })),
      key3: exactOptional(object({ key4: string() })),
      key5: nonNullable(nullable(object({ key6: string() }))),
      key7: lazy(() => object({ key8: string() })),
      key9: pipe(
        object({ key10: string() }),
        check(() => true)
      ),
    });
    expectTypeOf<IssueDotPath<typeof schema>>().toEqualTypeOf<
      | 'key1'
      | 'key1.key2'
      | 'key3'
      | 'key3.key4'
      | 'key5'
      | 'key5.key6'
      | 'key7'
      | 'key7.key8'
      | 'key9'
      | 'key9.key10'
    >();
  });

  test('should return async paths', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = objectAsync({
      key1: arrayAsync(
        objectAsync({
          key2: pipeAsync(
            string(),
            checkAsync(async () => true)
          ),
        })
      ),
      key3: unionAsync([objectAsync({ key4: string() }), string()]),
      key5: lazyAsync(() => objectAsync({ key6: string() })),
    });
    expectTypeOf<IssueDotPath<typeof schema>>().toEqualTypeOf<
      | 'key1'
      | `key1.${number}`
      | `key1.${number}.key2`
      | 'key3'
      | 'key3.key4'
      | 'key5'
      | 'key5.key6'
    >();
  });
});
