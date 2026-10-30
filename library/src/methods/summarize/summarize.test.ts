import { describe, expect, test } from 'vitest';
import type { IncludesIssue, MinLengthIssue } from '../../actions/index.ts';
import type {
  BooleanIssue,
  LiteralIssue,
  NumberIssue,
  ObjectIssue,
  StringIssue,
  UnionIssue,
} from '../../schemas/index.ts';
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

  test('should return sub issues with path below parent issue', () => {
    const input = { type: 'unknown', role: 123, age: 'invalid' };
    const unionIssue: UnionIssue<LiteralIssue | StringIssue | NumberIssue> = {
      ...commonIssueInfo,
      kind: 'schema',
      type: 'union',
      input,
      expected: 'Object',
      received: 'Object',
      message: 'Invalid type: Expected Object but received Object',
      path: undefined,
      issues: [
        {
          ...commonIssueInfo,
          kind: 'schema',
          type: 'literal',
          input: 'unknown',
          expected: '"admin"',
          received: '"unknown"',
          message: 'Invalid type: Expected "admin" but received "unknown"',
          path: [
            {
              type: 'object',
              origin: 'value',
              input,
              key: 'type',
              value: input.type,
            } satisfies ObjectPathItem,
          ],
        },
        {
          ...commonIssueInfo,
          kind: 'schema',
          type: 'string',
          input: 123,
          expected: 'string',
          received: '123',
          message: 'Invalid type: Expected string but received 123',
          path: [
            {
              type: 'object',
              origin: 'value',
              input,
              key: 'role',
              value: input.role,
            } satisfies ObjectPathItem,
          ],
        },
        {
          ...commonIssueInfo,
          kind: 'schema',
          type: 'literal',
          input: 'unknown',
          expected: '"user"',
          received: '"unknown"',
          message: 'Invalid type: Expected "user" but received "unknown"',
          path: [
            {
              type: 'object',
              origin: 'value',
              input,
              key: 'type',
              value: input.type,
            } satisfies ObjectPathItem,
          ],
        },
        {
          ...commonIssueInfo,
          kind: 'schema',
          type: 'number',
          input: 'invalid',
          expected: 'number',
          received: '"invalid"',
          message: 'Invalid type: Expected number but received "invalid"',
          path: [
            {
              type: 'object',
              origin: 'value',
              input,
              key: 'age',
              value: input.age,
            } satisfies ObjectPathItem,
          ],
        },
      ],
    };
    expect(summarize([unionIssue])).toBe(
      '× Invalid type: Expected Object but received Object\n' +
        '  × Invalid type: Expected "admin" but received "unknown"\n' +
        '    → at type\n' +
        '  × Invalid type: Expected string but received 123\n' +
        '    → at role\n' +
        '  × Invalid type: Expected "user" but received "unknown"\n' +
        '    → at type\n' +
        '  × Invalid type: Expected number but received "invalid"\n' +
        '    → at age'
    );
  });

  test('should skip sub issues without path', () => {
    const unionIssue: UnionIssue<StringIssue | NumberIssue | BooleanIssue> = {
      ...commonIssueInfo,
      kind: 'schema',
      type: 'union',
      input: null,
      expected: '(string | number | boolean)',
      received: 'null',
      message:
        'Invalid type: Expected (string | number | boolean) but received null',
      path: undefined,
      issues: [
        {
          ...commonIssueInfo,
          kind: 'schema',
          type: 'string',
          input: null,
          expected: 'string',
          received: 'null',
          message: 'Invalid type: Expected string but received null',
          path: undefined,
        },
        {
          ...commonIssueInfo,
          kind: 'schema',
          type: 'number',
          input: null,
          expected: 'number',
          received: 'null',
          message: 'Invalid type: Expected number but received null',
          path: undefined,
        },
        {
          ...commonIssueInfo,
          kind: 'schema',
          type: 'boolean',
          input: null,
          expected: 'boolean',
          received: 'null',
          message: 'Invalid type: Expected boolean but received null',
          path: undefined,
        },
      ],
    };
    expect(summarize([unionIssue])).toBe(
      '× Invalid type: Expected (string | number | boolean) but received null'
    );
  });

  test('should prepend path of parent issue to path of sub issues', () => {
    const input = { user: { user: { age: 'invalid' } } };
    const unionIssue: UnionIssue<ObjectIssue | NumberIssue> = {
      ...commonIssueInfo,
      kind: 'schema',
      type: 'union',
      input: input.user,
      expected: 'Object',
      received: 'Object',
      message: 'Invalid type: Expected Object but received Object',
      path: [
        {
          type: 'object',
          origin: 'value',
          input,
          key: 'user',
          value: input.user,
        } satisfies ObjectPathItem,
      ],
      issues: [
        {
          ...commonIssueInfo,
          kind: 'schema',
          type: 'object',
          input: undefined,
          expected: '"admin"',
          received: 'undefined',
          message: 'Invalid key: Expected "admin" but received undefined',
          path: [
            {
              type: 'object',
              origin: 'key',
              input: input.user,
              key: 'admin',
              value: undefined,
            } satisfies ObjectPathItem,
          ],
        },
        {
          ...commonIssueInfo,
          kind: 'schema',
          type: 'number',
          input: 'invalid',
          expected: 'number',
          received: '"invalid"',
          message: 'Invalid type: Expected number but received "invalid"',
          path: [
            {
              type: 'object',
              origin: 'value',
              input: input.user,
              key: 'user',
              value: input.user.user,
            } satisfies ObjectPathItem,
            {
              type: 'object',
              origin: 'value',
              input: input.user.user,
              key: 'age',
              value: input.user.user.age,
            } satisfies ObjectPathItem,
          ],
        },
      ],
    };
    expect(summarize([unionIssue])).toBe(
      '× Invalid type: Expected Object but received Object\n' +
        '  → at user\n' +
        '  × Invalid key: Expected "admin" but received undefined\n' +
        '    → at user.admin\n' +
        '  × Invalid type: Expected number but received "invalid"\n' +
        '    → at user.user.age'
    );
  });

  test('should return sub issues with path of sub issues without path', () => {
    const input = { user: { a: 1, b: 'invalid', c: 'invalid' } };
    const unionIssue: UnionIssue<
      UnionIssue<StringIssue | NumberIssue> | BooleanIssue
    > = {
      ...commonIssueInfo,
      kind: 'schema',
      type: 'union',
      input: input.user,
      expected: 'Object',
      received: 'Object',
      message: 'Invalid type: Expected Object but received Object',
      path: [
        {
          type: 'object',
          origin: 'value',
          input,
          key: 'user',
          value: input.user,
        } satisfies ObjectPathItem,
      ],
      issues: [
        {
          ...commonIssueInfo,
          kind: 'schema',
          type: 'union',
          input: input.user,
          expected: 'Object',
          received: 'Object',
          message: 'Invalid type: Expected Object but received Object',
          path: undefined,
          issues: [
            {
              ...commonIssueInfo,
              kind: 'schema',
              type: 'string',
              input: 1,
              expected: 'string',
              received: '1',
              message: 'Invalid type: Expected string but received 1',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input.user,
                  key: 'a',
                  value: input.user.a,
                } satisfies ObjectPathItem,
              ],
            },
            {
              ...commonIssueInfo,
              kind: 'schema',
              type: 'number',
              input: 'invalid',
              expected: 'number',
              received: '"invalid"',
              message: 'Invalid type: Expected number but received "invalid"',
              path: [
                {
                  type: 'object',
                  origin: 'value',
                  input: input.user,
                  key: 'b',
                  value: input.user.b,
                } satisfies ObjectPathItem,
              ],
            },
          ],
        },
        {
          ...commonIssueInfo,
          kind: 'schema',
          type: 'boolean',
          input: 'invalid',
          expected: 'boolean',
          received: '"invalid"',
          message: 'Invalid type: Expected boolean but received "invalid"',
          path: [
            {
              type: 'object',
              origin: 'value',
              input: input.user,
              key: 'c',
              value: input.user.c,
            } satisfies ObjectPathItem,
          ],
        },
      ],
    };
    expect(summarize([unionIssue])).toBe(
      '× Invalid type: Expected Object but received Object\n' +
        '  → at user\n' +
        '  × Invalid type: Expected string but received 1\n' +
        '    → at user.a\n' +
        '  × Invalid type: Expected number but received "invalid"\n' +
        '    → at user.b\n' +
        '  × Invalid type: Expected boolean but received "invalid"\n' +
        '    → at user.c'
    );
  });
});
