import { describe, expect, test } from 'vitest';
import { email, title } from '../../actions/index.ts';
import { pipe } from '../../methods/index.ts';
import { string } from '../../schemas/index.ts';
import { _getLastMetadata } from './_getLastMetadata.ts';

describe('_getLastMetadata', () => {
  describe('should return undefined', () => {
    test('for schema without a pipeline', () => {
      expect(_getLastMetadata(string(), 'title')).toBeUndefined();
    });

    test('for schema with an empty pipeline', () => {
      expect(_getLastMetadata(pipe(string()), 'title')).toBeUndefined();
    });

    test('for schema without metadata', () => {
      expect(
        _getLastMetadata(pipe(string(), email()), 'title')
      ).toBeUndefined();
    });
  });

  describe('should return last top-level metadata', () => {
    test('for simple schema with single metadata', () => {
      expect(_getLastMetadata(pipe(string(), title('foo')), 'title')).toBe(
        'foo'
      );
    });

    test('for simple schema with multiple metadata', () => {
      expect(
        _getLastMetadata(pipe(string(), title('foo'), title('bar')), 'title')
      ).toBe('bar');
    });

    test('for schema with nested pipelines', () => {
      expect(
        _getLastMetadata(
          pipe(string(), title('foo'), pipe(string(), title('bar'))),
          'title'
        )
      ).toBe('foo');
      expect(
        _getLastMetadata(
          pipe(string(), email(), pipe(string(), title('foo'))),
          'title'
        )
      ).toBe('foo');
      expect(
        _getLastMetadata(
          pipe(pipe(string(), title('foo')), title('bar')),
          'title'
        )
      ).toBe('bar');
      expect(
        _getLastMetadata(pipe(pipe(string(), title('foo')), email()), 'title')
      ).toBe('foo');
    });

    test('for schema with deeply nested pipelines', () => {
      expect(
        _getLastMetadata(
          pipe(pipe(pipe(string(), title('foo'))), email()),
          'title'
        )
      ).toBe('foo');
      expect(
        _getLastMetadata(
          pipe(pipe(pipe(string(), title('foo')), title('bar')), email()),
          'title'
        )
      ).toBe('bar');
    });

    test('for nested schema without matching metadata', () => {
      expect(
        _getLastMetadata(
          pipe(pipe(string(), title('found')), pipe(string(), email())),
          'title'
        )
      ).toBe('found');
    });
  });
});
