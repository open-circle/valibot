import { describe, expect, test } from 'vitest';
import { checkAsync, email, minLength, trim } from '../../index.ts';
import { _getAnyOfExpects } from './_getAnyOfExpects.ts';

describe('_getAnyOfExpects', () => {
  test('should combine explicit expectations and action types in option order', () => {
    expect(
      _getAnyOfExpects([trim(), minLength(3), email(), trim()], false)
    ).toBe('(trim | >=3 | email)');
  });

  test('should only accept async options when enabled', () => {
    const options = [email(), checkAsync(() => true)] as const;
    expect(_getAnyOfExpects(options, true)).toBe('(email | check)');
    expect(() => _getAnyOfExpects(options, false)).toThrow(
      'at index 1 of type "check"'
    );
  });

  test.each([
    null,
    { ...email(), '~run': undefined },
    { ...email(), expects: 42 },
  ])(
    'should identify a malformed alternative even in async mode',
    (invalid) => {
      expect(() => _getAnyOfExpects([email(), invalid] as never, true)).toThrow(
        'at index 1'
      );
    }
  );
});
