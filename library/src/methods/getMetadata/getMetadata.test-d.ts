import { describe, expectTypeOf, test } from 'vitest';
import { email, metadata, startsWith } from '../../actions/index.ts';
import { string } from '../../schemas/index.ts';
import type { GenericSchema } from '../../types/schema.ts';
import { pipe } from '../pipe/index.ts';
import { getMetadata } from './getMetadata.ts';

describe('getMetadata', () => {
  test('should return generic metadata', () => {
    const genericSchema = string() as GenericSchema;
    expectTypeOf(getMetadata(genericSchema)).toEqualTypeOf<
      Record<string, unknown>
    >();
  });

  describe('should return empty object', () => {
    test('for schema without pipe', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      expectTypeOf(getMetadata(string())).toEqualTypeOf<{}>();
    });

    test('for schema with empty pipe', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      expectTypeOf(getMetadata(pipe(string()))).toEqualTypeOf<{}>();
    });

    test('for schema with no metadata in pipe', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      expectTypeOf(getMetadata(pipe(string(), email()))).toEqualTypeOf<{}>();
    });
  });

  describe('should return single metadata', () => {
    test('for simple schema with metadata', () => {
      expectTypeOf(
        getMetadata(pipe(string(), metadata({ key: 'foo' })))
      ).toEqualTypeOf<{ readonly key: 'foo' }>();
    });

    test('for schema with metadata in nested pipe', () => {
      expectTypeOf(
        getMetadata(pipe(pipe(string(), metadata({ key: 'foo' })), email()))
      ).toEqualTypeOf<{ readonly key: 'foo' }>();
    });

    test('for schema with metadata in deeply nested pipe', () => {
      expectTypeOf(
        getMetadata(
          pipe(
            string(),
            pipe(pipe(string(), metadata({ key: 'foo' })), email()),
            startsWith('foo')
          )
        )
      ).toEqualTypeOf<{ readonly key: 'foo' }>();
    });
  });

  describe('should return merged metadata', () => {
    test('for simple schema with multiple metadata', () => {
      expectTypeOf(
        getMetadata(
          pipe(
            string(),
            metadata({ key1: 'foo', key2: 'bar' }),
            metadata({ key2: 'baz', key3: 'qux' })
          )
        )
      ).toEqualTypeOf<{
        readonly key1: 'foo';
        readonly key2: 'baz';
        readonly key3: 'qux';
      }>();
    });

    test('for schema with multiple metadata in nested pipe', () => {
      expectTypeOf(
        getMetadata(
          pipe(
            pipe(string(), metadata({ key1: 'foo', key2: 'bar' })),
            metadata({ key2: 'baz', key3: 'qux' }),
            email()
          )
        )
      ).toEqualTypeOf<{
        readonly key1: 'foo';
        readonly key2: 'baz';
        readonly key3: 'qux';
      }>();
    });

    test('for schema with multiple metadata in deeply nested pipe', () => {
      expectTypeOf(
        getMetadata(
          pipe(
            string(),
            pipe(
              pipe(string(), metadata({ key1: 'foo', key2: 'bar' })),
              metadata({ key2: 'baz' }),
              email()
            ),
            metadata({ key3: 'qux' }),
            startsWith('foo')
          )
        )
      ).toEqualTypeOf<{
        readonly key1: 'foo';
        readonly key2: 'baz';
        readonly key3: 'qux';
      }>();
    });
  });
});
