import { describe, expect, test } from 'vitest';
import { description, title } from '../../actions/index.ts';
import { string } from '../../schemas/index.ts';
import { pipe } from '../pipe/index.ts';
import { getTitle } from './getTitle.ts';

describe('getTitle', () => {
  test('should return undefined', () => {
    expect(getTitle(string())).toBeUndefined();
    expect(getTitle(pipe(string()))).toBeUndefined();
    expect(getTitle(pipe(string(), description('foo')))).toBeUndefined();
  });

  test('should return title', () => {
    expect(getTitle(pipe(string(), title('foo')))).toBe('foo');
    expect(getTitle(pipe(string(), title('foo'), title('bar')))).toBe('bar');
    expect(getTitle(pipe(pipe(string(), title('foo')), title('bar')))).toBe(
      'bar'
    );
    expect(
      getTitle(pipe(string(), title('foo'), pipe(string(), title('bar'))))
    ).toBe('foo');
  });
});
