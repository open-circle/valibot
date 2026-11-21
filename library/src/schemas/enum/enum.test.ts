import { describe, expect, test } from 'vitest';
import { expectNoSchemaIssue, expectSchemaIssue } from '../../vitest/index.ts';
import { enum_, type EnumIssue, type EnumSchema } from './enum.ts';

describe('enum_', () => {
  enum normalEnum {
    option1 = 'foo',
    option2 = 'bar',
    option3 = 'baz',
  }
  type Options = typeof normalEnum;

  describe('should return schema object', () => {
    const baseSchema: Omit<EnumSchema<Options, never>, 'message'> = {
      kind: 'schema',
      type: 'enum',
      reference: enum_,
      expects: '("foo" | "bar" | "baz")',
      enum: normalEnum,
      options: [normalEnum.option1, normalEnum.option2, normalEnum.option3],
      async: false,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const schema: EnumSchema<Options, undefined> = {
        ...baseSchema,
        message: undefined,
      };
      expect(enum_(normalEnum)).toStrictEqual(schema);
      expect(enum_(normalEnum, undefined)).toStrictEqual(schema);
    });

    test('with string message', () => {
      expect(enum_(normalEnum, 'message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      } satisfies EnumSchema<Options, 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(enum_(normalEnum, message)).toStrictEqual({
        ...baseSchema,
        message,
      } satisfies EnumSchema<Options, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    test('for valid options', () => {
      expectNoSchemaIssue(enum_(normalEnum), [
        normalEnum.option1,
        normalEnum.option2,
        normalEnum.option3,
      ]);
    });

    test('for valid values', () => {
      // @ts-expect-error
      expectNoSchemaIssue(enum_(normalEnum), ['foo', 'bar', 'baz']);
    });
  });

  describe('should return dataset with issues', () => {
    const schema = enum_(normalEnum, 'message');
    const baseIssue: Omit<EnumIssue, 'input' | 'received'> = {
      kind: 'schema',
      type: 'enum',
      expected: '("foo" | "bar" | "baz")',
      message: 'message',
    };

    // Special values

    test('for empty options', () => {
      enum Empty {}
      expectSchemaIssue(
        enum_(Empty, 'message'),
        { ...baseIssue, expected: 'never' },
        ['foo', 'bar', 'baz']
      );
    });

    test('for invalid options', () => {
      expectSchemaIssue(schema, baseIssue, ['fo', 'fooo', 'foobar']);
    });

    // Primitive types

    test('for bigints', () => {
      expectSchemaIssue(schema, baseIssue, [-1n, 0n, 123n]);
    });

    test('for booleans', () => {
      expectSchemaIssue(schema, baseIssue, [true, false]);
    });

    test('for null', () => {
      expectSchemaIssue(schema, baseIssue, [null]);
    });

    test('for numbers', () => {
      expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
    });

    test('for undefined', () => {
      expectSchemaIssue(schema, baseIssue, [undefined]);
    });

    test('for strings', () => {
      expectSchemaIssue(schema, baseIssue, ['', 'hello', '123']);
    });

    test('for symbols', () => {
      expectSchemaIssue(schema, baseIssue, [Symbol(), Symbol('foo')]);
    });

    // Complex types

    test('for arrays', () => {
      expectSchemaIssue(schema, baseIssue, [[], ['value']]);
    });

    test('for functions', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
    });

    test('for objects', () => {
      expectSchemaIssue(schema, baseIssue, [{}, { key: 'value' }]);
    });
  });

  describe('should filter reverse mappings', () => {
    test('of special enums', () => {
      enum specialEnum {
        option1 = 'foo',
        option2 = 0,
        option3,
        'Infinity',
        '-Infinity',
        'NaN',
      }
      expect(enum_(specialEnum)).toMatchObject({
        enum: specialEnum,
        expects: '("foo" | 0 | 1 | 2 | 3 | 4)',
        options: [
          specialEnum.option1,
          specialEnum.option2,
          specialEnum.option3,
          specialEnum['Infinity'],
          specialEnum['-Infinity'],
          specialEnum['NaN'],
        ],
      } satisfies Pick<
        EnumSchema<typeof specialEnum, undefined>,
        'enum' | 'expects' | 'options'
      >);
    });

    test('of normal enum-like object', () => {
      const normalEnumLike = {
        option0: 'foo',
        option1: 1111,
        option2: 2222,
        option3: 3333,
        option4: 4444,
        option5: 5555,
        option6: -6666,

        // No reverse mappings
        foo: 'option0', // Key is not a number
        '+1111': 'option1', // Key is not a reverse mapped number
        1234: 'option2', // Key does not match with reverse mapped value `2222`
        '5678': 'option3', // Key does not match with reverse mapped value `3333`

        // Reverse mappings
        4444: 'option4',
        '5555': 'option5',
        '-6666': 'option6',
      } as const;
      expect(enum_(normalEnumLike)).toMatchObject({
        enum: normalEnumLike,
        expects:
          '("option2" | "option3" | "foo" | 1111 | 2222 | 3333 | 4444 | 5555 | -6666 | "option0" | "option1")',
        options: [
          'option2',
          'option3',
          'foo',
          1111,
          2222,
          3333,
          4444,
          5555,
          -6666,
          'option0',
          'option1',
        ],
      } satisfies Pick<
        EnumSchema<typeof normalEnumLike, undefined>,
        'expects' | 'enum' | 'options'
      >);
    });

    test('of special enum-like object', () => {
      const specialEnumLike = {
        option0: 'foo',
        option1: 1234,
        option2: Infinity,
        option3: -Infinity,
        option4: NaN,

        // Reverse mappings
        '1234': 'option1',
        Infinity: 'option2',
        '-Infinity': 'option3',
        NaN: 'option4',
      } as const;
      expect(enum_(specialEnumLike)).toMatchObject({
        enum: specialEnumLike,
        expects: '("foo" | 1234 | Infinity | -Infinity | NaN)',
        options: ['foo', 1234, Infinity, -Infinity, NaN],
      } satisfies Pick<
        EnumSchema<typeof specialEnumLike, undefined>,
        'expects' | 'enum' | 'options'
      >);
    });
  });

  test('should not mutate the schema object', () => {
    const schema = enum_({ FOO: 'foo', BAR: 'bar' });
    const keys = Reflect.ownKeys(schema);
    Object.freeze(schema);
    expect(schema['~run']({ value: 'bar' }, {})).toStrictEqual({
      typed: true,
      value: 'bar',
    });
    expect(Reflect.ownKeys(schema)).toStrictEqual(keys);
  });
});
