import { describe, expect, test, vi } from 'vitest';
import { _getGraphemeCount } from './_getGraphemeCount.ts';

describe('_getGraphemeCount', () => {
  test('without segmenting an empty input', () => {
    const segmentSpy = vi.spyOn(Intl.Segmenter.prototype, 'segment');
    try {
      expect(_getGraphemeCount('', Infinity)).toBe(0);
      expect(segmentSpy).not.toHaveBeenCalled();
    } finally {
      segmentSpy.mockRestore();
    }
  });

  test('should return grapheme count', () => {
    expect(_getGraphemeCount('hello world', Infinity)).toBe(11);
    expect(_getGraphemeCount('😀', Infinity)).toBe(1);
    expect(_getGraphemeCount('🧑🏻‍💻', Infinity)).toBe(1);
    expect(_getGraphemeCount('𝄞', Infinity)).toBe(1);
    expect(_getGraphemeCount('สวัสดี', Infinity)).toBe(4);
  });

  test('should stop at the limit', () => {
    expect(_getGraphemeCount('hello world', 5)).toBe(5);
    expect(_getGraphemeCount('hi', 5)).toBe(2);
  });
});
