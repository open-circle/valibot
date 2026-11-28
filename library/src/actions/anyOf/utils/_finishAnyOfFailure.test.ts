import { describe, expect, test } from 'vitest';
import type { BaseIssue, PartialDataset } from '../../../types/index.ts';
import { anyOf, email, url } from '../../index.ts';
import { _finishAnyOfFailure } from './_finishAnyOfFailure.ts';

describe('_finishAnyOfFailure', () => {
  const action = anyOf([email(), url()]);
  const issue: BaseIssue<unknown> = {
    kind: 'validation',
    type: 'check',
    input: 'x',
    expected: null,
    received: '"x"',
    message: 'invalid',
  };

  test('should keep the first partial output and append a single combined issue', () => {
    const dataset: PartialDataset<string, BaseIssue<unknown>> = {
      typed: true,
      value: 'x',
      issues: [issue],
    };
    const result = _finishAnyOfFailure(action, dataset, {}, [
      { typed: false, value: null, issues: [{ ...issue, message: 'first' }] },
      { typed: true, value: 0, issues: [{ ...issue, message: 'second' }] },
      { typed: true, value: 1, issues: [{ ...issue, message: 'third' }] },
    ]);
    expect(result).toBe(dataset);
    expect(result).toMatchObject({
      typed: true,
      value: 0,
      issues: [
        issue,
        {
          type: 'any_of',
          input: 'x',
          issues: [
            { message: 'first' },
            { message: 'second' },
            { message: 'third' },
          ],
        },
      ],
    });
  });

  test('should reject failures without issues', () => {
    expect(() =>
      _finishAnyOfFailure(action, { typed: true, value: 'x' }, {}, undefined)
    ).toThrow('must return issues when they fail');
  });
});
