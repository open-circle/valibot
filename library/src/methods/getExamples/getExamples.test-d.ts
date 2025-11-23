import { describe, expectTypeOf, test } from 'vitest';
import { examples } from '../../actions/index.ts';
import { string } from '../../schemas/index.ts';
import { pipe, pipeAsync } from '../pipe/index.ts';
import { getExamples } from './getExamples.ts';

describe('getExamples', () => {
  test('should return empty array', () => {
    expectTypeOf(getExamples(string())).toEqualTypeOf<[]>();
  });

  test('should return examples', () => {
    expectTypeOf(
      getExamples(pipe(string(), examples(['foo', 'bar'])))
    ).toEqualTypeOf<readonly ['foo', 'bar']>();
  });

  test('should return nested examples', () => {
    expectTypeOf(
      getExamples(
        pipe(pipe(string(), examples(['foo', 'bar'])), examples(['baz', 'qux']))
      )
    ).toEqualTypeOf<readonly ['foo', 'bar', 'baz', 'qux']>();
  });

  test('should return examples from async schema', () => {
    expectTypeOf(
      getExamples(pipeAsync(string(), examples(['foo', 'bar'])))
    ).toEqualTypeOf<readonly ['foo', 'bar']>();
  });
});
