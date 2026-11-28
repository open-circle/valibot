import { describe, expect, test, vi } from 'vitest';
import { email, endsWith, transformAsync } from '../../actions/index.ts';
import {
  cache,
  cacheAsync,
  config,
  fallback,
  fallbackAsync,
  message,
  partialAsync,
  pick,
  pipe,
  pipeAsync,
  requiredAsync,
} from '../../methods/index.ts';
import {
  array,
  object,
  objectAsync,
  optionalAsync,
  string,
} from '../../schemas/index.ts';
import { deleteGlobalConfig, setGlobalConfig } from '../../storages/index.ts';
import type {
  StandardFailureResult,
  StandardProps,
  StandardSuccessResult,
} from '../../types/index.ts';
import { _standardSchema } from './_standardSchema.ts';

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

  test('should attach an enumerable data property to the same schema', () => {
    const schema = string();
    const props = schema['~standard'];
    expect(_standardSchema(schema)).toBe(schema);
    expect(schema['~standard']).not.toBe(props);
    expect(Object.getOwnPropertyDescriptor(schema, '~standard')).toStrictEqual({
      value: schema['~standard'],
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });

  test('should validate transformed async output when destructured', async () => {
    const schema = pipeAsync(
      string(),
      transformAsync(async (input) => input.length)
    );
    const { validate } = schema['~standard'];
    await expect(validate('foo')).resolves.toMatchObject({ value: 3 });
    await expect(validate(null)).resolves.toMatchObject({
      issues: [{ type: 'string' }],
    });
  });

  test.each([
    ['fallback', () => fallback(string(), 'default')],
    [
      'fallbackAsync with sync schema',
      () => fallbackAsync(string(), async () => 'default'),
    ],
    [
      'fallbackAsync with async schema',
      () => fallbackAsync(pipeAsync(string()), async () => 'default'),
    ],
  ])('should use %s through standard validation', async (_, createSchema) => {
    const { validate } = createSchema()['~standard'];
    expect(await validate(null)).toMatchObject({ value: 'default' });
    expect(await validate('foo')).toMatchObject({ value: 'foo' });
  });

  test.each([
    ['message', () => message(string(), 'custom message')],
    ['config', () => config(string(), { message: 'custom message' })],
  ])('should use %s through standard validation', async (_, createSchema) => {
    const { validate } = createSchema()['~standard'];
    expect(await validate(null)).toMatchObject({
      issues: [{ message: 'custom message' }],
    });
  });

  test.each([
    ['cache', cache],
    ['cacheAsync', cacheAsync],
  ])('should use %s through standard validation', async (_, wrapSchema) => {
    const source = string();
    const run = vi.spyOn(source, '~run');
    const { validate } = wrapSchema(source)['~standard'];
    expect(await validate('foo')).toMatchObject({ value: 'foo' });
    expect(await validate('foo')).toMatchObject({ value: 'foo' });
    expect(run).toHaveBeenCalledTimes(1);
  });

  test('should validate picked entries without modifying the source', () => {
    const source = object({ foo: string(), bar: string() });
    const { validate } = pick(source, ['foo'])['~standard'];
    expect(validate({ foo: 'foo' })).toMatchObject({ value: { foo: 'foo' } });
    expect(source['~standard'].validate({ foo: 'foo' })).toMatchObject({
      issues: [{ path: [{ key: 'bar' }] }],
    });
  });

  test('should validate partial async entries', async () => {
    const source = objectAsync({ foo: string() });
    const { validate } = partialAsync(source)['~standard'];
    await expect(validate({})).resolves.toMatchObject({ value: {} });
    await expect(source['~standard'].validate({})).resolves.toMatchObject({
      issues: [{ path: [{ key: 'foo' }] }],
    });
  });

  test('should validate required async entries', async () => {
    const source = objectAsync({ foo: optionalAsync(string()) });
    const { validate } = requiredAsync(source)['~standard'];
    await expect(validate({})).resolves.toMatchObject({
      issues: [{ path: [{ key: 'foo' }] }],
    });
    await expect(source['~standard'].validate({})).resolves.toMatchObject({
      value: {},
    });
  });
});
