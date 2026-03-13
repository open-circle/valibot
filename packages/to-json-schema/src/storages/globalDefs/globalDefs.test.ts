import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { addGlobalDefs, getGlobalDefs } from './globalDefs.ts';

describe('globalDefs', () => {
  test('should be undefined initially', () => {
    expect(getGlobalDefs()).toBeUndefined();
  });

  test('should return an empty object', () => {
    addGlobalDefs({});
    expect(getGlobalDefs()).toStrictEqual({});
  });

  const schema1 = v.string();
  const schema2 = v.number();
  const schema3 = v.boolean();

  test('should add global definitions', () => {
    addGlobalDefs({ schema1, schema2 });
    expect(getGlobalDefs()).toStrictEqual({ schema1, schema2 });
    addGlobalDefs({ schema3 });
    expect(getGlobalDefs()).toStrictEqual({ schema1, schema2, schema3 });
  });

  test('should overwrite existing definitions', () => {
    const otherSchema = v.null();
    addGlobalDefs({ schema2: otherSchema });
    expect(getGlobalDefs()).toStrictEqual({
      schema1,
      schema2: otherSchema,
      schema3,
    });
  });
});
