import { describe, expect, test } from 'vitest';
import type {
  CheckIssue,
  IncludesIssue,
  MinLengthIssue,
  MinValueIssue,
} from '../../actions';
import type { NumberIssue, StringIssue } from '../../schemas';
import type { ArrayPathItem, ObjectPathItem, SetPathItem } from '../../types';
import { flatten } from './flatten.ts';

describe('flatten', () => {
  const commonIssueInfo = {
    abortEarly: undefined,
    abortPipeEarly: undefined,
    issues: undefined,
    lang: undefined,
  };

  test('should return empty object', () => {
    // @ts-expect-error
    expect(flatten([])).toStrictEqual({});
  });

  test('should return single root error', () => {
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
    expect(flatten(rootIssues1)).toStrictEqual({
      root: ['Invalid type: Expected string but received 123'],
    });
  });

  test('should return multiple root errors', () => {
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
    expect(flatten(rootIssues2)).toStrictEqual({
      root: [
        'Invalid content: Expected "foo" but received !"foo"',
        'Invalid length: Expected >=5 but received 3',
      ],
    });
  });

  test('should return single nested error', () => {
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
    expect(flatten([nestedIssue])).toStrictEqual({
      nested: {
        0: ['Invalid type: Expected number but received "1"'],
      },
    });
  });

  test('should return multiple nested errors', () => {
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
    expect(flatten(nestedIssues)).toStrictEqual({
      nested: {
        key1: [
          'Invalid content: Expected "foo" but received !"foo"',
          'Invalid length: Expected >=5 but received 3',
        ],
        key2: ['Invalid type: Expected number but received "21"'],
      },
    });
  });

  test('should return nested error with dot path', () => {
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
    expect(flatten([nestedIssue])).toStrictEqual({
      nested: {
        'dot.0.path': ['Invalid type: Expected number but received "foo"'],
      },
    });
  });

  test('should handle keys that collide with object prototype', () => {
    // Issue paths can contain keys (e.g. via `record`) that collide with
    // `Object.prototype` members like `toString`. These must be treated as
    // regular nested keys instead of resolving to the inherited member.
    const keys = [
      'toString',
      'valueOf',
      'hasOwnProperty',
      'constructor',
    ] as const;
    const issues = keys.map(
      (key): NumberIssue => ({
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
            input: { [key]: 'foo' },
            key,
            value: 'foo',
          } satisfies ObjectPathItem,
        ],
      })
    ) as [NumberIssue, ...NumberIssue[]];
    const flatErrors = flatten(issues);
    for (const key of keys) {
      expect(flatErrors.nested?.[key]).toEqual([
        'Invalid type: Expected number but received "foo"',
      ]);
    }
  });

  test('should accumulate messages for prototype-colliding keys', () => {
    const issue = (message: string): NumberIssue => ({
      ...commonIssueInfo,
      kind: 'schema',
      type: 'number',
      input: 'foo',
      expected: 'number',
      received: '"foo"',
      message,
      path: [
        {
          type: 'object',
          origin: 'value',
          input: { toString: 'foo' },
          key: 'toString',
          value: 'foo',
        } satisfies ObjectPathItem,
      ],
    });
    expect(flatten([issue('first'), issue('second')])).toStrictEqual({
      nested: {
        toString: ['first', 'second'],
      },
    });
  });

  test('should return single other error', () => {
    const otherIssue: NumberIssue = {
      ...commonIssueInfo,
      kind: 'schema',
      type: 'number',
      input: 'abc',
      expected: 'number',
      received: '"abc"',
      message: 'Invalid type: Expected number but received "abc"',
      path: [
        {
          type: 'set',
          origin: 'value',
          input: new Set(['abc']),
          key: null,
          value: 'abc',
        } satisfies SetPathItem,
      ],
    };

    expect(flatten([otherIssue])).toStrictEqual({
      other: ['Invalid type: Expected number but received "abc"'],
    });
  });

  test('should return multiple other errors', () => {
    const input = new Set(['abc']);
    const otherIssues: [
      IncludesIssue<string, 'bar'>,
      MinLengthIssue<string, 4>,
    ] = [
      {
        ...commonIssueInfo,
        kind: 'validation',
        type: 'includes',
        input: 'abc',
        received: '!"bar"',
        expected: '"bar"',
        message: 'Invalid content: Expected "bar" but received !"bar"',
        requirement: 'bar',
        path: [
          {
            type: 'set',
            origin: 'value',
            input,
            key: null,
            value: 'abc',
          } satisfies SetPathItem,
        ],
      },
      {
        ...commonIssueInfo,
        kind: 'validation',
        type: 'min_length',
        input: 'abc',
        expected: '>=4',
        received: '3',
        message: 'Invalid length: Expected >=4 but received 3',
        requirement: 4,
        path: [
          {
            type: 'set',
            origin: 'value',
            input,
            key: null,
            value: 'abc',
          } satisfies SetPathItem,
        ],
      },
    ];
    expect(flatten(otherIssues)).toStrictEqual({
      other: [
        'Invalid content: Expected "bar" but received !"bar"',
        'Invalid length: Expected >=4 but received 3',
      ],
    });
  });

  test('should return different kind of errors', () => {
    const input = { positiveValue: -1, positiveNums: new Set([-1]) };
    const issues: [
      MinValueIssue<number, 0>,
      MinValueIssue<number, 0>,
      CheckIssue<typeof input>,
    ] = [
      {
        ...commonIssueInfo,
        kind: 'validation',
        type: 'min_value',
        input: -1,
        received: '-1',
        expected: '>=0',
        message: 'Invalid value: Expected >=0 but received -1',
        requirement: 0,
        path: [
          {
            type: 'object',
            origin: 'value',
            input,
            key: 'positiveValue',
            value: -1,
          } satisfies ObjectPathItem,
        ],
      },
      {
        ...commonIssueInfo,
        kind: 'validation',
        type: 'min_value',
        input: -1,
        expected: '>=0',
        received: '-1',
        message: 'Invalid value: Expected >=0 but received -1',
        requirement: 0,
        path: [
          {
            type: 'object',
            origin: 'value',
            input,
            key: 'positiveNums',
            value: input['positiveNums'],
          },
          {
            type: 'set',
            origin: 'value',
            input: input['positiveNums'],
            key: null,
            value: -1,
          },
        ] satisfies [ObjectPathItem, SetPathItem],
      },
      {
        ...commonIssueInfo,
        kind: 'validation',
        type: 'check',
        input,
        expected: null,
        received: 'Object',
        requirement: () => false,
        message: 'Invalid input: Received Object',
      },
    ];
    expect(flatten(issues)).toStrictEqual({
      root: ['Invalid input: Received Object'],
      nested: {
        positiveValue: ['Invalid value: Expected >=0 but received -1'],
      },
      other: ['Invalid value: Expected >=0 but received -1'],
    });
  });
});
