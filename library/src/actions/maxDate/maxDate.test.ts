import { describe, expect, test } from 'vitest';
import type { DateIssue } from '../../schemas/index.ts';
import { expectActionIssue, expectNoActionIssue } from '../../vitest/index.ts';
import { maxDate, type MaxDateAction } from './maxDate.ts';

describe('maxDate', () => {
  describe('should return action object', () => {
    const requirement = new Date();
    const baseAction: Omit<
      MaxDateAction<Date, Date, never>,
      'message' | 'requirement' | 'expects'
    > = {
      kind: 'validation',
      type: 'max_date',
      reference: maxDate,
      async: false,
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const action: MaxDateAction<Date, Date, undefined> = {
        ...baseAction,
        requirement,
        expects: `<=${requirement.toJSON()}`,
        message: undefined,
      };
      expect(maxDate(requirement)).toStrictEqual(action);
      expect(maxDate(requirement, undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(maxDate(requirement, 'message')).toStrictEqual({
        ...baseAction,
        requirement,
        expects: `<=${requirement.toJSON()}`,
        message: 'message',
      } satisfies MaxDateAction<Date, Date, string>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(maxDate(requirement, message)).toStrictEqual({
        ...baseAction,
        requirement,
        expects: `<=${requirement.toJSON()}`,
        message,
      } satisfies MaxDateAction<Date, Date, typeof message>);
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
        maxDate(new Date())['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({ typed: false, value: null, issues });
    });

    test('for valid dates', () => {
      const date = new Date();
      expectNoActionIssue(maxDate(date), [
        date,
        new Date(+date - 1),
        new Date(+date - 999999),
      ]);
    });

    test('for specific dates', () => {
      expectNoActionIssue(maxDate(new Date('2024-12-31')), [
        new Date('2024-12-31'),
        new Date('2024-12-30'),
        new Date('2000-01-01'),
      ]);

      expectNoActionIssue(maxDate(new Date('2024-06-15T12:00:00')), [
        new Date('2024-06-15T12:00:00'),
        new Date('2024-06-15T11:59:59'),
        new Date('2000-01-01T00:00:00'),
      ]);
    });
  });

  describe('should return dataset with issues', () => {
    const baseInfo = {
      kind: 'validation',
      type: 'max_date',
      message: 'message',
    } as const;

    test('for invalid dates', () => {
      const date = new Date();
      expectActionIssue(
        maxDate<Date, Date, 'message'>(date, 'message'),
        { ...baseInfo, expected: `<=${date.toJSON()}`, requirement: date },
        [new Date(+date + 1), new Date(+date + 999999)],
        (value) => value.toJSON()
      );
    });

    test('for specific dates', () => {
      const date1 = new Date('2024-06-15');
      expectActionIssue(
        maxDate(date1, 'message'),
        {
          ...baseInfo,
          expected: `<=${date1.toJSON()}`,
          requirement: date1,
        },
        [new Date('2024-06-16'), new Date('2025-01-01')],
        (value) => value.toJSON()
      );

      const date2 = new Date('2024-06-15T12:00:00');
      expectActionIssue(
        maxDate(date2, 'message'),
        {
          ...baseInfo,
          expected: `<=${date2.toJSON()}`,
          requirement: date2,
        },
        [new Date('2024-06-15T12:00:01'), new Date('2024-06-16T12:00:00')],
        (value) => value.toJSON()
      );
    });

    test('with custom message', () => {
      const requirement = new Date('2024-12-31');
      expectActionIssue(
        maxDate(requirement, 'Custom message'),
        {
          ...baseInfo,
          expected: `<=${requirement.toJSON()}`,
          requirement,
          message: 'Custom message',
        },
        [new Date('2025-01-01')],
        (value) => value.toJSON()
      );
    });
  });
});
