import { describe, expect, test, vi } from 'vitest';
import { parseAsync } from '../../methods/index.ts';
import type { FailureDataset, InferIssue } from '../../types/index.ts';
import { expectNoSchemaIssueAsync } from '../../vitest/index.ts';
import { array, arrayAsync } from '../array/index.ts';
import { object, objectAsync } from '../object/index.ts';
import { string } from '../string/index.ts';
import type { RefAsync } from './recursive.ts';
import { recursive } from './recursive.ts';
import { recursiveAsync, type RecursiveSchemaAsync } from './recursiveAsync.ts';

describe('recursiveAsync', () => {
  test('should return schema object', () => {
    const definition = vi.fn((self: RefAsync) =>
      objectAsync({
        name: string(),
        subcategories: arrayAsync(self),
      })
    );
    const schema = recursiveAsync(definition);
    expect(schema.wrapped).toBe(definition.mock.results[0].value);
    expect(definition).toHaveBeenCalledTimes(1);
    expect(schema).toStrictEqual({
      kind: 'schema',
      type: 'recursiveAsync',
      reference: recursiveAsync,
      expects: 'unknown',
      wrapped: definition.mock.results[0].value,
      async: true,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    } satisfies RecursiveSchemaAsync<ReturnType<typeof definition>>);
  });

  describe('should return dataset without issues', () => {
    const schema = recursiveAsync((self) =>
      objectAsync({
        name: string(),
        subcategories: arrayAsync(self),
      })
    );

    test('for recursive objects', async () => {
      await expectNoSchemaIssueAsync(schema, [
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

  test('should return dataset with nested issues', async () => {
    const schema = recursiveAsync((self) =>
      objectAsync({
        name: string('message'),
        subcategories: arrayAsync(self),
      })
    );
    const input = {
      name: 'Root',
      subcategories: [{ name: 123, subcategories: [] }],
    };
    await expect(schema['~run']({ value: input }, {})).resolves.toStrictEqual({
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

  test('rejects direct self execution without preventing async recursive parsing', async () => {
    const definition = vi.fn((self: RefAsync) =>
      objectAsync({ children: arrayAsync(self) })
    );
    const schema = recursiveAsync(definition);
    const self = definition.mock.calls[0][0];
    const input = { children: [{ children: [] }] };
    const config = { abortEarly: true };
    const message = 'Recursive reference used outside its recursive schema';

    await expect(parseAsync(self, input, config)).rejects.toThrowError(message);
    await expect(self['~run']({ value: input }, config)).rejects.toThrowError(
      message
    );
    await expect(self['~standard'].validate(input)).rejects.toThrowError(
      message
    );
    expect(() =>
      recursiveAsync(() => objectAsync({ children: arrayAsync(self) }))
    ).toThrowError(message);
    await expect(
      Promise.all([
        parseAsync(schema, input, config),
        parseAsync(schema, input, config),
      ])
    ).resolves.toStrictEqual([input, input]);
    await expect(schema['~standard'].validate(input)).resolves.toStrictEqual({
      typed: true,
      value: input,
    });
    await expect(parseAsync(self, input, config)).rejects.toThrowError(message);
    expect(Reflect.ownKeys(config)).toStrictEqual(['abortEarly']);
  });

  test('supports a self-contained sync recursive schema inside an async root', async () => {
    const nested = recursive((self) => object({ children: array(self) }));
    const schema = recursiveAsync(() => objectAsync({ nested }));
    const input = {
      nested: { children: [{ children: [{ children: [] }] }] },
    };
    await expect(parseAsync(schema, input)).resolves.toStrictEqual(input);
  });

  test('should call definition with self', async () => {
    const definition = vi.fn((self: RefAsync) => {
      expect(typeof self).toBe('object');
      expect(self.type).toBe('refAsync');
      return string();
    });
    const schema = recursiveAsync(definition);
    expect(definition).toHaveBeenCalledTimes(1);
    await schema['~run']({ value: 'foo' }, {});
    expect(definition).toHaveBeenCalledTimes(1);
    expect(definition.mock.calls[0][0].kind).toBe('schema');
  });

  test('exposes the wrapped schema immediately', async () => {
    const wrapped = string();
    const definition = vi.fn(() => wrapped);
    const schema = recursiveAsync(definition);
    expect(schema.wrapped).toBe(wrapped);
    await expectNoSchemaIssueAsync(schema, ['foo']);
    expect(definition).toHaveBeenCalledTimes(1);
  });
});
