import { describe, expect, test, vi } from 'vitest';
import { returns } from '../../actions/index.ts';
import * as v from '../../index.ts';
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
  test('includes referenced issues in mutual union subissues', () => {
    const group = v.mutualRecursive((ref) => ({
      a: v.union([string(), ref('b')]),
      b: v.number(),
    }));
    expect(v.safeParse(group.a, false).issues).toMatchObject([
      {
        type: 'union',
        issues: [{ type: 'string' }, { type: 'number' }],
      },
    ]);
  });

  test('includes nested union issues from recursive references', () => {
    const schema = recursive((self) => v.union([string(), array(self)]));
    const result = v.safeParse(schema, [false]);
    expect(result.issues).toMatchObject([
      {
        type: 'union',
        issues: [
          { type: 'string' },
          {
            type: 'union',
            issues: [{ type: 'string' }, { type: 'array' }],
          },
        ],
      },
    ]);
  });

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
    expect(Object.getOwnPropertySymbols(schema)).toHaveLength(1);
    expect(schema).toStrictEqual({
      [Object.getOwnPropertySymbols(schema)[0]]: true,
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

describe('CodeRabbit recursive runtime regressions', () => {
  test('constructs symbol-keyed mutual entries', () => {
    const key = Symbol('entry');
    const group = v.mutualRecursive(() => ({ [key]: v.string() }));
    expect(group[key]).toBeDefined();
    expect(v.parse(group[key], 'value')).toBe('value');
  });

  test('constructs non-enumerable mutual entries', () => {
    const entries = { node: v.string() };
    Object.defineProperty(entries, 'node', { enumerable: false });
    const group = v.mutualRecursive(() => entries);
    expect(group.node).toBeDefined();
    expect(v.parse(group.node, 'value')).toBe('value');
  });

  test('accepts schema-shaped application defaults', () => {
    const value = { kind: 'schema', owner: 'application' };
    const schema = v.recursive(() =>
      v.object({ value: v.optional(v.any(), value) })
    );
    expect(v.parse(schema, {})).toStrictEqual({ value });
  });

  test.each(['owner', 'reference', '~standard', '~types'])(
    'rejects foreign references in an entry named %s',
    (key) => {
      let foreign: v.GenericSchema = v.never();
      v.recursive((self) => {
        foreign = self;
        return v.string();
      });
      expect(() => v.recursive(() => v.object({ [key]: foreign }))).toThrow(
        'Recursive reference used outside its recursive schema'
      );
    }
  );

  test('returns recursive union issues at runtime', () => {
    const schema = v.recursive((self) => v.union([v.string(), v.array(self)]));
    const result = v.safeParse(schema, [false]);
    expect(result.issues?.[0].issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'union' })])
    );
  });

  test('returns referenced issues inside mutual union issues', () => {
    const group = v.mutualRecursive((ref) => ({
      a: v.union([v.string(), ref('b')]),
      b: v.number(),
    }));
    const result = v.safeParse(group.a, false);
    expect(result.issues?.[0].issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'number' })])
    );
  });
});
