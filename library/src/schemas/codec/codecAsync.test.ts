import { describe, expect, test, vi } from 'vitest';
import * as v from '../../index.ts';

const iso = '2026-11-03T00:00:00.000Z';
const date = new Date(iso);
const dateCodec = v.codecAsync(v.pipe(v.string(), v.isoTimestamp()), v.date(), {
  decode: async (value) => new Date(value),
  encode: async (value) => value.toISOString(),
});

describe('codecAsync', () => {
  test('supports explicit decode direction with async defaults and fallbacks', async () => {
    const schema = v.objectAsync({
      at: v.optionalAsync(dateCodec, async () => iso),
      recovered: v.fallbackAsync(dateCodec, async () => date),
    });
    expect(
      await schema['~run']({ value: {} }, { '~direction': 'decode' })
    ).toStrictEqual({
      typed: true,
      value: { at: date, recovered: date },
    });
  });

  test('supports async conversions and all async entry points', async () => {
    expect(await v.parseAsync(dateCodec, iso)).toStrictEqual(date);
    expect(await v.decodeAsync(dateCodec, iso)).toStrictEqual(date);
    expect(await v.encodeAsync(dateCodec, date)).toBe(iso);
    expect(await v.safeDecodeAsync(dateCodec, iso)).toMatchObject({
      success: true,
      output: date,
    });
    expect(await v.safeEncodeAsync(dateCodec, date)).toStrictEqual({
      typed: true,
      success: true,
      output: iso,
      issues: undefined,
    });
    expect(await dateCodec['~standard'].validate(iso)).toMatchObject({
      value: date,
    });
  });

  test('validates async conversion results', async () => {
    const schema = v.codecAsync(v.pipe(v.string(), v.minLength(2)), v.date(), {
      decode: async () => new Date(NaN),
      encode: async () => '',
    });
    expect((await v.safeDecodeAsync(schema, 'ok')).success).toBe(false);
    expect((await v.safeEncodeAsync(schema, date)).success).toBe(false);
  });

  test('forwards custom configuration messages through async entry points', async () => {
    const config = { message: 'Custom codec input error' };
    const invalid = 12 as never;
    await expect(v.decodeAsync(dateCodec, invalid, config)).rejects.toThrow(
      v.ValiError
    );
    await expect(
      v.decodeAsync(dateCodec, invalid, config)
    ).rejects.toMatchObject({
      issues: [expect.objectContaining({ message: config.message })],
    });
    expect(await v.safeDecodeAsync(dateCodec, invalid, config)).toMatchObject({
      success: false,
      issues: [expect.objectContaining({ message: config.message })],
    });
    expect(await v.safeEncodeAsync(dateCodec, invalid, config)).toMatchObject({
      success: false,
      issues: [expect.objectContaining({ message: config.message })],
    });
  });

  test('supports async codecs on both sides of another codec', async () => {
    const numeric = v.codecAsync(v.string(), v.number(), {
      decode: async (value) => Number(value),
      encode: async (value) => String(value),
    });
    const epoch = v.codecAsync(v.number(), v.date(), {
      decode: async (value) => new Date(value),
      encode: async (value) => value.getTime(),
    });
    const schema = v.codecAsync(numeric, epoch, {
      decode: async (value) => value * 1000,
      encode: async (value) => value / 1000,
    });
    expect(await v.decodeAsync(schema, '1')).toStrictEqual(new Date(1000));
    expect(await v.encodeAsync(schema, new Date(1000))).toBe('1');
  });

  test('composes async codec stages in a pipeline', async () => {
    const numeric = v.codecAsync(v.string(), v.number(), {
      decode: async (value) => Number(value),
      encode: async (value) => String(value),
    });
    const epoch = v.codecAsync(v.number(), v.date(), {
      decode: async (value) => new Date(value),
      encode: async (value) => value.getTime(),
    });
    const schema = v.pipeAsync(numeric, epoch);
    expect(await v.decodeAsync(schema, '1000')).toStrictEqual(new Date(1000));
    expect(await v.encodeAsync(schema, new Date(1000))).toBe('1000');
  });

  test('accepts async endpoint validation and synchronous conversions', async () => {
    const schema = v.codecAsync(
      v.pipeAsync(
        v.string(),
        v.checkAsync(async (value) => value.startsWith('2026'))
      ),
      v.pipeAsync(
        v.date(),
        v.checkAsync(async (value) => value.getUTCFullYear() === 2026)
      ),
      {
        decode: (value) => new Date(value),
        encode: (value) => value.toISOString(),
      }
    );
    expect(await v.decodeAsync(schema, iso)).toStrictEqual(date);
    expect(await v.encodeAsync(schema, date)).toBe(iso);
    expect(
      (await v.safeEncodeAsync(schema, new Date('1999-01-01'))).success
    ).toBe(false);
  });

  test.each([
    [v.objectAsync({ at: dateCodec }), { at: iso }, { at: date }],
    [v.looseObjectAsync({ at: dateCodec }), { at: iso }, { at: date }],
    [v.strictObjectAsync({ at: dateCodec }), { at: iso }, { at: date }],
    [
      v.objectWithRestAsync({ at: dateCodec }, dateCodec),
      { at: iso, other: iso },
      { at: date, other: date },
    ],
    [v.arrayAsync(dateCodec), [iso], [date]],
    [v.tupleAsync([dateCodec]), [iso], [date]],
    [v.recordAsync(v.string(), dateCodec), { at: iso }, { at: date }],
    [
      v.mapAsync(v.string(), dateCodec),
      new Map([['at', iso]]),
      new Map([['at', date]]),
    ],
    [v.setAsync(dateCodec), new Set([iso]), new Set([date])],
    [v.lazyAsync(async () => dateCodec), iso, date],
    [v.unionAsync([dateCodec, v.number()]), iso, date],
    [
      v.intersectAsync([
        v.objectAsync({ at: dateCodec }),
        v.object({ name: v.string() }),
      ]),
      { at: iso, name: 'Ada' },
      { at: date, name: 'Ada' },
    ],
  ] as const)('nests in async schema %#', async (schema, encoded, decoded) => {
    expect(await v.decodeAsync(schema, encoded as never)).toStrictEqual(
      decoded
    );
    expect(await v.encodeAsync(schema, decoded as never)).toStrictEqual(
      encoded
    );
  });

  test('guards async pipeline checks and executes conversions only once', async () => {
    const encode = vi.fn(async (value: Date) => value.toISOString());
    const check = vi.fn(
      async (value: { at: Date }) => value.at.getUTCFullYear() >= 2000
    );
    const schema = v.pipeAsync(
      v.objectAsync({
        at: v.codecAsync(v.string(), v.date(), {
          decode: async (value) => new Date(value),
          encode,
        }),
      }),
      v.checkAsync(check)
    );
    expect(
      (await v.safeEncodeAsync(schema, { at: 'bad' } as never)).success
    ).toBe(false);
    expect(check).not.toHaveBeenCalled();
    expect(
      (await v.safeEncodeAsync(schema, { at: new Date('1999-01-01') })).success
    ).toBe(false);
    expect(encode).not.toHaveBeenCalled();
    expect(await v.encodeAsync(schema, { at: date })).toStrictEqual({
      at: iso,
    });
    expect(encode).toHaveBeenCalledTimes(1);
  });

  test.each([
    (entries: v.ObjectEntriesAsync) => v.objectAsync(entries),
    (entries: v.ObjectEntriesAsync) => v.looseObjectAsync(entries),
    (entries: v.ObjectEntriesAsync) => v.strictObjectAsync(entries),
    (entries: v.ObjectEntriesAsync) =>
      v.objectWithRestAsync(entries, v.unknown()),
  ])(
    'does not insert async defaults or apply fallbacks during encoding %#',
    async (factory) => {
      const getDefault = vi.fn(async () => iso);
      const getFallback = vi.fn(async () => date);
      const schema = factory({
        at: v.optionalAsync(dateCodec, getDefault),
        other: v.fallbackAsync(dateCodec, getFallback),
      });
      expect(await v.decodeAsync(schema, {} as never)).toStrictEqual({
        at: date,
        other: date,
      });
      getDefault.mockClear();
      getFallback.mockClear();
      expect((await v.safeEncodeAsync(schema, {} as never)).success).toBe(
        false
      );
      const missingDefaulted = await v.safeEncodeAsync(schema, { other: date });
      expect(missingDefaulted.success).toBe(false);
      expect(missingDefaulted.issues?.[0].path?.[0].key).toBe('at');
      expect(getDefault).not.toHaveBeenCalled();
      expect(
        (
          await v.safeEncodeAsync(schema, {
            at: undefined,
            other: 'bad',
          } as never)
        ).success
      ).toBe(false);
      expect(getDefault).toHaveBeenCalledTimes(1);
      expect(getFallback).not.toHaveBeenCalled();
    }
  );

  test.each([
    [v.nullableAsync(dateCodec, null), null],
    [v.nullableAsync(dateCodec, async () => null), null],
    [v.optionalAsync(dateCodec, async () => undefined), undefined],
    [v.nullishAsync(dateCodec, null), null],
    [v.nullishAsync(dateCodec, async () => null), null],
    [v.nullishAsync(dateCodec, async () => undefined), undefined],
  ] as const)(
    'encodes async wrapper outputs permitted by defaults %#',
    async (schema, value) => {
      expect(await v.safeEncodeAsync(schema, value as never)).toStrictEqual({
        typed: true,
        success: true,
        output: value,
        issues: undefined,
      });
    }
  );

  test.each([
    [v.nullableAsync(dateCodec, async () => iso), null],
    [v.optionalAsync(dateCodec, async () => iso), undefined],
    [v.nullishAsync(dateCodec, async () => iso), null],
    [v.nullishAsync(dateCodec, async () => iso), undefined],
  ] as const)(
    'rejects missing async wrapper outputs without replacing them %#',
    async (schema, value) => {
      const result = await v.safeEncodeAsync(schema, value as never);
      expect(result.success).toBe(false);
      expect(result.output).toBe(value);
    }
  );

  test('propagates encoding direction to variant discriminator checks', async () => {
    const encode = vi.fn(async () => 'wire' as const);
    const tag = v.codecAsync(v.literal('wire'), v.literal('domain'), {
      decode: async () => 'domain' as const,
      encode,
    });
    const checkedTag = v.pipeAsync(
      tag,
      v.checkAsync(async (value) => value === 'domain')
    );
    const schema = v.variantAsync('type', [
      v.objectAsync({ type: checkedTag, at: dateCodec }),
    ]);
    expect(
      await v.encodeAsync(schema, { type: 'domain', at: date })
    ).toStrictEqual({ type: 'wire', at: iso });
    expect(encode).toHaveBeenCalledTimes(1);
  });

  test('reports async conversion issues with nested paths', async () => {
    const schema = v.objectAsync({
      value: v.codecAsync(v.string(), v.number(), {
        decode: async (_value, context) => {
          context.addIssue({ message: 'Cannot decode' });
          return context.NEVER;
        },
        encode: async (_value, context) => {
          context.addIssue({ message: 'Cannot encode' });
          return context.NEVER;
        },
      }),
    });
    const decoded = await v.safeDecodeAsync(schema, { value: '' });
    const encoded = await v.safeEncodeAsync(schema, { value: 1 });
    expect(decoded.issues?.[0].message).toBe('Cannot decode');
    expect(encoded.issues?.[0].message).toBe('Cannot encode');
    expect(encoded.issues?.[0].path?.[0].key).toBe('value');
    expect(encoded.typed).toBe(false);
  });

  test.each([undefined, 'custom representation'])(
    'uses the active async input representation for conversion issues (%s)',
    async (expected) => {
      const schema = v.codecAsync(v.string(), v.number(), {
        decode: async (_value, context) => {
          context.addIssue({ expected });
          return context.NEVER;
        },
        encode: async (_value, context) => {
          context.addIssue({ expected });
          return context.NEVER;
        },
      });
      const decoded = await v.safeDecodeAsync(schema, 'input');
      const encoded = await v.safeEncodeAsync(schema, 12);
      expect(decoded.success).toBe(false);
      expect(encoded.success).toBe(false);
      expect(decoded.issues?.[0].expected).toBe(expected ?? 'string');
      expect(encoded.issues?.[0].expected).toBe(expected ?? 'number');
    }
  );

  test('rejects one-way async transformations without catching programming errors', async () => {
    const schema = v.pipeAsync(
      v.string(),
      v.transformAsync(async (value) => value.length)
    );
    await expect(v.encodeAsync(schema, 1)).rejects.toThrow(
      'unidirectional transformation'
    );
    await expect(v.safeEncodeAsync(schema, 1)).rejects.toThrow(
      'unidirectional transformation'
    );
    const failure = new Error('Conversion failed');
    const throwing = v.codecAsync(v.string(), v.number(), {
      decode: async () => {
        throw failure;
      },
      encode: async () => {
        throw failure;
      },
    });
    await expect(v.safeDecodeAsync(throwing, '')).rejects.toThrow(failure);
    await expect(v.safeEncodeAsync(throwing, 0)).rejects.toThrow(failure);
  });

  test('isolates concurrent async encoding and decoding through a cache', async () => {
    const decode = vi.fn(async (value: string) => `decoded:${value}`);
    const encode = vi.fn(async (value: string) => `encoded:${value}`);
    const schema = v.cacheAsync(
      v.codecAsync(v.string(), v.string(), { decode, encode })
    );
    expect(
      await Promise.all([
        v.decodeAsync(schema, 'same'),
        v.encodeAsync(schema, 'same'),
        v.decodeAsync(schema, 'same'),
        v.encodeAsync(schema, 'same'),
      ])
    ).toStrictEqual([
      'decoded:same',
      'encoded:same',
      'decoded:same',
      'encoded:same',
    ]);
    expect(await v.decodeAsync(schema, 'same')).toBe('decoded:same');
    expect(await v.encodeAsync(schema, 'same')).toBe('encoded:same');
    expect(decode).toHaveBeenCalledTimes(1);
    expect(encode).toHaveBeenCalledTimes(1);
    schema.cache.clear();
    expect(await v.decodeAsync(schema, 'same')).toBe('decoded:same');
    expect(await v.encodeAsync(schema, 'same')).toBe('encoded:same');
    expect(decode).toHaveBeenCalledTimes(2);
    expect(encode).toHaveBeenCalledTimes(2);
  });

  test('deduplicates encoding and preliminary type checks independently', async () => {
    const encode = vi.fn(async (value: Date) => value.toISOString());
    const check = vi.fn(async (value: Date) => value.getUTCFullYear() >= 2000);
    const cached = v.cacheAsync(
      v.pipeAsync(
        v.codecAsync(v.string(), v.date(), {
          decode: async (value) => new Date(value),
          encode,
        }),
        v.checkAsync(check)
      )
    );
    const schema = v.pipeAsync(
      cached,
      v.checkAsync(async (value) => value.getUTCFullYear() >= 2000)
    );

    expect(
      await Promise.all([
        v.encodeAsync(schema, date),
        v.encodeAsync(schema, date),
      ])
    ).toStrictEqual([iso, iso]);
    expect(encode).toHaveBeenCalledTimes(1);
    expect(check).toHaveBeenCalledTimes(1);

    const invalid = new Date('1999-01-01');
    expect((await v.safeEncodeAsync(schema, invalid)).success).toBe(false);
    expect(encode).toHaveBeenCalledTimes(1);
  });
});
