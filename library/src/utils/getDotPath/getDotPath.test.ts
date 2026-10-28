import { describe, expect, test } from 'vitest';
import type { BaseIssue } from '../../types/index.ts';
import { getDotPath } from './getDotPath.ts';

describe('getDotPath', () => {
  test.each([
    [[''], ''],
    [['', 'leaf'], '.leaf'],
    [['', '', 'leaf'], '..leaf'],
    [['parent', ''], 'parent.'],
    [[0, 'leaf'], '0.leaf'],
  ] as const)('should preserve every segment of %j', (keys, expected) => {
    const issue: BaseIssue<unknown> = {
      kind: 'schema',
      type: 'string',
      input: 123,
      expected: 'string',
      received: '123',
      message: 'Invalid type: Expected string but received 123',
      path: keys.map((key) => ({
        type: 'unknown',
        origin: 'value',
        input: {},
        key,
        value: 123,
      })) as NonNullable<BaseIssue<unknown>['path']>,
    };
    expect(getDotPath(issue)).toBe(expected);
  });

  test('should return null if path is undefined', () => {
    expect(
      getDotPath({
        kind: 'schema',
        type: 'string',
        input: undefined,
        expected: 'string',
        received: 'undefined',
        message: 'Invalid type: Expected string but received undefined',
        path: undefined,
      })
    ).toBeNull();
  });

  test('should return null if path contains item without key', () => {
    expect(
      getDotPath({
        kind: 'schema',
        type: 'string',
        input: 123,
        expected: 'string',
        received: '123',
        message: 'Invalid type: Expected string but received 123',
        path: [
          {
            type: 'set',
            origin: 'value',
            input: new Set(['foo', 123, 'baz', null]),
            key: null,
            value: 123,
          },
        ],
      })
    ).toBeNull();
  });

  test('should return null if path contains key that is not string or number', () => {
    const key = new Map<string, string>([['foo', 'bar']]);
    const input = new Map<Map<string, string>, { title: unknown }>([
      [key, { title: 123 }],
    ]);
    expect(
      getDotPath({
        kind: 'schema',
        type: 'string',
        input: 123,
        expected: 'string',
        received: '123',
        message: 'Invalid type: Expected string but received 123',
        path: [
          {
            type: 'map',
            origin: 'value',
            input,
            key,
            value: input.get(key),
          },
          {
            type: 'object',
            origin: 'value',
            input: input.get(key)!,
            key: 'title',
            value: input.get(key)!.title,
          },
        ],
      })
    ).toBeNull();
  });

  test('should return the dot path if it can be created', () => {
    const input = { nested: [{ dot: [{ path: undefined }] }] };
    expect(
      getDotPath({
        kind: 'schema',
        type: 'number',
        input: undefined,
        expected: 'number',
        received: 'undefined',
        message: 'Invalid type: Expected number but received undefined',
        path: [
          {
            type: 'object',
            origin: 'value',
            input,
            key: 'nested',
            value: input.nested,
          },
          {
            type: 'array',
            origin: 'value',
            input: input.nested,
            key: 0,
            value: input.nested[0],
          },
          {
            type: 'object',
            origin: 'value',
            input: input.nested[0],
            key: 'dot',
            value: input.nested[0].dot,
          },
          {
            type: 'array',
            origin: 'value',
            input: input.nested[0].dot,
            key: 0,
            value: input.nested[0].dot[0],
          },
          {
            type: 'object',
            origin: 'value',
            input: input.nested[0].dot[0],
            key: 'path',
            value: input.nested[0].dot[0].path,
          },
        ],
      })
    ).toBe('nested.0.dot.0.path');
  });
});
