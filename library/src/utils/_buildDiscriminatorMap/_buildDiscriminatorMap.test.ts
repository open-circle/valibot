import { describe, expect, test } from 'vitest';
import { enum as enum_ } from '../../schemas/enum/index.ts';
import { literal } from '../../schemas/literal/index.ts';
import { looseObject } from '../../schemas/looseObject/index.ts';
import { number } from '../../schemas/number/index.ts';
import { object, objectAsync } from '../../schemas/object/index.ts';
import { optional } from '../../schemas/optional/index.ts';
import { picklist } from '../../schemas/picklist/index.ts';
import { strictObject } from '../../schemas/strictObject/index.ts';
import { string } from '../../schemas/string/index.ts';
import { union } from '../../schemas/union/index.ts';
import { variant } from '../../schemas/variant/variant.ts';
import { _buildDiscriminatorMap } from './_buildDiscriminatorMap.ts';

describe('_buildDiscriminatorMap', () => {
  describe('should return map', () => {
    test('for literal discriminators', () => {
      const foo = object({ type: literal('foo') });
      const bar = strictObject({ type: literal('bar') });
      const baz = looseObject({ type: literal('baz') });
      expect(_buildDiscriminatorMap('type', [foo, bar, baz])).toStrictEqual(
        new Map<unknown, unknown>([
          ['foo', foo],
          ['bar', bar],
          ['baz', baz],
        ])
      );
    });

    test('for enum discriminators', () => {
      enum Direction {
        Left = 'left',
        Right = 'right',
      }
      const foo = object({ type: enum_(Direction) });
      const bar = object({ type: literal('up') });
      expect(_buildDiscriminatorMap('type', [foo, bar])).toStrictEqual(
        new Map<unknown, unknown>([
          ['left', foo],
          ['right', foo],
          ['up', bar],
        ])
      );
    });

    test('for picklist discriminators', () => {
      const foo = object({ type: picklist(['foo', 'foo2']) });
      const bar = object({ type: picklist(['bar']) });
      expect(_buildDiscriminatorMap('type', [foo, bar])).toStrictEqual(
        new Map<unknown, unknown>([
          ['foo', foo],
          ['foo2', foo],
          ['bar', bar],
        ])
      );
    });

    test('for NaN and -0 discriminators', () => {
      // `Map` keys use SameValueZero, the same comparison `literal`, `enum`
      // and `picklist` use
      const foo = object({ type: literal(NaN) });
      const bar = object({ type: literal(-0) });
      const map = _buildDiscriminatorMap('type', [foo, bar]);
      expect(map?.get(NaN)).toBe(foo);
      expect(map?.get(0)).toBe(bar);
      expect(map?.get(-0)).toBe(bar);
    });

    test('for non-string literal discriminators', () => {
      const foo = object({ type: literal(1) });
      const bar = object({ type: literal(true) });
      expect(_buildDiscriminatorMap('type', [foo, bar])).toStrictEqual(
        new Map<unknown, unknown>([
          [1, foo],
          [true, bar],
        ])
      );
    });

    test('for async options', () => {
      const foo = objectAsync({ type: literal('foo') });
      const bar = object({ type: literal('bar') });
      expect(_buildDiscriminatorMap('type', [foo, bar])).toStrictEqual(
        new Map<unknown, unknown>([
          ['foo', foo],
          ['bar', bar],
        ])
      );
    });

    test('for empty options', () => {
      expect(_buildDiscriminatorMap('type', [])).toStrictEqual(new Map());
    });
  });

  describe('should return null', () => {
    test('for nested variants', () => {
      expect(
        _buildDiscriminatorMap('type', [
          object({ type: literal('foo') }),
          variant('subType', [
            object({ type: literal('bar'), subType: literal('bar1') }),
          ]),
        ])
      ).toBeNull();
    });

    test('for missing discriminator key', () => {
      expect(
        _buildDiscriminatorMap('type', [
          object({ type: literal('foo') }),
          object({ other: literal('bar') }),
        ])
      ).toBeNull();
    });

    test('for non-enumerable discriminators', () => {
      expect(
        _buildDiscriminatorMap('type', [object({ type: string() })])
      ).toBeNull();
      expect(
        _buildDiscriminatorMap('type', [
          object({ type: optional(literal('foo')) }),
        ])
      ).toBeNull();
      expect(
        _buildDiscriminatorMap('type', [
          object({ type: union([literal('foo'), literal('bar')]) }),
        ])
      ).toBeNull();
    });

    test('for colliding discriminator values', () => {
      expect(
        _buildDiscriminatorMap('type', [
          object({ type: literal('foo') }),
          object({ type: literal('foo'), other: number() }),
        ])
      ).toBeNull();
      expect(
        _buildDiscriminatorMap('type', [
          object({ type: picklist(['foo', 'bar']) }),
          object({ type: literal('bar') }),
        ])
      ).toBeNull();
    });
  });
});
