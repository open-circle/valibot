import { describe, expect, test, vi } from 'vitest';
import {
  checkAsync,
  returnsAsync,
  transformAsync,
} from '../../actions/index.ts';
import { parseAsync, pipeAsync, safeParseAsync } from '../../methods/index.ts';
import { any } from '../any/index.ts';
import { arrayAsync } from '../array/index.ts';
import { objectAsync } from '../object/index.ts';
import { optional } from '../optional/index.ts';
import { string } from '../string/index.ts';
import type { RefAsync } from './recursive.ts';
import { recursiveAsync } from './recursiveAsync.ts';

describe('recursiveAsync execution', () => {
  test('constructs the definition once before concurrent async parses', async () => {
    const definition = vi.fn((self: RefAsync) =>
      objectAsync({ children: arrayAsync(self) })
    );
    const schema = recursiveAsync(definition);
    const input = { children: [{ children: [] }] };
    const parses = [parseAsync(schema, input), parseAsync(schema, input)];
    await expect(Promise.all(parses)).resolves.toStrictEqual([input, input]);
    expect(definition).toHaveBeenCalledOnce();
    expect(schema.wrapped).toBe(definition.mock.results[0].value);
  });

  test('propagates a synchronous definition exception during construction', () => {
    const error = new Error('construction failed');
    expect(() =>
      recursiveAsync(() => {
        throw error;
      })
    ).toThrow(error);
  });

  test('checks foreign references during construction', () => {
    const definition = vi.fn((self: RefAsync) =>
      objectAsync({ children: arrayAsync(self) })
    );
    recursiveAsync(definition);
    const foreign = definition.mock.calls[0][0];
    expect(() =>
      recursiveAsync(() => objectAsync({ children: arrayAsync(foreign) }))
    ).toThrow('Recursive reference used outside its recursive schema');
  });

  test('rejects foreign references inside async function return actions', () => {
    const definition = vi.fn((self: RefAsync) =>
      objectAsync({ children: arrayAsync(self) })
    );
    recursiveAsync(definition);
    const foreign = definition.mock.calls[0][0];
    expect(() =>
      recursiveAsync(() => pipeAsync(any(), returnsAsync(foreign)))
    ).toThrow('Recursive reference used outside its recursive schema');
  });

  test('applies async transformations and defaults at every depth', async () => {
    const schema = recursiveAsync((self) =>
      objectAsync({
        value: pipeAsync(
          string(),
          transformAsync(async (value) => value.length)
        ),
        label: optional(string(), 'default'),
        children: arrayAsync(self),
      })
    );
    const input = {
      value: 'root',
      children: [{ value: 'child', children: [] }],
    };
    const output = {
      value: 4,
      label: 'default',
      children: [{ value: 5, label: 'default', children: [] }],
    };
    await expect(parseAsync(schema, input)).resolves.toStrictEqual(output);
    await expect(schema['~standard'].validate(input)).resolves.toStrictEqual({
      typed: true,
      value: output,
    });
    expect(input.children[0].value).toBe('child');
  });

  test('preserves async validation messages, paths, and abort configuration', async () => {
    const schema = recursiveAsync((self) =>
      objectAsync({
        value: pipeAsync(
          string(),
          checkAsync(async (value) => value !== 'bad', 'invalid node')
        ),
        children: arrayAsync(self),
      })
    );
    const input = {
      value: 'ok',
      children: [
        { value: 'bad', children: [] },
        { value: 'bad', children: [] },
      ],
    };
    const result = await safeParseAsync(schema, input, { abortEarly: true });
    expect(result.success).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues?.[0]).toMatchObject({
      message: 'invalid node',
      abortEarly: true,
    });
    expect(result.issues?.[0].path?.map(({ key }) => key)).toStrictEqual([
      'children',
      0,
      'value',
    ]);
    const standard = await schema['~standard'].validate(input);
    expect(standard.issues).toHaveLength(2);
  });

  test('propagates exceptions from async transformations', async () => {
    const error = new Error('transform failed');
    const schema = recursiveAsync(() =>
      pipeAsync(
        string(),
        transformAsync(async () => {
          throw error;
        })
      )
    );
    await expect(parseAsync(schema, 'value')).rejects.toBe(error);
  });

  test('composes independent async recursive owners', async () => {
    const inner = recursiveAsync((self) =>
      objectAsync({ children: arrayAsync(self) })
    );
    const outer = recursiveAsync((self) =>
      objectAsync({ children: arrayAsync(self), tags: arrayAsync(inner) })
    );
    const input = {
      children: [{ children: [], tags: [{ children: [] }] }],
      tags: [{ children: [{ children: [] }] }],
    };
    await expect(parseAsync(outer, input)).resolves.toStrictEqual(input);
  });
});
