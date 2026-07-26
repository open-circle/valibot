import { describe, expect, test } from 'vitest';
import { flavor, type FlavorAction } from './flavor.ts';

describe('flavor', () => {
  test('should return action object', () => {
    expect(flavor('foo')).toStrictEqual({
      kind: 'transformation',
      type: 'flavor',
      reference: flavor,
      name: 'foo',
      async: false,
      '~run': expect.any(Function),
    } satisfies FlavorAction<string, 'foo'>);
  });

  test('should return same dataset', () => {
    const dataset = { typed: true, value: 'foo' } as const;
    expect(flavor('foo')['~run'](dataset, {})).toStrictEqual(dataset);
  });
});
