import { describe, expect, test } from 'vitest';
import { email, metadata, startsWith } from '../../actions/index.ts';
import { string } from '../../schemas/index.ts';
import { pipe } from '../pipe/index.ts';
import { getMetadata } from './getMetadata.ts';

describe('getMetadata', () => {
  describe('should return empty object', () => {
    test('for schema without pipe', () => {
      expect(getMetadata(string())).toStrictEqual({});
    });

    test('for schema with empty pipe', () => {
      expect(getMetadata(pipe(string()))).toStrictEqual({});
    });

    test('for schema with no metadata in pipe', () => {
      expect(getMetadata(pipe(string(), email()))).toStrictEqual({});
    });
  });

  describe('should return single metadata', () => {
    test('for simple schema with metadata', () => {
      expect(
        getMetadata(pipe(string(), metadata({ key: 'foo' })))
      ).toStrictEqual({ key: 'foo' });
    });

    test('for schema with metadata in nested pipe', () => {
      expect(
        getMetadata(pipe(pipe(string(), metadata({ key: 'foo' })), email()))
      ).toStrictEqual({ key: 'foo' });
    });

    test('for schema with metadata in deeply nested pipe', () => {
      expect(
        getMetadata(
          pipe(
            string(),
            pipe(pipe(string(), metadata({ key: 'foo' })), email()),
            startsWith('foo')
          )
        )
      ).toStrictEqual({ key: 'foo' });
    });
  });

  describe('should return merged metadata', () => {
    test('for simple schema with multiple metadata', () => {
      expect(
        getMetadata(
          pipe(
            string(),
            metadata({ key1: 'foo', key2: 'bar' }),
            metadata({ key2: 'baz', key3: 'qux' })
          )
        )
      ).toStrictEqual({
        key1: 'foo',
        key2: 'baz',
        key3: 'qux',
      });
    });

    test('for schema with multiple metadata in nested pipe', () => {
      expect(
        getMetadata(
          pipe(
            pipe(string(), metadata({ key1: 'foo', key2: 'bar' })),
            metadata({ key2: 'baz', key3: 'qux' }),
            email()
          )
        )
      ).toStrictEqual({
        key1: 'foo',
        key2: 'baz',
        key3: 'qux',
      });
    });

    test('for schema with multiple metadata in deeply nested pipe', () => {
      expect(
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
      ).toStrictEqual({
        key1: 'foo',
        key2: 'baz',
        key3: 'qux',
      });
    });
  });
});
