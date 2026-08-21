import { describe, expect, test } from 'vitest';
import { email, endsWith } from '../../actions/index.ts';
import { pipe } from '../../methods/index.ts';
import { array, object, string } from '../../schemas/index.ts';
import { deleteGlobalConfig, setGlobalConfig } from '../../storages/index.ts';
import type {
  StandardFailureResult,
  StandardProps,
  StandardSuccessResult,
} from '../../types/index.ts';

describe('_standardSchema', () => {
  test('should return spec properties', () => {
    expect(string()['~standard']).toStrictEqual({
      version: 1,
      vendor: 'valibot',
      validate: expect.any(Function),
    } satisfies StandardProps<string, string>);
  });

  test('should return same object on repeated access', () => {
    const schema = string();
    expect(schema['~standard']).toBe(schema['~standard']);
  });

  test('should validate simple input', () => {
    const { validate } = string()['~standard'];
    expect(validate('foo')).toMatchObject({
      value: 'foo',
    } satisfies StandardSuccessResult<string>);
    expect(validate(null)).toMatchObject({
      issues: [
        {
          message: 'Invalid type: Expected string but received null',
        },
      ],
    } satisfies StandardFailureResult);
    expect(validate(123)).toMatchObject({
      issues: [
        {
          message: 'Invalid type: Expected string but received 123',
        },
      ],
    } satisfies StandardFailureResult);
  });

  test('should validate complex input', () => {
    const { validate } = object({
      nested: array(object({ key: string() })),
    })['~standard'];
    const input1 = { nested: [{ key: 'foo' }, { key: 'bar' }] };
    expect(validate(input1)).toMatchObject({
      value: input1,
    } satisfies StandardSuccessResult<{ nested: { key: string }[] }>);
    const input2 = { nested: [{ key: 'foo' }, { key: 123 }] };
    expect(validate(input2)).toMatchObject({
      issues: [
        {
          message: 'Invalid type: Expected string but received 123',
          path: [{ key: 'nested' }, { key: 1 }, { key: 'key' }],
        },
      ],
    } satisfies StandardFailureResult);
  });

  test('should use global config', () => {
    const { validate } = pipe(string(), email(), endsWith('@example.com'))[
      '~standard'
    ];
    expect(validate('foo')).toMatchObject({
      issues: [
        {
          message: 'Invalid email: Received "foo"',
        },
        {
          message: 'Invalid end: Expected "@example.com" but received "foo"',
        },
      ],
    } satisfies StandardFailureResult);
    setGlobalConfig({ abortPipeEarly: true });
    expect(validate('foo')).toMatchObject({
      issues: [
        {
          message: 'Invalid email: Received "foo"',
        },
      ],
    } satisfies StandardFailureResult);
    deleteGlobalConfig();
  });
});
