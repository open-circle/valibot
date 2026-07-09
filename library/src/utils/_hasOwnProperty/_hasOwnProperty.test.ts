import { describe, expect, test } from 'vitest';
import { _hasOwnProperty } from './_hasOwnProperty.ts';

describe('_hasOwnProperty', () => {
  test('returns true for own properties', () => {
    expect(_hasOwnProperty({ name: 'a' }, 'name')).toBe(true);
  });

  test('returns false for inherited Object.prototype members', () => {
    // Regression coverage for the prototype-pollution class of bug that
    // #1523 fixed in the object schemas. Keys that look like they are
    // defined entries must not be matched via the `in` operator's
    // prototype walk.
    expect(_hasOwnProperty({}, 'toString')).toBe(false);
    expect(_hasOwnProperty({}, 'valueOf')).toBe(false);
    expect(_hasOwnProperty({}, 'hasOwnProperty')).toBe(false);
    expect(_hasOwnProperty({}, 'constructor')).toBe(false);
    expect(_hasOwnProperty({}, '__proto__')).toBe(false);
  });

  test('returns true for own properties that share a name with a prototype member', () => {
    // A schema that intentionally defines an entry named like a prototype
    // member is still recognized as a defined entry. The own-property
    // check is precise, not name-based.
    expect(_hasOwnProperty({ toString: () => undefined }, 'toString')).toBe(true);
    expect(_hasOwnProperty({ constructor: 1 }, 'constructor')).toBe(true);
  });
});
