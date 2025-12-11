import { describe, expect, test } from 'vitest';
import { checkAsync, transform } from '../../actions/index.ts';
import { number, objectAsync, string } from '../../schemas/index.ts';
import { pipe, pipeAsync } from '../pipe/index.ts';
import { parseAsync } from './parseAsync.ts';

describe('parseAsync', () => {
  const entries = {
    key: pipe(
      string(),
      transform((input) => input.length)
    ),
  };

  test('should return output for valid input', async () => {
    expect(await parseAsync(string(), 'hello')).toBe('hello');
    expect(await parseAsync(number(), 123)).toBe(123);
    expect(
      await parseAsync(objectAsync(entries), { key: 'foo' })
    ).toStrictEqual({
      key: 3,
    });
  });

  test('should throw error for invalid input', async () => {
    await expect(() => parseAsync(string(), 123)).rejects.toThrowError();
    await expect(() => parseAsync(number(), 'foo')).rejects.toThrowError();
    await expect(() =>
      parseAsync(objectAsync(entries), null)
    ).rejects.toThrowError();
  });

  describe('abortSignal', () => {
    test('should abort', async () => {
      const abort = new AbortController();
      const promise = expect(() =>
        parseAsync(
          pipeAsync(
            string(),
            checkAsync(async (_, signal) => {
              await 0;
              signal?.throwIfAborted();
              return true;
            })
          ),
          'foo',
          { signal: abort.signal }
        )
      ).rejects.toThrowError('abort');
      abort.abort('abort');
      await promise;
    });
  });
});
