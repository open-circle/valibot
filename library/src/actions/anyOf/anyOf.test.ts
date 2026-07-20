import { describe, expect, test, vi } from 'vitest';
import type { StringIssue } from '../../schemas/index.ts';
import type { BaseIssue, FailureDataset } from '../../types/index.ts';
import { guard, type GuardIssue } from '../guard/index.ts';
import {
  brand,
  check,
  checkAsync,
  description,
  email,
  flavor,
  minLength,
  readonly,
  toNumber,
  trim,
  url,
} from '../index.ts';
import { anyOf, type AnyOfAction, type AnyOfIssue } from './anyOf.ts';

describe('anyOf', () => {
  type PixelString = `${number}px`;
  type RemString = `${number}rem`;
  const isPixelString = (input: string): input is PixelString =>
    /^\d+px$/u.test(input);
  const isRemString = (input: string): input is RemString =>
    /^\d+rem$/u.test(input);
  const emailAction = email();
  const urlAction = url();

  const baseAction: Omit<
    AnyOfAction<
      readonly [ReturnType<typeof email>, ReturnType<typeof url>],
      never
    >,
    'message'
  > = {
    kind: 'validation',
    type: 'any_of',
    reference: anyOf,
    expects: '(email | url)',
    options: [emailAction, urlAction],
    async: false,
    '~run': expect.any(Function),
  };

  describe('should return action object', () => {
    test('with undefined message', () => {
      const action: AnyOfAction<
        readonly [ReturnType<typeof email>, ReturnType<typeof url>],
        undefined
      > = {
        ...baseAction,
        message: undefined,
      };
      expect(anyOf([emailAction, urlAction])).toStrictEqual(action);
      expect(anyOf([emailAction, urlAction], undefined)).toStrictEqual(action);
    });

    test('with string message', () => {
      expect(anyOf([emailAction, urlAction], 'message')).toStrictEqual({
        ...baseAction,
        message: 'message',
      });
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(anyOf([emailAction, urlAction], message)).toStrictEqual({
        ...baseAction,
        message,
      });
    });
  });

  describe('should throw TypeError', () => {
    test('for invalid option count', () => {
      expect(() => anyOf([] as never)).toThrow(TypeError);
      expect(() => anyOf([email()] as never)).toThrow(TypeError);
    });

    test('for invalid options', () => {
      expect(() => anyOf([email(), description('test')] as never)).toThrow(
        'The any of option at index 1 of type "description" must be a sync validation or transformation action.'
      );
      expect(() => anyOf([email(), checkAsync(() => true)] as never)).toThrow(
        'The any of option at index 1 of type "check" must be a sync validation or transformation action.'
      );
    });
  });

  describe('should return dataset without issues', () => {
    test('for untyped input', () => {
      const action = anyOf([email(), url()]);
      const issues: [StringIssue] = [
        {
          kind: 'schema',
          type: 'string',
          input: null,
          expected: 'string',
          received: 'null',
          message: 'message',
        },
      ];
      expect(
        action['~run']({ typed: false, value: null, issues }, {})
      ).toStrictEqual({
        typed: false,
        value: null,
        issues,
      });
    });

    test('for first valid option', () => {
      const action = anyOf([
        check<string>(() => true),
        check<string>(() => {
          throw new Error('Option should not run.');
        }),
      ]);
      expect(action['~run']({ typed: true, value: 'foo' }, {})).toStrictEqual({
        typed: true,
        value: 'foo',
      });
    });

    test('for second valid option', () => {
      const action = anyOf([email(), url()]);
      expect(
        action['~run']({ typed: true, value: 'https://example.com' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'https://example.com',
      });
    });

    test('for guard option', () => {
      const action = anyOf([guard(isPixelString), guard(isRemString)]);
      expect(
        action['~run']({ typed: true, value: '123rem' }, {})
      ).toStrictEqual({
        typed: true,
        value: '123rem',
      });
    });

    test('for transform option fallback', () => {
      const action = anyOf([email(), toNumber()]);
      expect(action['~run']({ typed: true, value: '123' }, {})).toStrictEqual({
        typed: true,
        value: 123,
      });
    });

    test('for first matching transform', () => {
      const action = anyOf([trim(), toNumber()]);
      expect(
        action['~run']({ typed: true, value: '  foo  ' }, {})
      ).toStrictEqual({
        typed: true,
        value: 'foo',
      });
    });

    test('for explicitly typed readonly/brand/flavor fallback', () => {
      // `readonly`/`brand`/`flavor` are no-ops at runtime regardless of their
      // type argument, so this only confirms they still run correctly as
      // options once the type-level restriction on bare calls is satisfied.
      expect(
        anyOf([email(), readonly<string>()])['~run'](
          { typed: true, value: 'foo' },
          {}
        )
      ).toStrictEqual({ typed: true, value: 'foo' });

      expect(
        anyOf([email(), brand<string, 'id'>('id')])['~run'](
          { typed: true, value: 'foo' },
          {}
        )
      ).toStrictEqual({ typed: true, value: 'foo' });

      expect(
        anyOf([email(), flavor<string, 'id'>('id')])['~run'](
          { typed: true, value: 'foo' },
          {}
        )
      ).toStrictEqual({ typed: true, value: 'foo' });
    });

    test('for a matching option, preserves issues already on the dataset', () => {
      const existingIssue: BaseIssue<string> = {
        kind: 'validation',
        type: 'check',
        input: 'foo',
        expected: null,
        received: '"foo"',
        message: 'message',
      };
      const action = anyOf([toNumber(), trim()]);
      expect(
        action['~run'](
          { typed: true, value: '123', issues: [existingIssue] },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: 123,
        issues: [existingIssue],
      });
    });
  });

  describe('should return dataset with issues', () => {
    const baseInfo = {
      path: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for multiple failing validation options', () => {
      const emailOption = email('email message');
      const urlOption = url('url message');
      const action = anyOf([emailOption, urlOption]);
      expect(action['~run']({ typed: true, value: 'foo' }, {})).toStrictEqual({
        typed: true,
        value: 'foo',
        issues: [
          {
            ...baseInfo,
            kind: 'validation',
            type: 'any_of',
            input: 'foo',
            expected: '(email | url)',
            received: '"foo"',
            message: 'Invalid input: Expected (email | url) but received "foo"',
            requirement: undefined,
            issues: [
              {
                ...baseInfo,
                kind: 'validation',
                type: 'email',
                input: 'foo',
                expected: null,
                received: '"foo"',
                message: 'email message',
                requirement: emailOption.requirement,
                issues: undefined,
              },
              {
                ...baseInfo,
                kind: 'validation',
                type: 'url',
                input: 'foo',
                expected: null,
                received: '"foo"',
                message: 'url message',
                requirement: urlOption.requirement,
                issues: undefined,
              },
            ],
          },
        ],
      });
    });

    test('for one typed and one untyped failure', () => {
      const action = anyOf([
        minLength(5, 'length message'),
        guard(isPixelString, 'guard message'),
      ]);

      expect(action['~run']({ typed: true, value: '123' }, {})).toStrictEqual({
        typed: true,
        value: '123',
        issues: [
          {
            ...baseInfo,
            kind: 'validation',
            type: 'any_of',
            input: '123',
            expected: '(>=5 | guard)',
            received: '"123"',
            message: 'Invalid input: Expected (>=5 | guard) but received "123"',
            requirement: undefined,
            issues: [
              {
                ...baseInfo,
                kind: 'validation',
                type: 'min_length',
                input: '123',
                expected: '>=5',
                received: '3',
                message: 'length message',
                requirement: 5,
                issues: undefined,
              },
              {
                ...baseInfo,
                kind: 'transformation',
                type: 'guard',
                input: '123',
                expected: null,
                received: '"123"',
                message: 'guard message',
                requirement: isPixelString,
                issues: undefined,
              },
            ],
          },
        ],
      });
    });

    test('for all untyped failures', () => {
      const action = anyOf([
        guard(isPixelString, 'pixel message'),
        guard(isRemString, 'rem message'),
      ]);

      expect(action['~run']({ typed: true, value: '123' }, {})).toStrictEqual({
        typed: false,
        value: '123',
        issues: [
          {
            ...baseInfo,
            kind: 'validation',
            type: 'any_of',
            input: '123',
            expected: 'guard',
            received: '"123"',
            message: 'Invalid input: Expected guard but received "123"',
            requirement: undefined,
            issues: [
              {
                ...baseInfo,
                kind: 'transformation',
                type: 'guard',
                input: '123',
                expected: null,
                received: '"123"',
                message: 'pixel message',
                requirement: isPixelString,
                issues: undefined,
              },
              {
                ...baseInfo,
                kind: 'transformation',
                type: 'guard',
                input: '123',
                expected: null,
                received: '"123"',
                message: 'rem message',
                requirement: isRemString,
                issues: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<
        | AnyOfIssue<
            | GuardIssue<string, typeof isPixelString>
            | GuardIssue<string, typeof isRemString>
          >
        | GuardIssue<string, typeof isPixelString>
        | GuardIssue<string, typeof isRemString>
      >);
    });

    test('with existing issues', () => {
      const existingIssue: BaseIssue<string> = {
        kind: 'validation',
        type: 'check',
        input: 'foo',
        expected: null,
        received: '"foo"',
        message: 'message',
      };
      const action = anyOf([email(), url()]);

      expect(
        action['~run'](
          { typed: true, value: 'foo', issues: [existingIssue] },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: 'foo',
        issues: [
          existingIssue,
          expect.objectContaining({
            kind: 'validation',
            type: 'any_of',
            input: 'foo',
          }),
        ],
      });
    });

    test('with custom string message', () => {
      const action = anyOf([email(), url()], 'message');
      expect(action['~run']({ typed: true, value: 'foo' }, {})).toStrictEqual({
        typed: true,
        value: 'foo',
        issues: [
          expect.objectContaining({
            type: 'any_of',
            message: 'message',
          }),
        ],
      });
    });

    test('with custom function message', () => {
      const message = vi.fn(
        (issue: AnyOfIssue<BaseIssue<unknown>>) => issue.expected
      );
      const action = anyOf([email(), url()], message);

      expect(action['~run']({ typed: true, value: 'foo' }, {})).toStrictEqual({
        typed: true,
        value: 'foo',
        issues: [
          expect.objectContaining({
            type: 'any_of',
            message: '(email | url)',
          }),
        ],
      });
      expect(message).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'any_of' })
      );
    });

    test('with config propagation', () => {
      const action = anyOf([email(), url()]);
      expect(
        action['~run'](
          { typed: true, value: 'foo' },
          { abortEarly: true, abortPipeEarly: true }
        )
      ).toStrictEqual({
        typed: true,
        value: 'foo',
        issues: [
          expect.objectContaining({
            type: 'any_of',
            abortEarly: true,
            abortPipeEarly: true,
            issues: [
              expect.objectContaining({
                type: 'email',
                abortEarly: true,
                abortPipeEarly: true,
              }),
              expect.objectContaining({
                type: 'url',
                abortEarly: true,
                abortPipeEarly: true,
              }),
            ],
          }),
        ],
      });
    });
  });

  test('should propagate option exceptions', () => {
    const error = new Error('Option failed.');
    const action = anyOf([
      check<string>(() => {
        throw error;
      }),
      email(),
    ]);

    expect(() => action['~run']({ typed: true, value: 'foo' }, {})).toThrow(
      error
    );
  });
});
