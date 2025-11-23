import { describe, expect, test } from 'vitest';
import { examples } from '../../actions/index.ts';
import { string } from '../../schemas/index.ts';
import { pipe, pipeAsync } from '../pipe/index.ts';
import { getExamples } from './getExamples.ts';

describe('getExamples', () => {
  test('should return empty array', () => {
    expect(getExamples(string())).toStrictEqual([]);
  });

  test('should return examples', () => {
    expect(getExamples(pipe(string(), examples(['foo', 'bar'])))).toStrictEqual(
      ['foo', 'bar']
    );
  });

  test('should return nested examples', () => {
    expect(
      getExamples(
        pipe(pipe(string(), examples(['foo', 'bar'])), examples(['baz', 'qux']))
      )
    ).toStrictEqual(['foo', 'bar', 'baz', 'qux']);
  });

  test('should return examples from async schema', () => {
    expect(
      getExamples(pipeAsync(string(), examples(['foo', 'bar'])))
    ).toStrictEqual(['foo', 'bar']);
  });
});
