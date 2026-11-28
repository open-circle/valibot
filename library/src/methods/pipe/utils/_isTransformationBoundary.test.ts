import { describe, expect, test } from 'vitest';
import {
  anyOf,
  anyOfAsync,
  checkAsync,
  email,
  string,
  toNumber,
  url,
} from '../../../index.ts';
import { _isTransformationBoundary } from './_isTransformationBoundary.ts';

describe('_isTransformationBoundary', () => {
  test('should stop at a schema or transformation', () => {
    expect(_isTransformationBoundary(string())).toBe(true);
    expect(_isTransformationBoundary(toNumber())).toBe(true);
  });

  test('should inspect nested alternatives even when the transformation is last', () => {
    expect(
      _isTransformationBoundary(
        anyOfAsync([email(), anyOf([url(), toNumber()])])
      )
    ).toBe(true);
  });

  test('should continue through nested validations even when async', () => {
    expect(
      _isTransformationBoundary(
        anyOfAsync([anyOf([email(), url()]), checkAsync(() => true)])
      )
    ).toBe(false);
  });
});
