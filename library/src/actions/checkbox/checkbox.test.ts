import { describe, expect, test } from 'vitest';
import { checkbox, type CheckboxAction } from './checkbox.ts';

describe('checkbox', () => {
  test('should return action object', () => {
    expect(checkbox()).toStrictEqual({
      kind: 'transformation',
      type: 'checkbox',
      reference: checkbox,
      async: false,
      '~run': expect.any(Function),
    } satisfies CheckboxAction);
  });

  describe('should transform checkbox string', () => {
    const action = checkbox();

    test('to true', () => {
      expect(action['~run']({ typed: true, value: 'on' }, {})).toStrictEqual({
        typed: true,
        value: true,
      });
    });

    test('to false', () => {
      expect(action['~run']({ typed: true, value: 'off' }, {})).toStrictEqual({
        typed: true,
        value: false,
      });
    });
  });
});
