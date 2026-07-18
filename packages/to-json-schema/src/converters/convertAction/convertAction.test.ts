import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { convertAction } from './convertAction.ts';

console.warn = vi.fn();

describe('convertAction', () => {
  test('should ignore specified actions', () => {
    expect(
      convertAction({}, v.email<string>(), { ignoreActions: ['email'] })
    ).toStrictEqual({});
    expect(
      convertAction({ type: 'string' }, v.email<string>(), {
        ignoreActions: ['email'],
      })
    ).toStrictEqual({
      type: 'string',
    });
  });

  test('should convert base64 action', () => {
    expect(convertAction({}, v.base64<string>(), undefined)).toStrictEqual({
      contentEncoding: 'base64',
    });
    expect(
      convertAction({ type: 'string' }, v.base64<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      contentEncoding: 'base64',
    });
  });

  test('should convert bic action', () => {
    expect(convertAction({}, v.bic<string>(), undefined)).toStrictEqual({
      pattern: v.BIC_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.bic<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.BIC_REGEX.source,
    });
  });

  test('should convert cuid2 action', () => {
    expect(convertAction({}, v.cuid2<string>(), undefined)).toStrictEqual({
      pattern: v.CUID2_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.cuid2<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.CUID2_REGEX.source,
    });
  });

  test('should convert decimal action', () => {
    expect(convertAction({}, v.decimal<string>(), undefined)).toStrictEqual({
      pattern: v.DECIMAL_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.decimal<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.DECIMAL_REGEX.source,
    });
  });

  test('should convert digits action', () => {
    expect(convertAction({}, v.digits<string>(), undefined)).toStrictEqual({
      pattern: v.DIGITS_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.digits<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.DIGITS_REGEX.source,
    });
  });

  test('should convert domain action', () => {
    expect(convertAction({}, v.domain<string>(), undefined)).toStrictEqual({
      pattern: v.DOMAIN_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.domain<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.DOMAIN_REGEX.source,
    });
  });

  test('should convert emoji action', () => {
    expect(convertAction({}, v.emoji<string>(), undefined)).toStrictEqual({
      pattern: v.EMOJI_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.emoji<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.EMOJI_REGEX.source,
    });
  });

  test('should convert hash action', () => {
    const action = v.hash(['md5']);
    expect(convertAction({ type: 'string' }, action, undefined)).toStrictEqual({
      type: 'string',
      pattern: action.requirement.source,
    });
  });

  test('should convert hexadecimal action', () => {
    expect(convertAction({}, v.hexadecimal<string>(), undefined)).toStrictEqual(
      {
        pattern: v.HEXADECIMAL_REGEX.source,
      }
    );
    expect(
      convertAction({ type: 'string' }, v.hexadecimal<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.HEXADECIMAL_REGEX.source,
    });
  });

  test('should convert hex color action', () => {
    expect(convertAction({}, v.hexColor<string>(), undefined)).toStrictEqual({
      pattern: v.HEX_COLOR_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.hexColor<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.HEX_COLOR_REGEX.source,
    });
  });

  test('should convert isrc action', () => {
    expect(convertAction({}, v.isrc<string>(), undefined)).toStrictEqual({
      pattern: v.ISRC_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.isrc<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.ISRC_REGEX.source,
    });
  });

  test('should convert iso time second action', () => {
    expect(
      convertAction({}, v.isoTimeSecond<string>(), undefined)
    ).toStrictEqual({
      pattern: v.ISO_TIME_SECOND_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.isoTimeSecond<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.ISO_TIME_SECOND_REGEX.source,
    });
  });

  test('should convert iso week action', () => {
    expect(convertAction({}, v.isoWeek<string>(), undefined)).toStrictEqual({
      pattern: v.ISO_WEEK_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.isoWeek<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.ISO_WEEK_REGEX.source,
    });
  });

  test('should convert mac action', () => {
    expect(convertAction({}, v.mac<string>(), undefined)).toStrictEqual({
      pattern: v.MAC_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.mac<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.MAC_REGEX.source,
    });
  });

  test('should convert mac48 action', () => {
    expect(convertAction({}, v.mac48<string>(), undefined)).toStrictEqual({
      pattern: v.MAC48_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.mac48<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.MAC48_REGEX.source,
    });
  });

  test('should convert mac64 action', () => {
    expect(convertAction({}, v.mac64<string>(), undefined)).toStrictEqual({
      pattern: v.MAC64_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.mac64<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.MAC64_REGEX.source,
    });
  });

  test('should convert Nano ID action', () => {
    expect(convertAction({}, v.nanoid<string>(), undefined)).toStrictEqual({
      pattern: v.NANO_ID_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.nanoid<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.NANO_ID_REGEX.source,
    });
  });

  test('should convert octal action', () => {
    expect(convertAction({}, v.octal<string>(), undefined)).toStrictEqual({
      pattern: v.OCTAL_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.octal<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.OCTAL_REGEX.source,
    });
  });

  test('should convert slug action', () => {
    expect(convertAction({}, v.slug<string>(), undefined)).toStrictEqual({
      pattern: v.SLUG_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.slug<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.SLUG_REGEX.source,
    });
  });

  test('should convert ULID action', () => {
    expect(convertAction({}, v.ulid<string>(), undefined)).toStrictEqual({
      pattern: v.ULID_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.ulid<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.ULID_REGEX.source,
    });
  });

  test('should convert description action', () => {
    expect(convertAction({}, v.description('test'), undefined)).toStrictEqual({
      description: 'test',
    });
  });

  test('should convert email action', () => {
    expect(convertAction({}, v.email<string>(), undefined)).toStrictEqual({
      format: 'email',
    });
    expect(
      convertAction({ type: 'string' }, v.email<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      format: 'email',
    });
  });

  test('should convert rfc email action', () => {
    expect(convertAction({}, v.rfcEmail<string>(), undefined)).toStrictEqual({
      format: 'email',
    });
    expect(
      convertAction({ type: 'string' }, v.rfcEmail<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      format: 'email',
    });
  });

  test('should convert ends with action', () => {
    expect(
      convertAction(
        { type: 'string' },
        v.endsWith<string, 'foo'>('foo'),
        undefined
      )
    ).toStrictEqual({
      type: 'string',
      pattern: 'foo$',
    });
  });

  test('should convert ends with action with special characters', () => {
    expect(
      convertAction(
        { type: 'string' },
        v.endsWith<string, '.com'>('.com'),
        undefined
      )
    ).toStrictEqual({
      type: 'string',
      pattern: '\\.com$',
    });
  });

  test('should throw error for pattern action with existing pattern', () => {
    const jsonSchema = convertAction(
      { type: 'string' },
      v.startsWith<string, 'pre'>('pre'),
      undefined
    );
    const error =
      'The "ends_with" action is not supported in combination with another regex action.';
    expect(() =>
      convertAction(jsonSchema, v.endsWith<string, 'suf'>('suf'), undefined)
    ).toThrowError(error);
  });

  test('should convert empty action for strings', () => {
    expect(
      convertAction({ type: 'string' }, v.empty(), undefined)
    ).toStrictEqual({
      type: 'string',
      maxLength: 0,
    });
  });

  test('should convert empty action for arrays', () => {
    expect(
      convertAction({ type: 'array' }, v.empty(), undefined)
    ).toStrictEqual({
      type: 'array',
      maxItems: 0,
    });
  });

  test('should throw error for empty action with invalid type', () => {
    const action = v.empty();
    const error1 = 'The "empty" action is not supported on type "undefined".';
    expect(() => convertAction({}, action, undefined)).toThrowError(error1);
    expect(() =>
      convertAction({}, action, { errorMode: 'throw' })
    ).toThrowError(error1);
    const error2 = 'The "empty" action is not supported on type "object".';
    expect(() =>
      convertAction({ type: 'object' }, action, undefined)
    ).toThrowError(error2);
    expect(() =>
      convertAction({ type: 'object' }, action, { errorMode: 'throw' })
    ).toThrowError(error2);
  });

  test('should warn error for empty action with invalid type', () => {
    expect(convertAction({}, v.empty(), { errorMode: 'warn' })).toStrictEqual({
      maxLength: 0,
    });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "empty" action is not supported on type "undefined".'
    );
    expect(
      convertAction({ type: 'object' }, v.empty(), {
        errorMode: 'warn',
      })
    ).toStrictEqual({ type: 'object', maxLength: 0 });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "empty" action is not supported on type "object".'
    );
  });

  test('should convert entries action', () => {
    expect(
      convertAction(
        { type: 'object' },
        v.entries<v.EntriesInput, 3>(3),
        undefined
      )
    ).toStrictEqual({
      type: 'object',
      minProperties: 3,
      maxProperties: 3,
    });
  });

  test('should convert examples action', () => {
    expect(
      convertAction({}, v.examples(['foo', 'bar']), undefined)
    ).toStrictEqual({
      examples: ['foo', 'bar'],
    });
    expect(
      convertAction(
        { examples: ['baz'] },
        v.examples(['foo', 'bar']),
        undefined
      )
    ).toStrictEqual({
      examples: ['baz', 'foo', 'bar'],
    });
  });

  test('should merge examples from multiple actions', () => {
    const jsonSchema = {};
    convertAction(jsonSchema, v.examples(['foo']), undefined);
    convertAction(jsonSchema, v.metadata({ examples: ['bar'] }), undefined);
    expect(jsonSchema).toStrictEqual({
      examples: ['foo', 'bar'],
    });
  });

  test('should convert gt value action for numbers', () => {
    expect(
      convertAction(
        { type: 'number' },
        v.gtValue<v.ValueInput, 3>(3),
        undefined
      )
    ).toStrictEqual({
      type: 'number',
      exclusiveMinimum: 3,
    });
  });

  test('should convert gt value action for integers', () => {
    expect(
      convertAction(
        { type: 'integer' },
        v.gtValue<v.ValueInput, 0>(0),
        undefined
      )
    ).toStrictEqual({
      type: 'integer',
      exclusiveMinimum: 0,
    });
  });

  test('should throw error for gt value action with invalid type', () => {
    const action = v.gtValue<v.ValueInput, 3>(3);
    const error1 =
      'The "gt_value" action is not supported on type "undefined".';
    expect(() => convertAction({}, action, undefined)).toThrowError(error1);
    const error2 = 'The "gt_value" action is not supported on type "string".';
    expect(() =>
      convertAction({ type: 'string' }, action, undefined)
    ).toThrowError(error2);
  });

  test('should throw error for gt value action with openapi-3.0', () => {
    const error = 'The "gt_value" action is not supported for OpenAPI 3.0.';
    expect(() =>
      convertAction({ type: 'number' }, v.gtValue<v.ValueInput, 3>(3), {
        target: 'openapi-3.0',
      })
    ).toThrowError(error);
  });

  test('should convert includes action', () => {
    expect(
      convertAction(
        { type: 'string' },
        v.includes<string, 'foo'>('foo'),
        undefined
      )
    ).toStrictEqual({
      type: 'string',
      pattern: 'foo',
    });
  });

  test('should convert includes action with special characters', () => {
    expect(
      convertAction(
        { type: 'string' },
        v.includes<string, 'foo.bar'>('foo.bar'),
        undefined
      )
    ).toStrictEqual({
      type: 'string',
      pattern: 'foo\\.bar',
    });
  });

  test('should warn error for pattern action with existing pattern', () => {
    expect(
      convertAction(
        { type: 'string', pattern: '^pre' },
        v.includes<string, 'foo'>('foo'),
        { errorMode: 'warn' }
      )
    ).toStrictEqual({
      type: 'string',
      pattern: '^pre',
    });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "includes" action is not supported in combination with another regex action.'
    );
  });

  test('should convert integer action', () => {
    expect(convertAction({}, v.integer<number>(), undefined)).toStrictEqual({
      type: 'integer',
    });
    expect(
      convertAction({ type: 'number' }, v.integer<number>(), undefined)
    ).toStrictEqual({
      type: 'integer',
    });
  });

  test('should convert IPv4 action', () => {
    expect(convertAction({}, v.ipv4<string>(), undefined)).toStrictEqual({
      format: 'ipv4',
    });
    expect(
      convertAction({ type: 'string' }, v.ipv4<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      format: 'ipv4',
    });
  });

  test('should convert IPv6 action', () => {
    expect(convertAction({}, v.ipv6<string>(), undefined)).toStrictEqual({
      format: 'ipv6',
    });
    expect(
      convertAction({ type: 'string' }, v.ipv6<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      format: 'ipv6',
    });
  });

  test('should convert ISO date action', () => {
    expect(convertAction({}, v.isoDate<string>(), undefined)).toStrictEqual({
      format: 'date',
    });
    expect(
      convertAction({ type: 'string' }, v.isoDate<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      format: 'date',
    });
  });

  test('should convert ISO date time action', () => {
    expect(convertAction({}, v.isoDateTime<string>(), undefined)).toStrictEqual(
      {
        format: 'date-time',
      }
    );
    expect(
      convertAction({ type: 'string' }, v.isoDateTime<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      format: 'date-time',
    });
  });

  test('should convert ISO timestamp action', () => {
    expect(
      convertAction({}, v.isoTimestamp<string>(), undefined)
    ).toStrictEqual({
      format: 'date-time',
    });
    expect(
      convertAction({ type: 'string' }, v.isoTimestamp<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      format: 'date-time',
    });
  });

  test('should convert ISO time action', () => {
    expect(convertAction({}, v.isoTime<string>(), undefined)).toStrictEqual({
      format: 'time',
    });
    expect(
      convertAction({ type: 'string' }, v.isoTime<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      format: 'time',
    });
  });

  test('should convert jwsCompact action', () => {
    expect(convertAction({}, v.jwsCompact<string>(), undefined)).toStrictEqual({
      pattern: v.JWS_COMPACT_REGEX.source,
    });
    expect(
      convertAction({ type: 'string' }, v.jwsCompact<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: v.JWS_COMPACT_REGEX.source,
    });
  });

  test('should convert length action for strings', () => {
    expect(
      convertAction(
        { type: 'string' },
        v.length<v.LengthInput, 3>(3),
        undefined
      )
    ).toStrictEqual({
      type: 'string',
      minLength: 3,
      maxLength: 3,
    });
  });

  test('should convert length action for arrays', () => {
    expect(
      convertAction({ type: 'array' }, v.length<v.LengthInput, 3>(3), undefined)
    ).toStrictEqual({
      type: 'array',
      minItems: 3,
      maxItems: 3,
    });
  });

  test('should throw error for length action with invalid type', () => {
    const action = v.length<v.LengthInput, 3>(3);
    const error1 = 'The "length" action is not supported on type "undefined".';
    expect(() => convertAction({}, action, undefined)).toThrowError(error1);
    expect(() =>
      convertAction({}, action, { errorMode: 'throw' })
    ).toThrowError(error1);
    const error2 = 'The "length" action is not supported on type "object".';
    expect(() =>
      convertAction({ type: 'object' }, action, undefined)
    ).toThrowError(error2);
    expect(() =>
      convertAction({ type: 'object' }, action, { errorMode: 'throw' })
    ).toThrowError(error2);
  });

  test('should warn error for length action with invalid type', () => {
    expect(
      convertAction({}, v.length<v.LengthInput, 3>(3), { errorMode: 'warn' })
    ).toStrictEqual({
      minLength: 3,
      maxLength: 3,
    });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "length" action is not supported on type "undefined".'
    );
    expect(
      convertAction({ type: 'object' }, v.length<v.LengthInput, 3>(3), {
        errorMode: 'warn',
      })
    ).toStrictEqual({ type: 'object', minLength: 3, maxLength: 3 });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "length" action is not supported on type "object".'
    );
  });

  test('should convert lt value action for numbers', () => {
    expect(
      convertAction(
        { type: 'number' },
        v.ltValue<v.ValueInput, 10>(10),
        undefined
      )
    ).toStrictEqual({
      type: 'number',
      exclusiveMaximum: 10,
    });
  });

  test('should convert lt value action for integers', () => {
    expect(
      convertAction(
        { type: 'integer' },
        v.ltValue<v.ValueInput, 100>(100),
        undefined
      )
    ).toStrictEqual({
      type: 'integer',
      exclusiveMaximum: 100,
    });
  });

  test('should throw error for lt value action with invalid type', () => {
    const action = v.ltValue<v.ValueInput, 10>(10);
    const error1 =
      'The "lt_value" action is not supported on type "undefined".';
    expect(() => convertAction({}, action, undefined)).toThrowError(error1);
    const error2 = 'The "lt_value" action is not supported on type "string".';
    expect(() =>
      convertAction({ type: 'string' }, action, undefined)
    ).toThrowError(error2);
  });

  test('should throw error for lt value action with openapi-3.0', () => {
    const error = 'The "lt_value" action is not supported for OpenAPI 3.0.';
    expect(() =>
      convertAction({ type: 'number' }, v.ltValue<v.ValueInput, 10>(10), {
        target: 'openapi-3.0',
      })
    ).toThrowError(error);
  });

  test('should convert max entries action', () => {
    expect(
      convertAction(
        { type: 'object' },
        v.maxEntries<v.EntriesInput, 3>(3),
        undefined
      )
    ).toStrictEqual({
      type: 'object',
      maxProperties: 3,
    });
  });

  test('should convert max length action for strings', () => {
    expect(
      convertAction(
        { type: 'string' },
        v.maxLength<v.LengthInput, 3>(3),
        undefined
      )
    ).toStrictEqual({
      type: 'string',
      maxLength: 3,
    });
  });

  test('should convert max length action for arrays', () => {
    expect(
      convertAction(
        { type: 'array' },
        v.maxLength<v.LengthInput, 3>(3),
        undefined
      )
    ).toStrictEqual({
      type: 'array',
      maxItems: 3,
    });
  });

  test('should throw error for max length action with invalid type', () => {
    const action = v.maxLength<v.LengthInput, 3>(3);
    const error1 =
      'The "max_length" action is not supported on type "undefined".';
    expect(() => convertAction({}, action, undefined)).toThrowError(error1);
    expect(() =>
      convertAction({}, action, { errorMode: 'throw' })
    ).toThrowError(error1);
    const error2 = 'The "max_length" action is not supported on type "object".';
    expect(() =>
      convertAction({ type: 'object' }, action, undefined)
    ).toThrowError(error2);
    expect(() =>
      convertAction({ type: 'object' }, action, { errorMode: 'throw' })
    ).toThrowError(error2);
  });

  test('should warn error for max length action with invalid type', () => {
    expect(
      convertAction({}, v.maxLength<v.LengthInput, 3>(3), { errorMode: 'warn' })
    ).toStrictEqual({
      maxLength: 3,
    });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "max_length" action is not supported on type "undefined".'
    );
    expect(
      convertAction({ type: 'object' }, v.maxLength<v.LengthInput, 3>(3), {
        errorMode: 'warn',
      })
    ).toStrictEqual({ type: 'object', maxLength: 3 });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "max_length" action is not supported on type "object".'
    );
  });

  test('should convert max value action for numbers', () => {
    expect(
      convertAction(
        { type: 'number' },
        v.maxValue<v.ValueInput, 3>(3),
        undefined
      )
    ).toStrictEqual({
      type: 'number',
      maximum: 3,
    });
  });

  test('should convert max value action for integers', () => {
    expect(
      convertAction(
        { type: 'integer' },
        v.maxValue<v.ValueInput, 100>(100),
        undefined
      )
    ).toStrictEqual({
      type: 'integer',
      maximum: 100,
    });
  });

  test('should throw error for max value action with invalid type', () => {
    const action = v.maxValue<v.ValueInput, 3>(3);
    const error1 =
      'The "max_value" action is not supported on type "undefined".';
    expect(() => convertAction({}, action, undefined)).toThrowError(error1);
    expect(() =>
      convertAction({}, action, { errorMode: 'throw' })
    ).toThrowError(error1);
    const error2 = 'The "max_value" action is not supported on type "string".';
    expect(() =>
      convertAction({ type: 'string' }, action, undefined)
    ).toThrowError(error2);
    expect(() =>
      convertAction({ type: 'string' }, action, { errorMode: 'throw' })
    ).toThrowError(error2);
  });

  test('should warn error for max value action with invalid type', () => {
    expect(
      convertAction({}, v.maxValue<v.ValueInput, 3>(3), { errorMode: 'warn' })
    ).toStrictEqual({
      maximum: 3,
    });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "max_value" action is not supported on type "undefined".'
    );
    expect(
      convertAction({ type: 'string' }, v.maxValue<v.ValueInput, 3>(3), {
        errorMode: 'warn',
      })
    ).toStrictEqual({ type: 'string', maximum: 3 });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "max_value" action is not supported on type "string".'
    );
  });

  test('should convert metadata action', () => {
    expect(
      convertAction(
        {},
        v.metadata({
          title: 'title',
          description: 'description',
          examples: ['example'],
          other: 'other',
        }),
        undefined
      )
    ).toStrictEqual({
      title: 'title',
      description: 'description',
      examples: ['example'],
    });
    expect(
      convertAction(
        { examples: ['existing'] },
        v.metadata({
          examples: ['new'],
        }),
        undefined
      )
    ).toStrictEqual({
      examples: ['existing', 'new'],
    });
  });

  test('should skip invalid metadata properties', () => {
    expect(
      convertAction(
        {},
        v.metadata({
          title: 123,
          description: null,
          examples: { foo: 'bar' },
          other: 'other',
        }),
        undefined
      )
    ).toStrictEqual({});
  });

  test('should convert min entries action', () => {
    expect(
      convertAction(
        { type: 'object' },
        v.minEntries<v.EntriesInput, 3>(3),
        undefined
      )
    ).toStrictEqual({
      type: 'object',
      minProperties: 3,
    });
  });

  test('should convert min length action for strings', () => {
    expect(
      convertAction(
        { type: 'string' },
        v.minLength<v.LengthInput, 3>(3),
        undefined
      )
    ).toStrictEqual({
      type: 'string',
      minLength: 3,
    });
  });

  test('should convert min length action for arrays', () => {
    expect(
      convertAction(
        { type: 'array' },
        v.minLength<v.LengthInput, 3>(3),
        undefined
      )
    ).toStrictEqual({
      type: 'array',
      minItems: 3,
    });
  });

  test('should throw error for min length action with invalid type', () => {
    const action = v.minLength<v.LengthInput, 3>(3);
    const error1 =
      'The "min_length" action is not supported on type "undefined".';
    expect(() => convertAction({}, action, undefined)).toThrowError(error1);
    expect(() =>
      convertAction({}, action, { errorMode: 'throw' })
    ).toThrowError(error1);
    const error2 = 'The "min_length" action is not supported on type "object".';
    expect(() =>
      convertAction({ type: 'object' }, action, undefined)
    ).toThrowError(error2);
    expect(() =>
      convertAction({ type: 'object' }, action, { errorMode: 'throw' })
    ).toThrowError(error2);
  });

  test('should warn error for min length action with invalid type', () => {
    expect(
      convertAction({}, v.minLength<v.LengthInput, 3>(3), { errorMode: 'warn' })
    ).toStrictEqual({
      minLength: 3,
    });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "min_length" action is not supported on type "undefined".'
    );
    expect(
      convertAction({ type: 'object' }, v.minLength<v.LengthInput, 3>(3), {
        errorMode: 'warn',
      })
    ).toStrictEqual({ type: 'object', minLength: 3 });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "min_length" action is not supported on type "object".'
    );
  });

  test('should convert min value action for numbers', () => {
    expect(
      convertAction(
        { type: 'number' },
        v.minValue<v.ValueInput, 3>(3),
        undefined
      )
    ).toStrictEqual({
      type: 'number',
      minimum: 3,
    });
  });

  test('should convert min value action for integers', () => {
    expect(
      convertAction(
        { type: 'integer' },
        v.minValue<v.ValueInput, 1>(1),
        undefined
      )
    ).toStrictEqual({
      type: 'integer',
      minimum: 1,
    });
  });

  test('should throw error for min value action with invalid type', () => {
    const action = v.minValue<v.ValueInput, 3>(3);
    const error1 =
      'The "min_value" action is not supported on type "undefined".';
    expect(() => convertAction({}, action, undefined)).toThrowError(error1);
    expect(() =>
      convertAction({}, action, { errorMode: 'throw' })
    ).toThrowError(error1);
    const error2 = 'The "min_value" action is not supported on type "string".';
    expect(() =>
      convertAction({ type: 'string' }, action, undefined)
    ).toThrowError(error2);
    expect(() =>
      convertAction({ type: 'string' }, action, { errorMode: 'throw' })
    ).toThrowError(error2);
  });

  test('should warn error for min value action with invalid type', () => {
    expect(
      convertAction({}, v.minValue<v.ValueInput, 3>(3), { errorMode: 'warn' })
    ).toStrictEqual({
      minimum: 3,
    });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "min_value" action is not supported on type "undefined".'
    );
    expect(
      convertAction({ type: 'string' }, v.minValue<v.ValueInput, 3>(3), {
        errorMode: 'warn',
      })
    ).toStrictEqual({ type: 'string', minimum: 3 });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "min_value" action is not supported on type "string".'
    );
  });

  test('should convert multiple of action', () => {
    expect(
      convertAction({}, v.multipleOf<number, 5>(5), undefined)
    ).toStrictEqual({
      multipleOf: 5,
    });
    expect(
      convertAction({ type: 'number' }, v.multipleOf<number, 5>(5), undefined)
    ).toStrictEqual({
      type: 'number',
      multipleOf: 5,
    });
  });

  test('should convert non empty action for strings', () => {
    expect(
      convertAction({ type: 'string' }, v.nonEmpty(), undefined)
    ).toStrictEqual({
      type: 'string',
      minLength: 1,
    });
  });

  test('should convert non empty action for arrays', () => {
    expect(
      convertAction({ type: 'array' }, v.nonEmpty(), undefined)
    ).toStrictEqual({
      type: 'array',
      minItems: 1,
    });
  });

  test('should throw error for non empty action with invalid type', () => {
    const action = v.nonEmpty();
    const error1 =
      'The "non_empty" action is not supported on type "undefined".';
    expect(() => convertAction({}, action, undefined)).toThrowError(error1);
    expect(() =>
      convertAction({}, action, { errorMode: 'throw' })
    ).toThrowError(error1);
    const error2 = 'The "non_empty" action is not supported on type "object".';
    expect(() =>
      convertAction({ type: 'object' }, action, undefined)
    ).toThrowError(error2);
    expect(() =>
      convertAction({ type: 'object' }, action, { errorMode: 'throw' })
    ).toThrowError(error2);
  });

  test('should warn error for non empty action with invalid type', () => {
    expect(
      convertAction({}, v.nonEmpty(), { errorMode: 'warn' })
    ).toStrictEqual({
      minLength: 1,
    });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "non_empty" action is not supported on type "undefined".'
    );
    expect(
      convertAction({ type: 'object' }, v.nonEmpty(), {
        errorMode: 'warn',
      })
    ).toStrictEqual({ type: 'object', minLength: 1 });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "non_empty" action is not supported on type "object".'
    );
  });

  test('should convert not value action', () => {
    expect(
      convertAction(
        { type: 'number' },
        v.notValue<v.ValueInput, 0>(0),
        undefined
      )
    ).toStrictEqual({
      type: 'number',
      not: { const: 0 },
    });
  });

  test('should convert not value action for openapi-3.0', () => {
    expect(
      convertAction({ type: 'number' }, v.notValue<v.ValueInput, 0>(0), {
        target: 'openapi-3.0',
      })
    ).toStrictEqual({
      type: 'number',
      not: { enum: [0] },
    });
  });

  test('should convert not values action', () => {
    expect(
      convertAction(
        { type: 'number' },
        v.notValues<v.ValueInput, [0, 1]>([0, 1]),
        undefined
      )
    ).toStrictEqual({
      type: 'number',
      not: { enum: [0, 1] },
    });
  });

  test('should throw error for unsupported not value action', () => {
    const error =
      'The requirement of the "not_value" action is not JSON compatible.';
    expect(() =>
      convertAction({}, v.notValue<v.ValueInput, 1n>(1n), undefined)
    ).toThrowError(error);
    expect(() =>
      convertAction({}, v.notValue<v.ValueInput, Date>(new Date(0)), {
        errorMode: 'throw',
      })
    ).toThrowError(error);
  });

  test('should warn error for unsupported not value action', () => {
    expect(
      convertAction({ type: 'number' }, v.notValue<v.ValueInput, 1n>(1n), {
        errorMode: 'warn',
      })
    ).toStrictEqual({
      type: 'number',
    });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The requirement of the "not_value" action is not JSON compatible.'
    );
  });

  test('should throw error for unsupported not values action', () => {
    const error =
      'A requirement of the "not_values" action is not JSON compatible.';
    expect(() =>
      convertAction({}, v.notValues<v.ValueInput, [1n]>([1n]), undefined)
    ).toThrowError(error);
    expect(() =>
      convertAction(
        {},
        v.notValues<v.ValueInput, [Date, Date]>([new Date(0), new Date(1)]),
        { errorMode: 'throw' }
      )
    ).toThrowError(error);
  });

  test('should warn error for unsupported not values action', () => {
    expect(
      convertAction({ type: 'number' }, v.notValues<v.ValueInput, [1n]>([1n]), {
        errorMode: 'warn',
      })
    ).toStrictEqual({
      type: 'number',
    });
    expect(console.warn).toHaveBeenLastCalledWith(
      'A requirement of the "not_values" action is not JSON compatible.'
    );
  });

  test('should convert supported regex action', () => {
    expect(
      convertAction({ type: 'string' }, v.regex<string>(/[a-zA-Z]/), undefined)
    ).toStrictEqual({
      type: 'string',
      pattern: '[a-zA-Z]',
    });
  });

  test('should throw error for unsupported regex action', () => {
    const action = v.regex<string>(/[a-z]/im);
    const error = 'RegExp flags are not supported by JSON Schema.';
    expect(() => convertAction({}, action, undefined)).toThrowError(error);
    expect(() =>
      convertAction({}, action, { errorMode: 'throw' })
    ).toThrowError(error);
  });

  test('should warn error for unsupported regex action', () => {
    expect(
      convertAction({ type: 'string' }, v.regex<string>(/[a-z]/im), {
        errorMode: 'warn',
      })
    ).toStrictEqual({
      type: 'string',
      pattern: '[a-z]',
    });
    expect(console.warn).toHaveBeenLastCalledWith(
      'RegExp flags are not supported by JSON Schema.'
    );
  });

  test('should convert safe integer action', () => {
    expect(
      convertAction({ type: 'number' }, v.safeInteger<number>(), undefined)
    ).toStrictEqual({
      type: 'integer',
      minimum: Number.MIN_SAFE_INTEGER,
      maximum: Number.MAX_SAFE_INTEGER,
    });
  });

  test('should preserve stricter safe integer bounds', () => {
    expect(
      convertAction(
        { type: 'number', minimum: 10, maximum: 20 },
        v.safeInteger<number>(),
        undefined
      )
    ).toStrictEqual({
      type: 'integer',
      minimum: 10,
      maximum: 20,
    });
    expect(
      convertAction(
        {
          type: 'number',
          exclusiveMinimum: 10,
          exclusiveMaximum: 20,
        },
        v.safeInteger<number>(),
        undefined
      )
    ).toStrictEqual({
      type: 'integer',
      minimum: Number.MIN_SAFE_INTEGER,
      maximum: Number.MAX_SAFE_INTEGER,
      exclusiveMinimum: 10,
      exclusiveMaximum: 20,
    });
  });

  test('should clamp broader safe integer bounds', () => {
    expect(
      convertAction(
        {
          type: 'number',
          minimum: Number.MIN_SAFE_INTEGER - 1,
          maximum: Number.MAX_SAFE_INTEGER + 1,
        },
        v.safeInteger<number>(),
        undefined
      )
    ).toStrictEqual({
      type: 'integer',
      minimum: Number.MIN_SAFE_INTEGER,
      maximum: Number.MAX_SAFE_INTEGER,
    });
  });

  test('should convert starts with action', () => {
    expect(
      convertAction(
        { type: 'string' },
        v.startsWith<string, 'foo'>('foo'),
        undefined
      )
    ).toStrictEqual({
      type: 'string',
      pattern: '^foo',
    });
  });

  test('should convert starts with action with special characters', () => {
    expect(
      convertAction(
        { type: 'string' },
        v.startsWith<string, 'https://'>('https://'),
        undefined
      )
    ).toStrictEqual({
      type: 'string',
      pattern: '^https://',
    });
  });

  test('should convert title action', () => {
    expect(convertAction({}, v.title('test'), undefined)).toStrictEqual({
      title: 'test',
    });
  });

  test('should convert url action', () => {
    expect(convertAction({}, v.url<string>(), undefined)).toStrictEqual({
      format: 'uri',
    });
    expect(
      convertAction({ type: 'string' }, v.url<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      format: 'uri',
    });
  });

  test('should convert UUID action', () => {
    expect(convertAction({}, v.uuid<string>(), undefined)).toStrictEqual({
      format: 'uuid',
    });
    expect(
      convertAction({ type: 'string' }, v.uuid<string>(), undefined)
    ).toStrictEqual({
      type: 'string',
      format: 'uuid',
    });
  });

  test('should convert value action', () => {
    expect(
      convertAction(
        { type: 'boolean' },
        v.value<v.ValueInput, true>(true),
        undefined
      )
    ).toStrictEqual({
      type: 'boolean',
      const: true,
    });
    expect(
      convertAction(
        { type: 'number' },
        v.value<v.ValueInput, 123>(123),
        undefined
      )
    ).toStrictEqual({
      type: 'number',
      const: 123,
    });
    expect(
      convertAction(
        { type: 'string' },
        v.value<v.ValueInput, 'foo'>('foo'),
        undefined
      )
    ).toStrictEqual({
      type: 'string',
      const: 'foo',
    });
  });

  test('should convert value action for openapi-3.0', () => {
    expect(
      convertAction({ type: 'string' }, v.value<v.ValueInput, 'foo'>('foo'), {
        target: 'openapi-3.0',
      })
    ).toStrictEqual({
      type: 'string',
      enum: ['foo'],
    });
  });

  test('should throw error for unsupported value action', () => {
    const error =
      'The requirement of the "value" action is not JSON compatible.';
    expect(() =>
      convertAction({}, v.value<v.ValueInput, 1n>(1n), undefined)
    ).toThrowError(error);
    expect(() =>
      convertAction({}, v.value<v.ValueInput, Date>(new Date(0)), {
        errorMode: 'throw',
      })
    ).toThrowError(error);
    expect(() =>
      convertAction(
        { type: 'number' },
        v.value<v.ValueInput, number>(NaN),
        undefined
      )
    ).toThrowError(error);
    expect(() =>
      convertAction(
        { type: 'number' },
        v.value<v.ValueInput, number>(Infinity),
        undefined
      )
    ).toThrowError(error);
  });

  test('should warn error for unsupported value action', () => {
    expect(
      convertAction({ type: 'number' }, v.value<v.ValueInput, 1n>(1n), {
        errorMode: 'warn',
      })
    ).toStrictEqual({
      type: 'number',
    });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The requirement of the "value" action is not JSON compatible.'
    );
  });

  test('should convert values action', () => {
    expect(
      convertAction(
        { type: 'number' },
        v.values<v.ValueInput, [1, 2, 3]>([1, 2, 3]),
        undefined
      )
    ).toStrictEqual({
      type: 'number',
      enum: [1, 2, 3],
    });
    expect(
      convertAction(
        { type: 'string' },
        v.values<v.ValueInput, ['foo', 'bar']>(['foo', 'bar']),
        undefined
      )
    ).toStrictEqual({
      type: 'string',
      enum: ['foo', 'bar'],
    });
    expect(
      convertAction(
        { type: 'boolean' },
        v.values<v.ValueInput, [true, false]>([true, false]),
        undefined
      )
    ).toStrictEqual({
      type: 'boolean',
      enum: [true, false],
    });
  });

  test('should throw error for unsupported values action', () => {
    const error =
      'A requirement of the "values" action is not JSON compatible.';
    expect(() =>
      convertAction({}, v.values<v.ValueInput, [1n]>([1n]), undefined)
    ).toThrowError(error);
    expect(() =>
      convertAction(
        {},
        v.values<v.ValueInput, [string, Date]>(['foo', new Date(0)]),
        { errorMode: 'throw' }
      )
    ).toThrowError(error);
  });

  test('should warn error for unsupported values action', () => {
    expect(
      convertAction({ type: 'number' }, v.values<v.ValueInput, [1n]>([1n]), {
        errorMode: 'warn',
      })
    ).toStrictEqual({
      type: 'number',
    });
    expect(console.warn).toHaveBeenLastCalledWith(
      'A requirement of the "values" action is not JSON compatible.'
    );
  });

  test('should throw error for unsupported transform action', () => {
    const action = v.transform(parseInt);
    const error = 'The "transform" action cannot be converted to JSON Schema.';
    expect(() => convertAction({}, action as never, undefined)).toThrowError(
      error
    );
    expect(() =>
      convertAction({}, action as never, { errorMode: 'throw' })
    ).toThrowError(error);
  });

  test('should warn error for unsupported transform action', () => {
    expect(
      convertAction({}, v.transform(parseInt) as never, { errorMode: 'warn' })
    ).toStrictEqual({});
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "transform" action cannot be converted to JSON Schema.'
    );
    expect(
      convertAction({ type: 'string' }, v.transform(parseInt) as never, {
        errorMode: 'warn',
      })
    ).toStrictEqual({ type: 'string' });
    expect(console.warn).toHaveBeenLastCalledWith(
      'The "transform" action cannot be converted to JSON Schema.'
    );
  });

  test('should override JSON Schema output of action', () => {
    expect(
      convertAction({}, v.decimal<string>(), {
        overrideAction({ valibotAction }) {
          if (valibotAction.type === 'decimal') {
            return { format: 'decimal' };
          }
        },
      })
    ).toStrictEqual({
      format: 'decimal',
    });
    expect(
      convertAction({ type: 'string' }, v.decimal<string>(), {
        overrideAction({ valibotAction, jsonSchema }) {
          if (valibotAction.type === 'decimal') {
            return { ...jsonSchema, format: 'decimal' };
          }
        },
      })
    ).toStrictEqual({
      type: 'string',
      pattern: v.DECIMAL_REGEX.source,
      format: 'decimal',
    });
  });

  test('should override action to suppress error', () => {
    expect(
      convertAction({}, v.transform(parseInt) as never, {
        overrideAction({ valibotAction, jsonSchema }) {
          if (valibotAction.type === 'transform') {
            return jsonSchema;
          }
        },
      })
    ).toStrictEqual({});
  });
});
