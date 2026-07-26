import { describe, expect, test } from 'vitest';
import {
  check,
  type CheckIssue,
  type MinLengthIssue,
} from '../../actions/index.ts';
import type { PartialDataset, SuccessDataset } from '../../types/index.ts';
import { forward } from './forward.ts';

describe('forward', () => {
  test('should forward issues to end of path list', () => {
    const input = { nested: [{ key: 'value_1' }, { key: 'value_2' }] };
    type Input = typeof input;
    type Path = ['nested', 1, 'key'];
    const requirement = () => false;
    expect(
      forward<Input, CheckIssue<Input>, Path>(check(requirement, 'message'), [
        'nested',
        1,
        'key',
      ])['~run']({ typed: true, value: input }, {})
    ).toStrictEqual({
      typed: true,
      value: input,
      issues: [
        {
          kind: 'validation',
          type: 'check',
          input,
          expected: null,
          received: 'Object',
          message: 'message',
          path: [
            {
              type: 'unknown',
              origin: 'value',
              input: input,
              key: 'nested',
              value: input.nested,
            },
            {
              type: 'unknown',
              origin: 'value',
              input: input.nested,
              key: 1,
              value: input.nested[1],
            },
            {
              type: 'unknown',
              origin: 'value',
              input: input.nested[1],
              key: 'key',
              value: input.nested[1].key,
            },
          ],
          requirement,
          issues: undefined,
          lang: undefined,
          abortEarly: undefined,
          abortPipeEarly: undefined,
        },
      ],
    } satisfies PartialDataset<Input, CheckIssue<Input>>);
  });

  test('should stop forwarding if path input is undefined', () => {
    const input = { nested: [{ key: 'value_1' }, { key: 'value_2' }] };
    type Input = typeof input;
    type Path = ['nested', 6, 'key'];
    const requirement = () => false;
    expect(
      forward<Input, CheckIssue<Input>, Path>(check(requirement, 'message'), [
        'nested',
        6,
        'key',
      ])['~run']({ typed: true, value: input }, {})
    ).toStrictEqual({
      typed: true,
      value: input,
      issues: [
        {
          kind: 'validation',
          type: 'check',
          input,
          expected: null,
          received: 'Object',
          message: 'message',
          path: [
            {
              type: 'unknown',
              origin: 'value',
              input: input,
              key: 'nested',
              value: input.nested,
            },
            {
              type: 'unknown',
              origin: 'value',
              input: input.nested,
              key: 6,
              value: input.nested[6],
            },
          ],
          requirement,
          issues: undefined,
          lang: undefined,
          abortEarly: undefined,
          abortPipeEarly: undefined,
        },
      ],
    } satisfies PartialDataset<Input, CheckIssue<Input>>);
  });

  test('should only forward issues of wrapped action', () => {
    const input = { nested: [{ key: 'value_1' }, { key: 'value_2' }] };
    type Input = typeof input;
    type Path = ['nested', 1, 'key'];
    const requirement = () => false;
    const prevIssue: MinLengthIssue<Input['nested'], 3> = {
      kind: 'validation',
      type: 'min_length',
      input: input.nested,
      expected: '>=3',
      received: '2',
      message: 'message',
      path: [
        {
          type: 'object',
          origin: 'value',
          input: input,
          key: 'nested',
          value: input.nested,
        },
      ],
      requirement: 3,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };
    expect(
      forward<Input, CheckIssue<Input>, Path>(check(requirement, 'message'), [
        'nested',
        1,
        'key',
      ])['~run'](
        {
          typed: true,
          value: input,
          // Hint: We pass a copy of the previous issue to avoid accidentally
          // modifying our test data.
          issues: [{ ...prevIssue, path: [...prevIssue.path!] }],
        },
        {}
      )
    ).toStrictEqual({
      typed: true,
      value: input,
      issues: [
        prevIssue,
        {
          kind: 'validation',
          type: 'check',
          input,
          expected: null,
          received: 'Object',
          message: 'message',
          path: [
            {
              type: 'unknown',
              origin: 'value',
              input: input,
              key: 'nested',
              value: input.nested,
            },
            {
              type: 'unknown',
              origin: 'value',
              input: input.nested,
              key: 1,
              value: input.nested[1],
            },
            {
              type: 'unknown',
              origin: 'value',
              input: input.nested[1],
              key: 'key',
              value: input.nested[1].key,
            },
          ],
          requirement,
          issues: undefined,
          lang: undefined,
          abortEarly: undefined,
          abortPipeEarly: undefined,
        },
      ],
    } satisfies PartialDataset<
      Input,
      MinLengthIssue<Input['nested'], 3> | CheckIssue<Input>
    >);
  });

  test('should do nothing if there are no issues', () => {
    const input = { nested: [{ key: 'value_1' }, { key: 'value_2' }] };
    type Input = typeof input;
    type Path = ['nested', 6, 'key'];
    const requirement = () => true;
    expect(
      forward<Input, CheckIssue<Input>, Path>(check(requirement, 'message'), [
        'nested',
        6,
        'key',
      ])['~run']({ typed: true, value: input }, {})
    ).toStrictEqual({
      typed: true,
      value: input,
    } satisfies SuccessDataset<Input>);
  });
});
