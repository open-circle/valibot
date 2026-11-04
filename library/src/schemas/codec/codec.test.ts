import { describe, expect, test, vi } from 'vitest';
import * as v from '../../index.ts';

const iso = '2026-11-03T00:00:00.000Z';
const date = new Date(iso);
const dateCodec = v.codec(v.pipe(v.string(), v.isoTimestamp()), v.date(), {
  decode: (value) => new Date(value),
  encode: (value) => value.toISOString(),
});

describe('codec', () => {
  test.each([undefined, 'custom expectation'])(
    'reports direction-specific conversion expectations (%s)',
    (expected) => {
      const schema = v.codec(v.string(), v.number(), {
        decode: (_value, context) => {
          context.addIssue({ expected });
          return context.NEVER;
        },
        encode: (_value, context) => {
          context.addIssue({ expected, label: 'conversion' });
          return context.NEVER;
        },
      });
      expect(v.safeDecode(schema, '1').issues?.[0].expected).toBe(
        expected ?? 'string'
      );
      const encoded = v.safeEncode(schema, 1);
      expect(encoded.issues?.[0].expected).toBe(expected ?? 'number');
      expect(encoded.issues?.[0].message).toContain('Invalid conversion:');
      expect(encoded.output).toBe(1);
    }
  );

  test('forwards call-specific messages through safe decoding and encoding', () => {
    const message = 'Call-specific validation failure';
    expect(
      v.safeDecode(dateCodec, 123 as never, { message }).issues?.[0].message
    ).toBe(message);
    expect(
      v.safeEncode(dateCodec, 'bad' as never, { message }).issues?.[0].message
    ).toBe(message);
  });

  test('forwards call-specific messages through throwing decoding and encoding', () => {
    const message = 'Call-specific validation failure';
    expect.assertions(4);
    for (const run of [
      () => v.decode(dateCodec, 123 as never, { message }),
      () => v.encode(dateCodec, 'bad' as never, { message }),
    ]) {
      try {
        run();
      } catch (error) {
        expect(error).toBeInstanceOf(v.ValiError);
        expect(error).toMatchObject({ issues: [{ message }] });
      }
    }
  });

  test('does not apply undefinedable defaults while encoding', () => {
    const getDefault = vi.fn(() => iso);
    const schema = v.undefinedable(dateCodec, getDefault);
    expect(v.decode(schema, undefined)).toStrictEqual(date);
    const result = v.safeEncode(schema, undefined as never);
    expect(result.success).toBe(false);
    expect(result.output).toBeUndefined();
    expect(v.encode(v.undefinedable(dateCodec), undefined)).toBeUndefined();
    expect(
      v.encode(
        v.undefinedable(dateCodec, () => undefined),
        undefined
      )
    ).toBeUndefined();
  });

  test('does not apply async undefinedable defaults while encoding', async () => {
    const schema = v.undefinedableAsync(dateCodec, async () => iso);
    expect(await v.decodeAsync(schema, undefined)).toStrictEqual(date);
    const result = await v.safeEncodeAsync(schema, undefined as never);
    expect(result.success).toBe(false);
    expect(result.output).toBeUndefined();
    expect(
      await v.encodeAsync(v.undefinedableAsync(dateCodec), undefined)
    ).toBeUndefined();
    expect(
      await v.encodeAsync(
        v.undefinedableAsync(dateCodec, async () => undefined),
        undefined
      )
    ).toBeUndefined();
  });

  test('validates and converts both representations', () => {
    expect(v.parse(dateCodec, iso)).toStrictEqual(date);
    expect(v.decode(dateCodec, iso)).toStrictEqual(date);
    expect(v.encode(dateCodec, date)).toBe(iso);
    expect(v.parse(dateCodec.encoded, iso)).toBe(iso);
    expect(v.parse(dateCodec.decoded, date)).toBe(date);
    expect(dateCodec['~standard'].validate(iso)).toMatchObject({
      value: date,
    });
  });

  test('does not convert invalid source values', () => {
    const decode = vi.fn((value: string) => new Date(value));
    const encode = vi.fn((value: Date) => value.toISOString());
    const schema = v.codec(v.string(), v.date(), { decode, encode });
    expect(v.safeDecode(schema, 12 as never).success).toBe(false);
    expect(v.safeEncode(schema, 'invalid' as never).success).toBe(false);
    expect(decode).not.toHaveBeenCalled();
    expect(encode).not.toHaveBeenCalled();
  });

  test('validates conversion results', () => {
    const schema = v.codec(v.pipe(v.string(), v.minLength(2)), v.date(), {
      decode: () => new Date(NaN),
      encode: () => '',
    });
    expect(v.safeDecode(schema, 'ok').success).toBe(false);
    expect(v.safeEncode(schema, date).success).toBe(false);
  });

  test('allows normalization without enforcing exact round trips', () => {
    const schema = v.codec(v.string(), v.number(), {
      decode: Number,
      encode: String,
    });
    expect(v.encode(schema, v.decode(schema, '42.50'))).toBe('42.5');
  });

  test('supports codecs on both sides of another codec', () => {
    const numeric = v.codec(v.string(), v.number(), {
      decode: Number,
      encode: String,
    });
    const epoch = v.codec(v.number(), v.date(), {
      decode: (value) => new Date(value),
      encode: (value) => value.getTime(),
    });
    const schema = v.codec(numeric, epoch, {
      decode: (value) => value * 1000,
      encode: (value) => value / 1000,
    });
    expect(v.decode(schema, '1')).toStrictEqual(new Date(1000));
    expect(v.encode(schema, new Date(1000))).toBe('1');
  });

  test('composes codec stages in a pipeline', () => {
    const numeric = v.codec(v.string(), v.number(), {
      decode: Number,
      encode: String,
    });
    const epoch = v.codec(v.number(), v.date(), {
      decode: (value) => new Date(value),
      encode: (value) => value.getTime(),
    });
    const schema = v.pipe(numeric, epoch);
    expect(v.decode(schema, '1000')).toStrictEqual(new Date(1000));
    expect(v.encode(schema, new Date(1000))).toBe('1000');
  });

  test.each([
    ['object', v.object({ at: dateCodec }), { at: iso }, { at: date }],
    [
      'looseObject',
      v.looseObject({ at: dateCodec }),
      { at: iso },
      { at: date },
    ],
    [
      'strictObject',
      v.strictObject({ at: dateCodec }),
      { at: iso },
      { at: date },
    ],
    [
      'objectWithRest',
      v.objectWithRest({ at: dateCodec }, dateCodec),
      { at: iso, other: iso },
      { at: date, other: date },
    ],
    ['array', v.array(dateCodec), [iso], [date]],
    ['tuple', v.tuple([dateCodec]), [iso], [date]],
    ['looseTuple', v.looseTuple([dateCodec]), [iso], [date]],
    ['strictTuple', v.strictTuple([dateCodec]), [iso], [date]],
    [
      'tupleWithRest',
      v.tupleWithRest([dateCodec], dateCodec),
      [iso, iso],
      [date, date],
    ],
    ['record', v.record(v.string(), dateCodec), { at: iso }, { at: date }],
    [
      'map',
      v.map(v.string(), dateCodec),
      new Map([['at', iso]]),
      new Map([['at', date]]),
    ],
    ['set', v.set(dateCodec), new Set([iso]), new Set([date])],
    ['lazy', v.lazy(() => dateCodec), iso, date],
    [
      'intersect',
      v.intersect([
        v.object({ at: dateCodec }),
        v.object({ name: v.string() }),
      ]),
      { at: iso, name: 'Ada' },
      { at: date, name: 'Ada' },
    ],
  ] as const)('nests in %s', (_name, schema, encoded, decoded) => {
    expect(v.decode(schema, encoded as never)).toStrictEqual(decoded);
    expect(v.encode(schema, decoded as never)).toStrictEqual(encoded);
  });

  test('selects the first successful union branch in either direction', () => {
    const epoch = v.codec(v.number(), v.date(), {
      decode: (value) => new Date(value),
      encode: (value) => value.getTime(),
    });
    const schema = v.union([dateCodec, epoch]);
    expect(v.decode(schema, date.getTime())).toStrictEqual(date);
    expect(v.encode(schema, date)).toBe(iso);
    expect(v.encode(v.union([epoch, dateCodec]), date)).toBe(date.getTime());
    const short = v.codec(v.pipe(v.string(), v.maxLength(2)), v.date(), {
      decode: (value) => new Date(value),
      encode: (value) => value.toISOString(),
    });
    expect(v.encode(v.union([short, epoch]), date)).toBe(date.getTime());
  });

  test('selects variants using the decoded discriminator during encoding', () => {
    const encode = vi.fn(() => 'wire' as const);
    const tag = v.codec(v.literal('wire'), v.literal('domain'), {
      decode: () => 'domain' as const,
      encode,
    });
    const checkedTag = v.pipe(
      tag,
      v.check((value) => value === 'domain')
    );
    const schema = v.variant('type', [
      v.object({ type: checkedTag, at: dateCodec }),
      v.object({ type: v.literal('other'), name: v.string() }),
    ]);
    expect(v.encode(schema, { type: 'domain', at: date })).toStrictEqual({
      type: 'wire',
      at: iso,
    });
    expect(encode).toHaveBeenCalledTimes(1);
    expect(v.decode(schema, { type: 'wire', at: iso })).toStrictEqual({
      type: 'domain',
      at: date,
    });
  });

  test('runs output-side checks after type guards and before conversions', () => {
    const check = vi.fn((value: Date) => value.getUTCFullYear() >= 2000);
    const schema = v.pipe(dateCodec, v.check(check));
    expect(v.safeEncode(schema, 'bad' as never).success).toBe(false);
    expect(check).not.toHaveBeenCalled();
    expect(v.safeEncode(schema, new Date('1999-01-01')).success).toBe(false);
    expect(v.safeDecode(schema, '1999-01-01T00:00:00.000Z').success).toBe(
      false
    );
    expect(v.encode(schema, date)).toBe(iso);
  });

  test('validates each pipeline stage against its own representation', () => {
    const numeric = v.codec(v.string(), v.number(), {
      decode: Number,
      encode: String,
    });
    const schema = v.pipe(v.string(), v.minLength(2), numeric, v.minValue(0));
    expect(v.safeEncode(schema, 1).success).toBe(false);
    expect(v.safeEncode(schema, -12).success).toBe(false);
    expect(v.encode(schema, 12)).toBe('12');
  });

  test('guards object checks without converting nested codecs twice', () => {
    const encode = vi.fn((value: Date) => value.toISOString());
    const child = v.codec(v.string(), v.date(), {
      decode: (value) => new Date(value),
      encode,
    });
    const check = vi.fn((value: { at: Date }) => value.at.getTime() > 0);
    const schema = v.pipe(v.object({ at: child }), v.check(check));
    expect(v.safeEncode(schema, { at: 'bad' } as never).success).toBe(false);
    expect(check).not.toHaveBeenCalled();
    expect(v.encode(schema, { at: date })).toStrictEqual({ at: iso });
    expect(encode).toHaveBeenCalledTimes(1);
    expect(check).toHaveBeenCalledTimes(1);
  });

  test.each([
    [
      'transform',
      v.pipe(
        v.string(),
        v.transform((value) => value.length)
      ),
    ],
    [
      'rawTransform',
      v.pipe(
        v.string(),
        v.rawTransform(({ dataset }) => dataset.value.length)
      ),
    ],
    ['trim', v.pipe(v.string(), v.trim())],
  ] as const)(
    'rejects one-way %s during safe and throwing encoding',
    (_name, schema) => {
      expect(() => v.encode(schema, 'x' as never)).toThrow(
        'unidirectional transformation'
      );
      expect(() => v.safeEncode(schema, 'x' as never)).toThrow(
        'unidirectional transformation'
      );
      expect(v.safeParse(schema, ' x ').success).toBe(true);
    }
  );

  test('permits type-only brand and readonly actions', () => {
    const schema = v.pipe(
      v.object({ at: dateCodec }),
      v.brand('Event'),
      v.flavor('Event'),
      v.readonly()
    );
    expect(v.encode(schema, v.decode(schema, { at: iso }))).toStrictEqual({
      at: iso,
    });
  });

  test.each([
    (entries: v.ObjectEntries) => v.object(entries),
    (entries: v.ObjectEntries) => v.looseObject(entries),
    (entries: v.ObjectEntries) => v.strictObject(entries),
    (entries: v.ObjectEntries) => v.objectWithRest(entries, v.unknown()),
  ])(
    'does not insert missing object defaults or fallbacks while encoding',
    (factory) => {
      const getDefault = vi.fn(() => iso);
      const getFallback = vi.fn(() => date);
      const schema = factory({
        at: v.optional(dateCodec, getDefault),
        other: v.fallback(dateCodec, getFallback),
      });
      expect(v.decode(schema, {} as never)).toStrictEqual({
        at: date,
        other: date,
      });
      getDefault.mockClear();
      getFallback.mockClear();
      expect(v.safeEncode(schema, {} as never).success).toBe(false);
      expect(getDefault).not.toHaveBeenCalled();
      expect(getFallback).not.toHaveBeenCalled();
    }
  );

  test.each([
    (schema: typeof dateCodec, getDefault: () => string) =>
      v.optional(schema, getDefault),
    (schema: typeof dateCodec, getDefault: () => string) =>
      v.nullable(schema, getDefault),
    (schema: typeof dateCodec, getDefault: () => string) =>
      v.nullish(schema, getDefault),
  ])('does not apply wrapper defaults while encoding', (wrapper) => {
    const getDefault = vi.fn(() => iso);
    const schema = wrapper(dateCodec, getDefault);
    expect(v.safeEncode(schema, undefined as never).success).toBe(false);
    expect(v.safeEncode(schema, null as never).success).toBe(false);
    expect(getDefault).toHaveBeenCalled();
  });

  test.each([
    [v.nullable(dateCodec, null), null],
    [v.nullable(dateCodec, () => null), null],
    [v.optional(dateCodec, () => undefined), undefined],
    [v.nullish(dateCodec, null), null],
    [v.nullish(dateCodec, () => null), null],
    [v.nullish(dateCodec, () => undefined), undefined],
  ] as const)(
    'encodes sentinel defaults without conversion',
    (schema, value) => {
      expect(v.safeEncode(schema, value)).toMatchObject({
        success: true,
        output: value,
      });
    }
  );

  test('preserves nullish encode input instead of applying a different sentinel default', () => {
    expect(
      v.safeEncode(v.nullish(dateCodec, null), undefined as never).success
    ).toBe(false);
    expect(
      v.safeEncode(
        v.nullish(dateCodec, () => undefined),
        null as never
      ).success
    ).toBe(false);
  });

  test('keeps ordinary optional properties optional in both directions', () => {
    const schema = v.object({ at: v.optional(dateCodec) });
    expect(v.decode(schema, {})).toStrictEqual({});
    expect(v.encode(schema, {})).toStrictEqual({});
    expect(v.encode(v.optional(dateCodec), undefined)).toBeUndefined();
  });

  test('does not apply fallback values to failed encoding', () => {
    const getFallback = vi.fn(() => date);
    const schema = v.fallback(dateCodec, getFallback);
    expect(v.safeEncode(schema, 'bad' as never).success).toBe(false);
    expect(getFallback).not.toHaveBeenCalled();
    expect(v.decode(schema, 'bad')).toStrictEqual(date);
  });

  test('reports conversion issues with the containing object and array path', () => {
    const json = v.codec(v.string(), v.unknown(), {
      decode: (value, context) => {
        try {
          return JSON.parse(value) as unknown;
        } catch {
          context.addIssue({ message: 'Invalid JSON' });
          return context.NEVER;
        }
      },
      encode: (value) => JSON.stringify(value),
    });
    const result = v.safeDecode(v.object({ data: v.array(json) }), {
      data: ['{'],
    });
    expect(result.success).toBe(false);
    expect(result.typed).toBe(false);
    expect(result.issues?.[0].message).toBe('Invalid JSON');
    expect(result.issues?.[0].path?.map((item) => item.key)).toStrictEqual([
      'data',
      0,
    ]);
    expect(() => v.decode(json, '{')).toThrow(v.ValiError);
  });

  test('reports encoder issues and does not validate a failed conversion result', () => {
    const schema = v.codec(v.string(), v.number(), {
      decode: Number,
      encode: (_value, context) => {
        context.addIssue({
          message: (issue) => `Cannot encode ${issue.input}`,
        });
        return context.NEVER;
      },
    });
    const result = v.safeEncode(v.object({ count: schema }), { count: 1 });
    expect(result.success).toBe(false);
    expect(result.issues?.[0].message).toBe('Cannot encode 1');
    expect(result.issues?.[0].path?.[0].key).toBe('count');
  });

  test('propagates callback exceptions through safe entry points', () => {
    const failure = new Error('Conversion failed');
    const schema = v.codec(v.string(), v.number(), {
      decode: () => {
        throw failure;
      },
      encode: () => {
        throw failure;
      },
    });
    expect(() => v.safeDecode(schema, '')).toThrow(failure);
    expect(() => v.safeEncode(schema, 0)).toThrow(failure);
  });

  test('isolates cached parsing results from encoding in both orders', () => {
    const decode = vi.fn((value: string) => `decoded:${value}`);
    const encode = vi.fn((value: string) => `encoded:${value}`);
    const schema = v.cache(v.codec(v.string(), v.string(), { decode, encode }));
    expect(v.decode(schema, 'same')).toBe('decoded:same');
    expect(v.encode(schema, 'same')).toBe('encoded:same');
    expect(v.encode(schema, 'other')).toBe('encoded:other');
    expect(v.decode(schema, 'other')).toBe('decoded:other');
    expect(v.parse(schema, 'same')).toBe('decoded:same');
    expect(v.encode(schema, 'same')).toBe('encoded:same');
    expect(decode).toHaveBeenCalledTimes(2);
    expect(encode).toHaveBeenCalledTimes(2);
    schema.cache.clear();
    expect(v.decode(schema, 'same')).toBe('decoded:same');
    expect(v.encode(schema, 'same')).toBe('encoded:same');
    expect(decode).toHaveBeenCalledTimes(3);
    expect(encode).toHaveBeenCalledTimes(3);
  });

  test('caches encoding without reusing its preliminary type-check result', () => {
    const encode = vi.fn((value: Date) => value.toISOString());
    const check = vi.fn((value: Date) => value.getUTCFullYear() >= 2000);
    const cached = v.cache(
      v.pipe(
        v.codec(v.string(), v.date(), {
          decode: (value) => new Date(value),
          encode,
        }),
        v.check(check)
      )
    );
    const schema = v.pipe(
      cached,
      v.check((value) => value.getUTCFullYear() >= 2000)
    );

    expect(v.encode(schema, date)).toBe(iso);
    expect(v.encode(schema, date)).toBe(iso);
    expect(encode).toHaveBeenCalledTimes(1);
    expect(check).toHaveBeenCalledTimes(1);

    const invalid = new Date('1999-01-01');
    expect(v.safeEncode(schema, invalid).success).toBe(false);
    expect(encode).toHaveBeenCalledTimes(1);
  });

  test('preserves direction through local config without leaking it globally', () => {
    const schema = v.config(dateCodec, { abortEarly: true });
    expect(v.encode(schema, date)).toBe(iso);
    expect(v.getGlobalConfig()).not.toHaveProperty('~direction');
    expect(v.getGlobalConfig()).not.toHaveProperty('~typeCheckOnly');
    expect(v.parse(schema, iso)).toStrictEqual(date);
  });

  test('treats an explicit decode direction like ordinary forward parsing', () => {
    const schema = v.object({
      at: v.optional(dateCodec, iso),
      recovered: v.fallback(dateCodec, date),
    });
    expect(
      schema['~run']({ value: {} }, { '~direction': 'decode' })
    ).toStrictEqual({
      typed: true,
      value: { at: date, recovered: date },
    });
  });

  test('preserves encode direction without leaking the preliminary type-check phase', () => {
    const encode = vi.fn((value: Date, context: v.CodecContext<Date>) => {
      expect(context.config['~direction']).toBe('encode');
      expect(context.config['~typeCheckOnly']).toBeUndefined();
      return value.toISOString();
    });
    const schema = v.pipe(
      v.codec(v.string(), v.date(), {
        decode: (value) => new Date(value),
        encode,
      }),
      v.check((value) => value.getUTCFullYear() >= 2000)
    );
    expect(v.encode(schema, date)).toBe(iso);
    expect(encode).toHaveBeenCalledTimes(1);
  });

  test('supports ordinary schemas and preserves safe result narrowing', () => {
    const schema = v.object({ name: v.string() });
    expect(v.decode(schema, { name: 'Ada' })).toStrictEqual({ name: 'Ada' });
    expect(v.encode(schema, { name: 'Ada' })).toStrictEqual({ name: 'Ada' });
    expect(v.safeEncode(dateCodec, date)).toStrictEqual({
      typed: true,
      success: true,
      output: iso,
      issues: undefined,
    });
  });

  test('encodes recursive lazy schemas', () => {
    interface EncodedNode {
      at: string;
      children: EncodedNode[];
    }
    interface DecodedNode {
      at: Date;
      children: DecodedNode[];
    }
    const node: v.GenericSchema<EncodedNode, DecodedNode> = v.object({
      at: dateCodec,
      children: v.array(v.lazy(() => node)),
    });
    const encoded = { at: iso, children: [{ at: iso, children: [] }] };
    const decoded = { at: date, children: [{ at: date, children: [] }] };
    expect(v.decode(node, encoded)).toStrictEqual(decoded);
    expect(v.encode(node, decoded)).toStrictEqual(encoded);
  });

  test('respects abortEarly and abortPipeEarly while encoding', () => {
    const schema = v.object({ first: dateCodec, second: dateCodec });
    const invalid = { first: 'bad', second: 'bad' } as never;
    expect(v.safeEncode(schema, invalid).issues).toHaveLength(2);
    expect(
      v.safeEncode(schema, invalid, { abortEarly: true }).issues
    ).toHaveLength(1);
    const pipeline = v.pipe(
      dateCodec,
      v.check(() => false),
      v.check(() => false)
    );
    expect(v.safeEncode(pipeline, date).issues).toHaveLength(2);
    expect(
      v.safeEncode(pipeline, date, { abortPipeEarly: true }).issues
    ).toHaveLength(1);
  });
});
