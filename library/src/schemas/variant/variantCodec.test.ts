import { describe, expect, test, vi } from 'vitest';
import * as v from '../../index.ts';

describe('variant codec discriminator issues', () => {
  const discriminator = v.codec(v.literal('encoded'), v.literal('decoded'), {
    decode: () => 'decoded' as const,
    encode: () => 'encoded' as const,
  });
  const pipeline = v.pipe(v.string(), discriminator);

  test.each([
    { first: undefined, later: 'invalid', expected: '"decoded"' },
    { first: 'invalid', later: undefined, expected: '("decoded" | undefined)' },
  ])(
    'uses the validated getter value for expectations ($first)',
    ({ first, later, expected }) => {
      const read = vi.fn().mockReturnValueOnce(first).mockReturnValue(later);
      const input = {
        get type() {
          return read();
        },
      };
      const schema = v.variant('type', [
        v.object({ type: v.optional(discriminator, () => 'encoded') }),
      ]);
      expect(v.safeEncode(schema, input as never)).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected }],
      });
    }
  );

  test.each([
    { type: v.optional(discriminator, 'encoded'), expected: '"decoded"' },
    { type: v.undefinedable(discriminator, 'encoded'), expected: '"decoded"' },
    {
      type: v.optional(v.nullable(pipeline), 'encoded'),
      expected: '("decoded" | null)',
    },
  ])(
    'excludes replaced undefined defaults for $type.type when encoding',
    ({ type, expected }) => {
      const schema = v.variant('type', [v.object({ type })]);
      for (const value of [undefined, 'invalid']) {
        expect(v.safeEncode(schema, { type: value } as never)).toMatchObject({
          success: false,
          issues: [{ type: 'variant', expected }],
        });
      }
      expect(v.safeDecode(schema, { type: 'invalid' } as never)).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected: type.expects }],
      });
      expect(v.decode(schema, { type: undefined })).toStrictEqual({
        type: 'decoded',
      });
    }
  );

  test('uses rejected undefined input to narrow function defaults without extra calls', () => {
    const default_ = vi.fn(() => 'encoded' as const);
    const schema = v.variant('type', [
      v.object({ type: v.optional(v.nullable(pipeline), default_) }),
    ]);
    expect(v.safeEncode(schema, { type: undefined } as never)).toMatchObject({
      success: false,
      issues: [{ type: 'variant', expected: '("decoded" | null)' }],
    });
    expect(default_).toHaveBeenCalledTimes(1);
    default_.mockClear();
    expect(v.safeEncode(schema, { type: 'invalid' } as never)).toMatchObject({
      success: false,
      issues: [{ expected: '(("decoded" | null) | undefined)' }],
    });
    expect(default_).not.toHaveBeenCalled();
  });

  test('preserves undefined returned by function defaults when encoding', () => {
    const schema = v.variant('type', [
      v.object({ type: v.optional(discriminator, () => undefined) }),
    ]);
    expect(v.encode(schema, { type: undefined })).toStrictEqual({
      type: undefined,
    });
    expect(v.safeEncode(schema, { type: 'invalid' } as never)).toMatchObject({
      success: false,
      issues: [{ expected: '("decoded" | undefined)' }],
    });
  });

  test.each([
    { type: discriminator, expected: '"encoded"' },
    { type: pipeline, expected: 'string' },
  ])(
    'reports decoded expectations when encoding $type.type',
    ({ type, expected }) => {
      const schema = v.variant('type', [v.object({ type })]);
      expect(v.safeEncode(schema, { type: 'invalid' } as never)).toMatchObject({
        success: false,
        issues: [
          {
            type: 'variant',
            expected: '"decoded"',
            path: [{ key: 'type', value: 'invalid' }],
          },
        ],
      });
      expect(v.safeDecode(schema, { type: 'invalid' } as never)).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected }],
      });
      expect(v.safeEncode(schema, {} as never)).toMatchObject({
        success: false,
        issues: [
          {
            type: 'variant',
            expected: '"decoded"',
            path: [{ key: 'type', value: undefined }],
          },
        ],
      });
    }
  );

  test.each([
    { type: v.optional(discriminator), expected: '("decoded" | undefined)' },
    { type: v.nullable(discriminator), expected: '("decoded" | null)' },
    {
      type: v.nullish(discriminator),
      expected: '("decoded" | null | undefined)',
    },
    {
      type: v.undefinedable(discriminator),
      expected: '("decoded" | undefined)',
    },
    { type: v.exactOptional(discriminator), expected: '"decoded"' },
    {
      type: v.optional(v.nullable(pipeline)),
      expected: '(("decoded" | null) | undefined)',
    },
  ])(
    'reports decoded expectations through $type.type wrappers',
    ({ type, expected }) => {
      const schema = v.variant('type', [v.object({ type })]);
      expect(v.safeEncode(schema, { type: 'invalid' } as never)).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected }],
      });
      expect(v.safeDecode(schema, { type: 'invalid' } as never)).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected: type.expects }],
      });
    }
  );

  const discriminatorAsync = v.codecAsync(
    v.literal('encoded'),
    v.literal('decoded'),
    {
      decode: async () => 'decoded' as const,
      encode: async () => 'encoded' as const,
    }
  );
  const pipelineAsync = v.pipeAsync(v.string(), discriminatorAsync);

  test.each([
    { first: undefined, later: 'invalid', expected: '"decoded"' },
    { first: 'invalid', later: undefined, expected: '("decoded" | undefined)' },
  ])(
    'uses the validated Proxy value for async expectations ($first)',
    async ({ first, later, expected }) => {
      const read = vi.fn().mockReturnValueOnce(first).mockReturnValue(later);
      const input = new Proxy(
        { type: 'invalid' },
        {
          get(target, key, receiver) {
            return key === 'type' ? read() : Reflect.get(target, key, receiver);
          },
        }
      );
      const schema = v.variantAsync('type', [
        v.objectAsync({
          type: v.optionalAsync(
            discriminatorAsync,
            async () => 'encoded' as const
          ),
        }),
      ]);
      expect(await v.safeEncodeAsync(schema, input as never)).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected }],
      });
    }
  );

  test('narrows constant defaults through async optional wrappers', async () => {
    const type = v.optionalAsync(v.nullableAsync(pipelineAsync), 'encoded');
    const schema = v.variantAsync('type', [v.objectAsync({ type })]);
    for (const value of [undefined, 'invalid']) {
      expect(
        await v.safeEncodeAsync(schema, { type: value } as never)
      ).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected: '("decoded" | null)' }],
      });
    }
    expect(
      await v.safeDecodeAsync(schema, { type: 'invalid' } as never)
    ).toMatchObject({
      success: false,
      issues: [{ type: 'variant', expected: type.expects }],
    });
    expect(await v.decodeAsync(schema, { type: undefined })).toStrictEqual({
      type: 'decoded',
    });
  });

  test('awaits async defaults without evaluating them again for expectations', async () => {
    const default_ = vi.fn(async () => 'encoded' as const);
    const schema = v.variantAsync('type', [
      v.objectAsync({ type: v.optionalAsync(discriminatorAsync, default_) }),
    ]);
    expect(
      await v.safeEncodeAsync(schema, { type: undefined } as never)
    ).toMatchObject({
      success: false,
      issues: [{ type: 'variant', expected: '"decoded"' }],
    });
    expect(default_).toHaveBeenCalledTimes(1);
    default_.mockClear();
    expect(
      await v.safeEncodeAsync(schema, { type: 'invalid' } as never)
    ).toMatchObject({
      success: false,
      issues: [{ expected: '("decoded" | undefined)' }],
    });
    expect(default_).not.toHaveBeenCalled();
    const preserving = v.variantAsync('type', [
      v.objectAsync({
        type: v.optionalAsync(discriminatorAsync, async () => undefined),
      }),
    ]);
    expect(await v.encodeAsync(preserving, { type: undefined })).toStrictEqual({
      type: undefined,
    });
  });

  test.each([
    { type: discriminatorAsync, expected: '"encoded"' },
    { type: pipelineAsync, expected: 'string' },
  ])(
    'reports decoded expectations when encoding $type.type asynchronously',
    async ({ type, expected }) => {
      const schema = v.variantAsync('type', [v.objectAsync({ type })]);
      expect(
        await v.safeEncodeAsync(schema, { type: 'invalid' } as never)
      ).toMatchObject({
        success: false,
        issues: [
          {
            type: 'variant',
            expected: '"decoded"',
            path: [{ key: 'type', value: 'invalid' }],
          },
        ],
      });
      expect(
        await v.safeDecodeAsync(schema, { type: 'invalid' } as never)
      ).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected }],
      });
      expect(await v.safeEncodeAsync(schema, {} as never)).toMatchObject({
        success: false,
        issues: [
          {
            type: 'variant',
            expected: '"decoded"',
            path: [{ key: 'type', value: undefined }],
          },
        ],
      });
    }
  );

  test.each([
    {
      type: v.optionalAsync(discriminatorAsync),
      expected: '("decoded" | undefined)',
    },
    {
      type: v.nullableAsync(discriminatorAsync),
      expected: '("decoded" | null)',
    },
    {
      type: v.nullishAsync(discriminatorAsync),
      expected: '("decoded" | null | undefined)',
    },
    {
      type: v.undefinedableAsync(discriminatorAsync),
      expected: '("decoded" | undefined)',
    },
    { type: v.exactOptionalAsync(discriminatorAsync), expected: '"decoded"' },
    {
      type: v.optionalAsync(v.nullableAsync(pipelineAsync)),
      expected: '(("decoded" | null) | undefined)',
    },
  ])(
    'reports decoded expectations through async $type.type wrappers',
    async ({ type, expected }) => {
      const schema = v.variantAsync('type', [v.objectAsync({ type })]);
      expect(
        await v.safeEncodeAsync(schema, { type: 'invalid' } as never)
      ).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected }],
      });
      expect(
        await v.safeDecodeAsync(schema, { type: 'invalid' } as never)
      ).toMatchObject({
        success: false,
        issues: [{ type: 'variant', expected: type.expects }],
      });
    }
  );
});
