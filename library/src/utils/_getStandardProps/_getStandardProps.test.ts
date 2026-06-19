import { describe, expect, test } from 'vitest';
import { checkAsync, email, endsWith, nonEmpty } from '../../actions/index.ts';
import { pipe, pipeAsync } from '../../methods/index.ts';
import { array, object, string } from '../../schemas/index.ts';
import { deleteGlobalConfig, setGlobalConfig } from '../../storages/index.ts';
import type {
  StandardFailureResult,
  StandardProps,
  StandardSuccessResult,
} from '../../types/index.ts';
import { _getStandardProps } from './_getStandardProps.ts';

describe('_getStandardProps', () => {
  test('should return spec properties', () => {
    expect(_getStandardProps(string())).toStrictEqual({
      version: 1,
      vendor: 'valibot',
      validate: expect.any(Function),
    } satisfies StandardProps<string, string>);
  });

  test('should validate simple input', () => {
    const props = _getStandardProps(string());
    expect(props.validate('foo')).toMatchObject({
      value: 'foo',
    } satisfies StandardSuccessResult<string>);
    expect(props.validate(null)).toMatchObject({
      issues: [
        {
          message: 'Invalid type: Expected string but received null',
        },
      ],
    } satisfies StandardFailureResult);
    expect(props.validate(123)).toMatchObject({
      issues: [
        {
          message: 'Invalid type: Expected string but received 123',
        },
      ],
    } satisfies StandardFailureResult);
  });

  test('should validate complex input', () => {
    const props = _getStandardProps(
      object({ nested: array(object({ key: string() })) })
    );
    const input1 = { nested: [{ key: 'foo' }, { key: 'bar' }] };
    expect(props.validate(input1)).toMatchObject({
      value: input1,
    } satisfies StandardSuccessResult<{ nested: { key: string }[] }>);
    const input2 = { nested: [{ key: 'foo' }, { key: 123 }] };
    expect(props.validate(input2)).toMatchObject({
      issues: [
        {
          message: 'Invalid type: Expected string but received 123',
          path: [{ key: 'nested' }, { key: 1 }, { key: 'key' }],
        },
      ],
    } satisfies StandardFailureResult);
  });

  test('should return mutually exclusive result (#1343)', () => {
    // The Standard Schema contract requires a discriminated union: a failure
    // result must expose only `issues`, never `value` or Valibot's `typed`.
    const props = _getStandardProps(
      object({ first: string(), second: pipe(string(), nonEmpty()) })
    );

    const failure = props.validate({ first: '', second: '' });
    expect(failure).not.toHaveProperty('value');
    expect(failure).not.toHaveProperty('typed');
    expect(failure).toHaveProperty('issues');

    const success = props.validate({ first: 'a', second: 'b' });
    expect(success).not.toHaveProperty('issues');
    expect(success).not.toHaveProperty('typed');
    expect(success).toStrictEqual({ value: { first: 'a', second: 'b' } });
  });

  test('should return mutually exclusive result for async schema (#1343)', async () => {
    const props = _getStandardProps(
      pipeAsync(
        string(),
        checkAsync(async (input) => input.length > 0)
      )
    );

    const failure = await props.validate('');
    expect(failure).not.toHaveProperty('value');
    expect(failure).not.toHaveProperty('typed');
    expect(failure).toHaveProperty('issues');

    const success = await props.validate('foo');
    expect(success).toStrictEqual({ value: 'foo' });
  });

  test('should use global config', () => {
    const props = _getStandardProps(
      pipe(string(), email(), endsWith('@example.com'))
    );
    expect(props.validate('foo')).toMatchObject({
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
    expect(props.validate('foo')).toMatchObject({
      issues: [
        {
          message: 'Invalid email: Received "foo"',
        },
      ],
    } satisfies StandardFailureResult);
    deleteGlobalConfig();
  });
});
