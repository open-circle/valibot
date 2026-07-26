import { describe, expect, test } from 'vitest';
import {
  boolean,
  number,
  object,
  objectAsync,
  string,
} from '../../schemas/index.ts';
import { entriesFromObjects } from './entriesFromObjects.ts';

describe('entriesFromObjects', () => {
  describe('should return objects entries', () => {
    const schema1 = object({ foo: string(), bar: string() });
    const schema2 = objectAsync({ baz: number(), qux: number() });
    const schema3 = object({ foo: boolean(), baz: boolean() });

    test('for missing schema', () => {
      expect(
        // @ts-expect-error
        entriesFromObjects([])
      ).toStrictEqual({});
    });

    test('for single schema', () => {
      expect(entriesFromObjects([schema1])).toStrictEqual(schema1.entries);
    });

    test('for multiple schemes', () => {
      expect(entriesFromObjects([schema1, schema2])).toStrictEqual({
        ...schema1.entries,
        ...schema2.entries,
      });
    });

    test('with overwrites', () => {
      expect(entriesFromObjects([schema1, schema2, schema3])).toStrictEqual({
        ...schema1.entries,
        ...schema2.entries,
        ...schema3.entries,
      });
    });

    test('for empty entries', () => {
      expect(entriesFromObjects([object({})])).toStrictEqual({});
      expect(entriesFromObjects([object({}), objectAsync({})])).toStrictEqual(
        {}
      );
    });
  });
});
