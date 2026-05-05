import { describe, expect, test } from 'vitest';
import type { IncludesIssue, MinLengthIssue } from '../../actions/index.ts';
import type { NumberIssue, StringIssue } from '../../schemas/index.ts';
import type { ArrayPathItem, ObjectPathItem } from '../../types/issue.ts';
import { summarize } from './summarize.ts';

describe('summarize', () => {
  const commonIssueInfo = {
    abortEarly: undefined,
    abortPipeEarly: undefined,
    issues: undefined,
    lang: undefined,
  };

  test('should return single error without path', () => {
    const rootIssues1: [StringIssue] = [
      {
        ...commonIssueInfo,
        kind: 'schema',
        type: 'string',
        input: 123,
        expected: 'string',
        received: '123',
        message: 'Invalid type: Expected string but received 123',
        path: undefined,
      },
    ];
    expect(summarize(rootIssues1)).toBe(
      '× Invalid type: Expected string but received 123'
    );
  });

  test('should return multiple errors without path', () => {
    const rootIssues2: [
      IncludesIssue<string, 'foo'>,
      MinLengthIssue<string, 5>,
    ] = [
      {
        ...commonIssueInfo,
        kind: 'validation',
        type: 'includes',
        input: '123',
        expected: '"foo"',
        received: '!"foo"',
        message: 'Invalid content: Expected "foo" but received !"foo"',
        requirement: 'foo',
        path: undefined,
      },
      {
        ...commonIssueInfo,
        kind: 'validation',
        type: 'min_length',
        input: '123',
        expected: '>=5',
        received: '3',
        message: 'Invalid length: Expected >=5 but received 3',
        requirement: 5,
        path: undefined,
      },
    ];
    expect(summarize(rootIssues2)).toBe(
      '× Invalid content: Expected "foo" but received !"foo"\n' +
        '× Invalid length: Expected >=5 but received 3'
    );
  });

  test('should return single error with path', () => {
    const nestedIssue: NumberIssue = {
      ...commonIssueInfo,
      kind: 'schema',
      type: 'number',
      input: '1',
      expected: 'number',
      received: '"1"',
      message: 'Invalid type: Expected number but received "1"',
      path: [
        {
          type: 'array',
          origin: 'value',
          input: ['1'],
          key: 0,
          value: '1',
        } satisfies ArrayPathItem,
      ],
    };
    expect(summarize([nestedIssue])).toBe(
      '× Invalid type: Expected number but received "1"\n  → at 0'
    );
  });

  test('should return multiple errors with path', () => {
    const input = {
      key1: 'bar',
      key2: '21',
    };
    const nestedIssues: [
      IncludesIssue<string, 'foo'>,
      MinLengthIssue<string, 5>,
      NumberIssue,
    ] = [
      {
        ...commonIssueInfo,
        kind: 'validation',
        type: 'includes',
        input: '123',
        expected: '"foo"',
        received: '!"foo"',
        message: 'Invalid content: Expected "foo" but received !"foo"',
        requirement: 'foo',
        path: [
          {
            type: 'object',
            origin: 'value',
            input,
            key: 'key1',
            value: input.key1,
          } satisfies ObjectPathItem,
        ],
      },
      {
        ...commonIssueInfo,
        kind: 'validation',
        type: 'min_length',
        input: '123',
        expected: '>=5',
        received: '3',
        message: 'Invalid length: Expected >=5 but received 3',
        requirement: 5,
        path: [
          {
            type: 'object',
            origin: 'value',
            input,
            key: 'key1',
            value: input.key1,
          } satisfies ObjectPathItem,
        ],
      },
      {
        expected: 'number',
        input: '21',
        kind: 'schema',
        message: 'Invalid type: Expected number but received "21"',
        path: [
          {
            type: 'object',
            origin: 'value',
            input,
            key: 'key2',
            value: input.key2,
          } satisfies ObjectPathItem,
        ],
        received: '"21"',
        type: 'number',
      },
    ];
    expect(summarize(nestedIssues)).toBe(
      '× Invalid content: Expected "foo" but received !"foo"\n' +
        '  → at key1\n' +
        '× Invalid length: Expected >=5 but received 3\n' +
        '  → at key1\n' +
        '× Invalid type: Expected number but received "21"\n' +
        '  → at key2'
    );
  });

  test('should return single error with dot path', () => {
    const nestedIssue: NumberIssue = {
      ...commonIssueInfo,
      kind: 'schema',
      type: 'number',
      input: 'foo',
      expected: 'number',
      received: '"foo"',
      message: 'Invalid type: Expected number but received "foo"',
      path: [
        {
          type: 'object',
          origin: 'value',
          input: { dot: [{ path: 'foo' }] },
          key: 'dot',
          value: [{ path: 'foo' }],
        } satisfies ObjectPathItem,
        {
          type: 'array',
          origin: 'value',
          input: [{ path: 'foo' }],
          key: 0,
          value: { path: 'foo' },
        } satisfies ArrayPathItem,
        {
          type: 'object',
          origin: 'value',
          input: { path: 'foo' },
          key: 'path',
          value: 'foo',
        } satisfies ObjectPathItem,
      ],
    };
    expect(summarize([nestedIssue])).toBe(
      '× Invalid type: Expected number but received "foo"\n' +
        '  → at dot.0.path'
    );
  });
});
