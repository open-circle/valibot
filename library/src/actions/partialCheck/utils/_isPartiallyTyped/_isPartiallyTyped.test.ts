import { describe, expect, test } from 'vitest';
import type {
  NumberIssue,
  ObjectIssue,
  StringIssue,
} from '../../../../schemas/index.ts';
import type {
  FailureDataset,
  SuccessDataset,
} from '../../../../types/index.ts';
import { _isPartiallyTyped } from './_isPartiallyTyped.ts';

describe('_isPartiallyTyped', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  type Input = {
    nested: { key1: string; key2: string };
    tuple: [number, { key1: string; key2: string }, number];
    array: { key1: string; key2: string }[];
    other: string;
  };
  const paths = [
    ['nested', 'key2'],
    ['tuple', 1, 'key2'],
    ['array', '$', 'key2'],
  ] as const;

  const baseInfo = {
    message: 'message',
    requirement: undefined,
    path: undefined,
    issues: undefined,
    lang: undefined,
    abortEarly: undefined,
    abortPipeEarly: undefined,
  };

  describe('should return false', () => {
    test('if issue has no path', () => {
      const dataset: FailureDataset<ObjectIssue> = {
        typed: false,
        value: null,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: null,
            expected: 'Object',
            received: 'null',
            path: undefined,
          },
        ],
      };
      expect(_isPartiallyTyped(dataset, paths)).toBe(false);
    });

    test('if part of path matches path of issue', () => {
      const input = {
        nested: null,
        tuple: [123, { key1: 'foo', key2: 'bar' }, 456],
        array: [{ key1: 'foo', key2: 'bar' }],
        other: 'foo',
      };
      const dataset: FailureDataset<ObjectIssue> = {
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: null,
            expected: 'Object',
            received: 'null',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'nested',
                value: input.nested,
              },
            ],
          },
        ],
      };
      expect(_isPartiallyTyped(dataset, paths)).toBe(false);
    });

    test('if entire path matches path of issue', () => {
      const input = {
        nested: { key1: 'foo', key2: null },
        tuple: [123, { key1: 'foo', key2: 'bar' }, 456],
        array: [{ key1: 'foo', key2: 'bar' }],
        other: 'foo',
      };
      const dataset: FailureDataset<StringIssue> = {
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'string',
            input: null,
            expected: 'string',
            received: 'null',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'nested',
                value: input.nested,
              },
              {
                type: 'object',
                origin: 'value',
                input: input.nested,
                key: 'key2',
                value: input.nested.key2,
              },
            ],
          },
        ],
      };
      expect(_isPartiallyTyped(dataset, paths)).toBe(false);
    });

    test('if array wildcard of path matches path of issue', () => {
      const input = {
        nested: { key1: 'foo', key2: 'bar' },
        tuple: [123, { key1: 'foo', key2: 'bar' }, 456],
        array: [{ key1: 'foo', key2: 'bar' }, null],
        other: 'foo',
      };
      const dataset: FailureDataset<ObjectIssue> = {
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: null,
            expected: 'Object',
            received: 'null',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'array',
                value: input.array,
              },
              {
                type: 'array',
                origin: 'value',
                input: input.array,
                key: 1,
                value: input.array[1],
              },
            ],
          },
        ],
      };
      expect(_isPartiallyTyped(dataset, paths)).toBe(false);
    });
  });

  describe('should return true', () => {
    test('if there are no issues', () => {
      const input: Input = {
        nested: { key1: 'foo', key2: 'bar' },
        tuple: [123, { key1: 'foo', key2: 'bar' }, 456],
        array: [{ key1: 'foo', key2: 'bar' }],
        other: 'foo',
      };
      const dataset: SuccessDataset<Input> = {
        typed: true,
        value: input,
      };
      expect(_isPartiallyTyped(dataset, paths)).toBe(true);
    });

    test('if only unselected paths are untyped', () => {
      const input = {
        nested: { key: 'foo' },
        tuple: [123, { key: 'baz' }, null],
        array: [{ key: 'foo' }, { key: 'bar' }],
        other: null,
      };
      const dataset: FailureDataset<NumberIssue | StringIssue> = {
        typed: false,
        value: input,
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'number',
            input: null,
            expected: 'number',
            received: 'null',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'tuple',
                value: input.tuple,
              },
              {
                type: 'array',
                origin: 'value',
                input: input.tuple,
                key: 2,
                value: input.tuple[2],
              },
            ],
          },
          {
            ...baseInfo,
            kind: 'schema',
            type: 'string',
            input: null,
            expected: 'string',
            received: 'null',
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'other',
                value: input.other,
              },
            ],
          },
        ],
      };
      expect(_isPartiallyTyped(dataset, paths)).toBe(true);
    });
  });
});
