import { describe, expect, test } from 'vitest';
import { email, examples, startsWith } from '../../actions/index.ts';
import { string } from '../../schemas/index.ts';
import { pipe, pipeAsync } from '../pipe/index.ts';
import { getExamples } from './getExamples.ts';

describe('getExamples', () => {
  describe('should return empty array', () => {
    test('for schema without pipe', () => {
      expect(getExamples(string())).toStrictEqual([]);
    });

    test('for schema with empty pipe', () => {
      expect(getExamples(pipe(string()))).toStrictEqual([]);
    });

    test('for schema with no examples in pipe', () => {
      expect(getExamples(pipe(string(), email()))).toStrictEqual([]);
    });
  });

  describe('should return single examples', () => {
    test('for simple schema with examples', () => {
      expect(
        getExamples(pipe(string(), examples(['foo', 'bar'])))
      ).toStrictEqual(['foo', 'bar']);
    });

    test('for schema with examples in nested pipe', () => {
      expect(
        getExamples(pipe(pipe(string(), examples(['foo', 'bar'])), email()))
      ).toStrictEqual(['foo', 'bar']);
    });

    test('for schema with examples in deeply nested pipe', () => {
      expect(
        getExamples(
          pipe(
            string(),
            pipe(pipe(string(), examples(['foo', 'bar'])), email()),
            startsWith('foo')
          )
        )
      ).toStrictEqual(['foo', 'bar']);
    });

    test('for schema with examples in async pipe', () => {
      expect(
        getExamples(pipeAsync(string(), examples(['foo', 'bar'])))
      ).toStrictEqual(['foo', 'bar']);
    });
  });

  describe('should return merged examples', () => {
    test('for simple schema with multiple examples', () => {
      expect(
        getExamples(
          pipe(string(), examples(['foo', 'bar']), examples(['baz', 'qux']))
        )
      ).toStrictEqual(['foo', 'bar', 'baz', 'qux']);
    });

    test('for schema with multiple examples in nested pipe', () => {
      expect(
        getExamples(
          pipe(
            pipe(string(), examples(['foo', 'bar'])),
            examples(['baz', 'qux'])
          )
        )
      ).toStrictEqual(['foo', 'bar', 'baz', 'qux']);
    });

    test('for schema with multiple examples in deeply nested pipe', () => {
      expect(
        getExamples(
          pipe(
            string(),
            pipe(pipe(string(), examples(['foo', 'bar'])), email()),
            examples(['baz', 'qux'])
          )
        )
      ).toStrictEqual(['foo', 'bar', 'baz', 'qux']);
    });
  });
});
