import { describe, expect, test } from 'vitest';
import {
  any,
  array,
  arrayAsync,
  config,
  description,
  mutualRecursive,
  mutualRecursiveAsync,
  object,
  objectAsync,
  parse,
  parseAsync,
  pipe,
  pipeAsync,
  recursive,
  recursiveAsync,
  returns,
} from '../../index.ts';

const keys = ['normal', 'owner', 'reference', '~standard', '~types', 'wrapped'];
const foreignMessage = 'Recursive reference used outside its recursive schema';

describe('recursive reference traversal', () => {
  test('composes direct, piped, and configured sync recursive schemas', () => {
    const inners = [
      recursive((self) => object({ children: array(self) })),
      mutualRecursive((ref) => ({
        node: object({ children: array(ref('node')) }),
      })).node,
    ];
    const input = { inner: { children: [{ children: [] }] } };
    for (const inner of inners) {
      for (const schema of [
        inner,
        pipe(inner, description('inner')),
        config(inner, { abortEarly: true }),
      ]) {
        expect(
          parse(
            recursive(() => object({ inner: schema })),
            input
          )
        ).toStrictEqual(input);
        expect(
          parse(
            mutualRecursive(() => ({ root: object({ inner: schema }) })).root,
            input
          )
        ).toStrictEqual(input);
      }
    }
  });

  test('composes direct, piped, and configured recursive schemas in async roots', async () => {
    const inners = [
      recursive((self) => object({ children: array(self) })),
      mutualRecursive((ref) => ({
        node: object({ children: array(ref('node')) }),
      })).node,
      recursiveAsync((self) => objectAsync({ children: arrayAsync(self) })),
      mutualRecursiveAsync((ref) => ({
        node: objectAsync({ children: arrayAsync(ref('node')) }),
      })).node,
    ];
    const input = { inner: { children: [{ children: [] }] } };
    for (const inner of inners) {
      for (const schema of [
        inner,
        pipeAsync(inner, description('inner')),
        config(inner, { abortEarly: true }),
      ]) {
        await expect(
          parseAsync(
            recursiveAsync(() => objectAsync({ inner: schema })),
            input
          )
        ).resolves.toStrictEqual(input);
        await expect(
          parseAsync(
            mutualRecursiveAsync(() => ({
              root: objectAsync({ inner: schema }),
            })).root,
            input
          )
        ).resolves.toStrictEqual(input);
      }
    }
  });

  test.each(keys)(
    'rejects foreign references under the entry name %s',
    (key) => {
      const foreign = mutualRecursive((ref) => ({
        root: object({ children: array(ref('root')) }),
      })).root.wrapped.entries.children.item;
      expect(() => recursive(() => object({ [key]: foreign }))).toThrowError(
        foreignMessage
      );
      expect(() =>
        recursiveAsync(() => objectAsync({ [key]: foreign }))
      ).toThrowError(foreignMessage);
      expect(() =>
        mutualRecursive(() => ({ root: object({ [key]: foreign }) }))
      ).toThrowError(foreignMessage);
      expect(() =>
        mutualRecursiveAsync(() => ({ root: objectAsync({ [key]: foreign }) }))
      ).toThrowError(foreignMessage);
    }
  );

  test.each(keys)(
    'rejects unmatched references under the entry name %s',
    (key) => {
      expect(() => {
        // @ts-expect-error Deliberately exercise the runtime unmatched-reference check.
        return mutualRecursive((ref) => ({
          root: object({ [key]: ref('missing') }),
        }));
      }).toThrowError("Unmatched recursive reference: 'missing'");
      expect(() => {
        // @ts-expect-error Deliberately exercise the runtime unmatched-reference check.
        return mutualRecursiveAsync((ref) => ({
          root: objectAsync({ [key]: ref('missing') }),
        }));
      }).toThrowError("Unmatched recursive reference: 'missing'");
    }
  );

  test('rejects foreign references in actions appended to recursive schemas', () => {
    const foreign = recursive((self) => object({ children: array(self) }))
      .wrapped.entries.children.item;
    const inner = recursive(() => any());
    const innerAsync = recursiveAsync(() => any());
    expect(() => recursive(() => pipe(inner, returns(foreign)))).toThrowError(
      foreignMessage
    );
    expect(() =>
      // @ts-expect-error An unnamed foreign reference is invalid in mutual definitions.
      mutualRecursive(() => ({ root: pipe(inner, returns(foreign)) }))
    ).toThrowError(foreignMessage);
    expect(() =>
      recursiveAsync(() => pipeAsync(innerAsync, returns(foreign)))
    ).toThrowError(foreignMessage);
    expect(() =>
      // @ts-expect-error An unnamed foreign reference is invalid in mutual definitions.
      mutualRecursiveAsync(() => ({
        root: pipeAsync(innerAsync, returns(foreign)),
      }))
    ).toThrowError(foreignMessage);
  });
});
