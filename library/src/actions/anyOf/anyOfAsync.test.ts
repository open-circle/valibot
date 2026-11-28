import { describe, expect, test, vi } from 'vitest';
import {
  anyOfAsync,
  check,
  checkAsync,
  email,
  minLength,
  parseAsync,
  pipeAsync,
  safeParseAsync,
  string,
  toNumber,
  transformAsync,
  url,
} from '../../index.ts';

describe('anyOfAsync', () => {
  test('should await each alternative before starting the next', async () => {
    const pending = Promise.withResolvers<boolean>();
    const first = vi.fn(() => pending.promise);
    const convert = vi.fn((value: string) => Promise.resolve(value.length));
    const last = vi.fn(() => true);
    const options = [
      checkAsync(first),
      transformAsync(convert),
      check(last),
    ] as const;
    const action = anyOfAsync(options);
    expect(action).toMatchObject({
      async: true,
      kind: 'validation',
      type: 'any_of',
      reference: anyOfAsync,
      options,
    });
    const result = action['~run']({ typed: true, value: 'abc' }, {});
    expect(first).toHaveBeenCalledOnce();
    expect(convert).not.toHaveBeenCalled();
    pending.resolve(false);
    await expect(result).resolves.toEqual({ typed: true, value: 3 });
    expect(convert).toHaveBeenCalledWith('abc');
    expect(last).not.toHaveBeenCalled();
  });

  test('should skip an async lookup after a sync match', async () => {
    const lookup = vi.fn(() => Promise.resolve(false));
    const schema = pipeAsync(
      string(),
      anyOfAsync([email(), checkAsync(lookup)])
    );
    await expect(parseAsync(schema, 'a@example.com')).resolves.toBe(
      'a@example.com'
    );
    expect(lookup).not.toHaveBeenCalled();
  });

  test('should aggregate failures in order and preserve the original input', async () => {
    const matches = vi.fn(() => Promise.resolve(false));
    const schema = pipeAsync(
      string(),
      anyOfAsync([toNumber(), checkAsync(matches, 'unknown id')], (issue) =>
        issue.issues.map((child) => child.type).join(', ')
      )
    );
    const result = await safeParseAsync(schema, 'abc', { abortEarly: true });
    expect(matches).toHaveBeenCalledWith('abc');
    expect(result).toMatchObject({
      typed: true,
      success: false,
      output: 'abc',
      issues: [
        {
          type: 'any_of',
          message: 'to_number, check',
          issues: [
            { type: 'to_number', abortEarly: true },
            { type: 'check', message: 'unknown id', abortEarly: true },
          ],
        },
      ],
    });
  });

  test('should preserve earlier issues after an async validation succeeds', async () => {
    const matches = vi.fn(() => Promise.resolve(true));
    const schema = pipeAsync(
      string(),
      minLength(4),
      anyOfAsync([email(), checkAsync(matches)])
    );
    const result = await safeParseAsync(schema, 'x');
    expect(matches).toHaveBeenCalledWith('x');
    expect(result).toMatchObject({
      typed: true,
      success: false,
      output: 'x',
      issues: [{ type: 'min_length' }],
    });
  });

  test('should skip the lookup when the input schema fails', async () => {
    const matches = vi.fn(() => Promise.resolve(true));
    const schema = pipeAsync(
      string(),
      anyOfAsync([checkAsync(matches), email()])
    );
    const result = await safeParseAsync(schema, null);
    expect(result).toMatchObject({
      typed: false,
      issues: [{ type: 'string' }],
    });
    expect(matches).not.toHaveBeenCalled();
  });

  test('should keep an all-untyped failure untyped', async () => {
    const result = await safeParseAsync(
      pipeAsync(string(), anyOfAsync([toNumber(), toNumber()])),
      'abc'
    );
    expect(result).toMatchObject({
      typed: false,
      success: false,
      output: 'abc',
    });
  });

  test('should respect transformation boundaries inside nested async alternatives', async () => {
    const convert = vi.fn((value: string) => Promise.resolve(value.length));
    const schema = pipeAsync(
      string(),
      minLength(4),
      anyOfAsync([url(), anyOfAsync([email(), transformAsync(convert)])])
    );
    const result = await safeParseAsync(schema, 'x');
    expect(result).toMatchObject({
      typed: false,
      success: false,
      issues: [{ type: 'min_length' }],
    });
    expect(convert).not.toHaveBeenCalled();
  });

  test('should propagate a rejected promise without running later options', async () => {
    const error = new Error('lookup failed');
    const fallback = vi.fn(() => true);
    const schema = pipeAsync(
      string(),
      anyOfAsync([checkAsync(() => Promise.reject(error)), check(fallback)])
    );
    await expect(safeParseAsync(schema, 'abc')).rejects.toBe(error);
    expect(fallback).not.toHaveBeenCalled();
  });
});
