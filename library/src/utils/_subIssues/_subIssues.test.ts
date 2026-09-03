import { describe, expect, test } from 'vitest';
import type { EmailIssue, UrlIssue } from '../../actions/index.ts';
import type { PartialDataset } from '../../types/index.ts';
import { _subIssues } from './_subIssues.ts';

describe('_subIssues', () => {
  describe('should return undefined', () => {
    test('for undefined', () => {
      expect(_subIssues(undefined)).toBeUndefined();
    });

    test('for empty array', () => {
      expect(_subIssues([])).toBeUndefined();
    });

    test('for undefined issues', () => {
      expect(_subIssues([{ typed: true, value: 'foo' }])).toBeUndefined();
    });
  });

  describe('should return subissues', () => {
    const baseInfo = {
      message: expect.any(String),
      requirement: undefined,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    const emailIssue: EmailIssue<string> = {
      ...baseInfo,
      kind: 'validation',
      type: 'email',
      input: 'foo',
      expected: null,
      received: '"foo"',
      requirement: expect.any(RegExp),
    };

    const urlIssue: UrlIssue<string> = {
      ...baseInfo,
      kind: 'validation',
      type: 'url',
      input: 'foo',
      expected: null,
      received: '"foo"',
      requirement: expect.any(Function),
    };

    test('for single dataset with single issue', () => {
      expect(
        _subIssues([
          {
            typed: true,
            value: 'foo',
            issues: [emailIssue],
          } satisfies PartialDataset<string, EmailIssue<string>>,
        ])
      ).toStrictEqual([emailIssue]);
    });

    test('for single dataset with multiple issues', () => {
      expect(
        _subIssues([
          {
            typed: true,
            value: 'foo',
            issues: [emailIssue, urlIssue],
          } satisfies PartialDataset<
            string,
            EmailIssue<string> | UrlIssue<string>
          >,
        ])
      ).toStrictEqual([emailIssue, urlIssue]);
    });

    test('for multiple datasets with single issue', () => {
      expect(
        _subIssues([
          {
            typed: true,
            value: 'foo',
            issues: [emailIssue],
          },
          {
            typed: true,
            value: 'foo',
            issues: [urlIssue],
          },
        ] satisfies PartialDataset<
          string,
          EmailIssue<string> | UrlIssue<string>
        >[])
      ).toStrictEqual([emailIssue, urlIssue]);
    });

    test('for multiple datasets with multiple issues', () => {
      expect(
        _subIssues([
          {
            typed: true,
            value: 'foo',
            issues: [emailIssue, urlIssue],
          },
          {
            typed: true,
            value: 'foo',
            issues: [emailIssue, urlIssue],
          },
        ] satisfies PartialDataset<
          string,
          EmailIssue<string> | UrlIssue<string>
        >[])
      ).toStrictEqual([emailIssue, urlIssue, emailIssue, urlIssue]);
    });
  });
});
