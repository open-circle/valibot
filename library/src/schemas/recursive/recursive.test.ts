import { describe, expect, test, vi } from 'vitest';
import { returns } from '../../actions/index.ts';
import { parse, pipe } from '../../methods/index.ts';
import type { FailureDataset, InferIssue } from '../../types/index.ts';
import { expectNoSchemaIssue } from '../../vitest/index.ts';
import { any } from '../any/index.ts';
import { array } from '../array/index.ts';
import { object } from '../object/index.ts';
import { string } from '../string/index.ts';
import type { Ref } from './_recursive.ts';
import { recursive, type RecursiveSchema } from './recursive.ts';

describe('recursive', () => {
  test('should return schema object', () => {
    const definition = vi.fn((self: Ref) =>
      object({
        name: string(),
        subcategories: array(self),
      })
    );
    const schema = recursive(definition);
    expect(schema.wrapped).toBe(definition.mock.results[0].value);
    expect(definition).toHaveBeenCalledTimes(1);
    expect(schema).toStrictEqual({
      kind: 'schema',
      type: 'recursive',
      reference: recursive,
      expects: 'unknown',
      wrapped: definition.mock.results[0].value,
      async: false,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    } satisfies RecursiveSchema<ReturnType<typeof definition>>);
  });

  describe('should return dataset without issues', () => {
    const schema = recursive((self) =>
      object({
        name: string(),
        subcategories: array(self),
      })
    );

    test('for recursive objects', () => {
      expectNoSchemaIssue(schema, [
        { name: 'Root', subcategories: [] },
        {
          name: 'Root',
          subcategories: [
            {
              name: 'Child',
              subcategories: [{ name: 'Grandchild', subcategories: [] }],
            },
          ],
        },
      ]);
    });
  });

  test('should return dataset with nested issues', () => {
    const schema = recursive((self) =>
      object({
        name: string('message'),
        subcategories: array(self),
      })
    );
    const input = {
      name: 'Root',
      subcategories: [{ name: 123, subcategories: [] }],
    };
    expect(schema['~run']({ value: input }, {})).toStrictEqual({
      typed: false,
      value: input,
      issues: [
        {
          kind: 'schema',
          type: 'string',
          input: 123,
          expected: 'string',
          received: '123',
          message: 'message',
          requirement: undefined,
          path: [
            {
              type: 'object',
              origin: 'value',
              input,
              key: 'subcategories',
              value: input.subcategories,
            },
            {
              type: 'array',
              origin: 'value',
              input: input.subcategories,
              key: 0,
              value: input.subcategories[0],
            },
            {
              type: 'object',
              origin: 'value',
              input: input.subcategories[0],
              key: 'name',
              value: 123,
            },
          ],
          issues: undefined,
          lang: undefined,
          abortEarly: undefined,
          abortPipeEarly: undefined,
        },
      ],
    } satisfies FailureDataset<InferIssue<typeof schema>>);
  });

  test('rejects direct self execution without preventing recursive parsing', () => {
    const definition = vi.fn((self: Ref) => object({ children: array(self) }));
    const schema = recursive(definition);
    const self = definition.mock.calls[0][0];
    const input = { children: [{ children: [] }] };
    const config = { abortEarly: true };
    const message = 'Recursive reference used outside its recursive schema';

    expect(() => parse(self, input, config)).toThrowError(message);
    expect(() => self['~run']({ value: input }, config)).toThrowError(message);
    expect(() => self['~standard'].validate(input)).toThrowError(message);
    expect(() =>
      recursive(() => object({ children: array(self) }))
    ).toThrowError(message);
    expect(parse(schema, input, config)).toStrictEqual(input);
    expect(schema['~standard'].validate(input)).toStrictEqual({
      typed: true,
      value: input,
    });
    expect(() => parse(self, input, config)).toThrowError(message);
    expect(Reflect.ownKeys(config)).toStrictEqual(['abortEarly']);
  });

  test('rejects a foreign reference inside a returns action during construction', () => {
    const definition = vi.fn((self: Ref) => object({ children: array(self) }));
    recursive(definition);
    const self = definition.mock.calls[0][0];

    expect(() => recursive(() => pipe(any(), returns(self)))).toThrowError(
      'Recursive reference used outside its recursive schema'
    );
  });

  test('should construct once with a schema-compatible self marker', () => {
    const definition = vi.fn((self: Ref) => {
      expect(typeof self).toBe('object');
      expect(self.type).toBe('ref');
      return string();
    });
    const schema = recursive(definition);
    expect(definition).toHaveBeenCalledTimes(1);
    const self = definition.mock.calls[0][0];
    expect(self.kind).toBe('schema');
    schema['~run']({ value: 'foo' }, {});
    schema['~run']({ value: 'bar' }, {});
    expect(definition).toHaveBeenCalledTimes(1);
  });
});
