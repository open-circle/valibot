import { describe, expect, test } from 'vitest';
import { description, title } from '../../actions/index.ts';
import { string } from '../../schemas/index.ts';
import { pipe } from '../pipe/index.ts';
import { getDescription } from './getDescription.ts';

describe('getDescription', () => {
  test('should return undefined', () => {
    expect(getDescription(string())).toBeUndefined();
    expect(getDescription(pipe(string()))).toBeUndefined();
    expect(getDescription(pipe(string(), title('foo')))).toBeUndefined();
  });

  test('should return description', () => {
    expect(getDescription(pipe(string(), description('foo')))).toBe('foo');
    expect(
      getDescription(pipe(string(), description('foo'), description('bar')))
    ).toBe('bar');
    expect(
      getDescription(
        pipe(pipe(string(), description('foo')), description('bar'))
      )
    ).toBe('bar');
    expect(
      getDescription(
        pipe(string(), description('foo'), pipe(string(), description('bar')))
      )
    ).toBe('foo');
  });
});
