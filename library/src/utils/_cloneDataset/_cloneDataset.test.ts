import { describe, expect, test } from 'vitest';
import type {
  BaseIssue,
  FailureDataset,
  PartialDataset,
  SuccessDataset,
} from '../../types/index.ts';
import { _cloneDataset } from './_cloneDataset.ts';

describe('_cloneDataset', () => {
  test('should clone success dataset', () => {
    const value = { key: 'foo' };
    const dataset: SuccessDataset<typeof value> = {
      typed: true,
      value,
    };
    const clonedDataset = _cloneDataset(dataset);

    expect(clonedDataset).toStrictEqual({
      typed: true,
      value,
      issues: undefined,
    });
    expect(clonedDataset).not.toBe(dataset);
    expect(clonedDataset.value).toBe(value);
  });

  test('should clone partial dataset issues array', () => {
    const issue: BaseIssue<unknown> = {
      kind: 'schema',
      type: 'string',
      input: 123,
      expected: 'string',
      received: '123',
      message: 'Invalid type: Expected string but received 123',
      requirement: undefined,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };
    const dataset: PartialDataset<string, BaseIssue<unknown>> = {
      typed: true,
      value: 'foo',
      issues: [issue],
    };
    const clonedDataset = _cloneDataset(dataset);

    expect(clonedDataset).toStrictEqual(dataset);
    expect(clonedDataset).not.toBe(dataset);
    expect(clonedDataset.issues).toBeDefined();
    expect(clonedDataset.issues).not.toBe(dataset.issues);
    expect(clonedDataset.issues![0]).toBe(issue);
  });

  test('should clone failure dataset issues array', () => {
    const issue: BaseIssue<unknown> = {
      kind: 'schema',
      type: 'string',
      input: 123,
      expected: 'string',
      received: '123',
      message: 'Invalid type: Expected string but received 123',
      requirement: undefined,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };
    const dataset: FailureDataset<BaseIssue<unknown>> = {
      typed: false,
      value: 123,
      issues: [issue],
    };
    const clonedDataset = _cloneDataset(dataset);

    expect(clonedDataset).toStrictEqual(dataset);
    expect(clonedDataset).not.toBe(dataset);
    expect(clonedDataset.issues).toBeDefined();
    expect(clonedDataset.issues).not.toBe(dataset.issues);
  });
});
