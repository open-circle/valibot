import { describe, expect, test } from 'vitest';
import type {
  BaseIssue,
  PartialDataset,
  SuccessDataset,
} from '../../types/index.ts';
import { _addPathIssues } from './_addPathIssues.ts';

describe('_addPathIssues', () => {
  const baseInfo = {
    kind: 'schema',
    type: 'string',
    input: 123,
    expected: 'string',
    received: '123',
    message: 'Invalid type: Expected string but received 123',
    requirement: undefined,
    issues: undefined,
    lang: undefined,
    abortEarly: undefined,
    abortPipeEarly: undefined,
  } satisfies Omit<BaseIssue<unknown>, 'path'>;

  const pathItem = {
    type: 'object',
    origin: 'value',
    input: { key: 123 },
    key: 'key',
    value: 123,
  } as const;

  test('should add issue without path to dataset', () => {
    const dataset: SuccessDataset<Record<string, unknown>> = {
      typed: true,
      value: {},
    };
    const issue: BaseIssue<unknown> = { ...baseInfo };

    _addPathIssues(dataset, pathItem, [issue]);

    expect(dataset).toStrictEqual({
      typed: true,
      value: {},
      issues: [{ ...baseInfo, path: [pathItem] }],
    } satisfies PartialDataset<Record<string, unknown>, BaseIssue<unknown>>);
  });

  test('should prepend path item to issue with path', () => {
    const dataset: SuccessDataset<Record<string, unknown>> = {
      typed: true,
      value: {},
    };
    const nestedPathItem = {
      type: 'array',
      origin: 'value',
      input: [123],
      key: 0,
      value: 123,
    } as const;
    const issue: BaseIssue<unknown> = {
      ...baseInfo,
      path: [nestedPathItem],
    };

    _addPathIssues(dataset, pathItem, [issue]);

    expect(dataset).toStrictEqual({
      typed: true,
      value: {},
      issues: [{ ...baseInfo, path: [pathItem, nestedPathItem] }],
    } satisfies PartialDataset<Record<string, unknown>, BaseIssue<unknown>>);
  });

  test('should append issues to existing dataset issues', () => {
    const existingIssue: BaseIssue<unknown> = {
      ...baseInfo,
      input: false,
      received: 'false',
    };
    const dataset: PartialDataset<
      Record<string, unknown>,
      BaseIssue<unknown>
    > = {
      typed: true,
      value: {},
      issues: [existingIssue],
    };
    const issue: BaseIssue<unknown> = { ...baseInfo };

    _addPathIssues(dataset, pathItem, [issue]);

    expect(dataset.issues).toStrictEqual([
      existingIssue,
      { ...baseInfo, path: [pathItem] },
    ]);
  });

  test('should preserve nested issue order', () => {
    const dataset: SuccessDataset<Record<string, unknown>> = {
      typed: true,
      value: {},
    };
    const issue1: BaseIssue<unknown> = {
      ...baseInfo,
      input: 1,
      received: '1',
    };
    const issue2: BaseIssue<unknown> = {
      ...baseInfo,
      input: 2,
      received: '2',
    };

    _addPathIssues(dataset, pathItem, [issue1, issue2]);

    expect(dataset.issues).toStrictEqual([
      { ...issue1, path: [pathItem] },
      { ...issue2, path: [pathItem] },
    ]);
  });

  test('should not mutate nested issues or paths', () => {
    const existingIssue: BaseIssue<unknown> = {
      ...baseInfo,
      input: false,
      received: 'false',
    };
    const dataset: PartialDataset<
      Record<string, unknown>,
      BaseIssue<unknown>
    > = {
      typed: true,
      value: {},
      issues: [existingIssue],
    };
    const nestedPathItem = {
      type: 'array',
      origin: 'value',
      input: [123],
      key: 0,
      value: 123,
    } as const;
    const nestedPath: [typeof nestedPathItem] = [nestedPathItem];
    const issue: BaseIssue<unknown> = {
      ...baseInfo,
      path: nestedPath,
    };

    _addPathIssues(dataset, pathItem, [issue]);

    const nextIssue = dataset.issues[1]!;

    expect(issue.path).toBe(nestedPath);
    expect(issue.path).toStrictEqual([nestedPathItem]);
    expect(nextIssue).not.toBe(issue);
    expect(nextIssue.path).not.toBe(issue.path);
    expect(nextIssue.path).toStrictEqual([pathItem, nestedPathItem]);
  });
});
