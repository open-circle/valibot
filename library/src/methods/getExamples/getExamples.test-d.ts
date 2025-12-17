import { describe, expectTypeOf, test } from 'vitest';
import { email, examples, startsWith } from '../../actions/index.ts';
import { string } from '../../schemas/index.ts';
import type { GenericSchema } from '../../types/index.ts';
import { pipe, pipeAsync } from '../pipe/index.ts';
import { getExamples } from './getExamples.ts';

describe('getExamples', () => {
  test('should return generic examples', () => {
    const genericSchema = string() as GenericSchema;
    expectTypeOf(getExamples(genericSchema)).toEqualTypeOf<[]>();
  });

  describe('should return empty array', () => {
    test('for schema without pipe', () => {
      expectTypeOf(getExamples(string())).toEqualTypeOf<[]>();
    });

    test('for schema with empty pipe', () => {
      expectTypeOf(getExamples(pipe(string()))).toEqualTypeOf<readonly []>();
    });

    test('for schema with no examples in pipe', () => {
      expectTypeOf(getExamples(pipe(string(), email()))).toEqualTypeOf<
        readonly []
      >();
    });
  });

  describe('should return single examples', () => {
    test('for simple schema with examples', () => {
      expectTypeOf(
        getExamples(pipe(string(), examples(['foo', 'bar'])))
      ).toEqualTypeOf<readonly ['foo', 'bar']>();
    });

    test('for schema with examples in nested pipe', () => {
      expectTypeOf(
        getExamples(pipe(pipe(string(), examples(['foo', 'bar'])), email()))
      ).toEqualTypeOf<readonly ['foo', 'bar']>();
    });

    test('for schema with examples in deeply nested pipe', () => {
      expectTypeOf(
        getExamples(
          pipe(
            string(),
            pipe(pipe(string(), examples(['foo', 'bar'])), email()),
            startsWith('foo')
          )
        )
      ).toEqualTypeOf<readonly ['foo', 'bar']>();
    });

    test('for schema with examples in async pipe', () => {
      expectTypeOf(
        getExamples(pipeAsync(string(), examples(['foo', 'bar'])))
      ).toEqualTypeOf<readonly ['foo', 'bar']>();
    });
  });

  describe('should return merged examples', () => {
    test('for simple schema with multiple examples', () => {
      expectTypeOf(
        getExamples(
          pipe(string(), examples(['foo', 'bar']), examples(['baz', 'qux']))
        )
      ).toEqualTypeOf<readonly ['foo', 'bar', 'baz', 'qux']>();
    });

    test('for schema with multiple examples in nested pipe', () => {
      expectTypeOf(
        getExamples(
          pipe(
            pipe(string(), examples(['foo', 'bar'])),
            examples(['baz', 'qux'])
          )
        )
      ).toEqualTypeOf<readonly ['foo', 'bar', 'baz', 'qux']>();
    });

    test('for schema with multiple examples in deeply nested pipe', () => {
      expectTypeOf(
        getExamples(
          pipe(
            string(),
            pipe(pipe(string(), examples(['foo', 'bar'])), email()),
            examples(['baz', 'qux'])
          )
        )
      ).toEqualTypeOf<readonly ['foo', 'bar', 'baz', 'qux']>();
    });
  });
});
