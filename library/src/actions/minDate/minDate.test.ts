import { describe, expect, test } from 'vitest';
import type { DateIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { minDate, type MinDateAction } from './minDate.ts';

describe('minDate', () => {
  describe('should return action object', () => {
    const requirement = new Date();
    const baseAction: Omit<
      MinDateAction<Date, Date, never>,
      'message' | 'requirement' | 'expects'
    > = {
      kind: 'validation',
      type: 'min_date',
      reference: minDate,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: MinDateAction<Date, Date, undefined> = {
        ...baseAction,
        requirement,
        expects: `>=${requirement.toJSON()}`,
        message: undefined,
      };
      expect(minDate(requirement)).toStrictEqual(action);
      expect(minDate(requirement, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(minDate(requirement, 'message')).toStrictEqual({
        ...baseAction,
        requirement,
        expects: `>=${requirement.toJSON()}`,
        message: 'message',
      } satisfies MinDateAction<Date, Date, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(minDate(requirement, message)).toStrictEqual({
        ...baseAction,
        requirement,
        expects: `>=${requirement.toJSON()}`,
        message,
      } satisfies MinDateAction<Date, Date, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    test('for untyped inputs', () => {
      const issues: [DateIssue] = [
        {
          kind: 'schema',
          type: 'date',
          input: null,
          expected: 'Date',
          received: 'null',
          message: 'message',
        },
      ];
      expect(
        minDate(new Date())['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({ typed: false, value: null, issues });
    });

    test('for valid dates', () => {
      const date = new Date();
      expectNoActionIssue(minDate(date), [
        date,
        new Date(+date + 1),
        new Date(+date + 999999),
      ]);
    });

    test('for specific dates', () => {
      expectNoActionIssue(minDate(new Date('2000-01-01')), [
        new Date('2000-01-01'),
        new Date('2000-01-02'),
        new Date('2024-12-31'),
      ]);

      expectNoActionIssue(minDate(new Date('2024-06-15T12:00:00')), [
        new Date('2024-06-15T12:00:00'),
        new Date('2024-06-15T12:00:01'),
        new Date('2024-12-31T23:59:59'),
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const baseInfo = {
      kind: 'validation',
      type: 'min_date',
      message: 'message',
    } as const;

    test('for invalid dates', () => {
      const date = new Date();
      expectActionIssue(
        minDate<Date, Date, 'message'>(date, 'message'),
        { ...baseInfo, expected: `>=${date.toJSON()}`, requirement: date },
        [new Date(+date - 1), new Date(+date - 999999)],
        (value) => value.toJSON()
      );
    });

    test('for specific dates', () => {
      const date1 = new Date('2024-06-15');
      expectActionIssue(
        minDate(date1, 'message'),
        {
          ...baseInfo,
          expected: `>=${date1.toJSON()}`,
          requirement: date1,
        },
        [new Date('2024-06-14'), new Date('2000-01-01')],
        (value) => value.toJSON()
      );

      const date2 = new Date('2024-06-15T12:00:00');
      expectActionIssue(
        minDate(date2, 'message'),
        {
          ...baseInfo,
          expected: `>=${date2.toJSON()}`,
          requirement: date2,
        },
        [new Date('2024-06-15T11:59:59'), new Date('2024-06-14T12:00:00')],
        (value) => value.toJSON()
      );
    });

    test('with custom message', () => {
      const requirement = new Date('2024-01-01');
      expectActionIssue(
        minDate(requirement, 'Custom message'),
        {
          ...baseInfo,
          expected: `>=${requirement.toJSON()}`,
          requirement,
          message: 'Custom message',
        },
        [new Date('2023-12-31')],
        (value) => value.toJSON()
      );
    });
  });
});
