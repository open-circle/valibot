import { describe, expect, test } from 'vitest';
import type { FailureDataset, InferIssue } from '../../types/index.ts';
import { expectNoSchemaIssue, expectSchemaIssue } from '../../vitest/index.ts';
import { jsonValue, type JsonValueSchema } from './jsonValue.ts';
import type { JsonValueIssue } from './types.ts';

describe('jsonValue', () => {
  describe('should return schema object', () => {
    const baseSchema: Omit<JsonValueSchema<never>, 'message'> = {
      kind: 'schema',
      type: 'jsonValue',
      reference: jsonValue,
      expects: '(string | number | boolean | null | Object | Array)',
      async: false,
      '~standard': {
        version: 1,
        vendor: 'valibot',
        validate: expect.any(Function),
      },
      '~run': expect.any(Function),
    };

    test('with undefined message', () => {
      const schema: JsonValueSchema<undefined> = {
        ...baseSchema,
        message: undefined,
      };
      expect(jsonValue()).toStrictEqual(schema);
      expect(jsonValue(undefined)).toStrictEqual(schema);
    });

    test('with string message', () => {
      expect(jsonValue('message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      } satisfies JsonValueSchema<'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(jsonValue(message)).toStrictEqual({
        ...baseSchema,
        message,
      } satisfies JsonValueSchema<typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    const schema = jsonValue();

    test('for strings', () => {
      expectNoSchemaIssue(schema, ['', 'foo', 'bar123']);
    });

    test('for numbers', () => {
      expectNoSchemaIssue(schema, [0, 123, -123, 1.23]);
    });

    test('for booleans', () => {
      expectNoSchemaIssue(schema, [true, false]);
    });

    test('for null', () => {
      expectNoSchemaIssue(schema, [null]);
    });

    test('for arrays', () => {
      expectNoSchemaIssue(schema, [[], [1, 'two', false, null]]);
    });

    test('for objects', () => {
      expectNoSchemaIssue(schema, [{}, { foo: 'bar', baz: 123 }]);
    });

    // Hint: This documents that only an object's own, enumerable,
    // string-keyed properties are checked, the same way `JSON.stringify`
    // ignores non-enumerable properties and symbol keys.
    test('for object with non-enumerable and symbol-keyed properties', () => {
      const input: Record<string | symbol, unknown> = { foo: 'bar' };
      Object.defineProperty(input, 'hidden', {
        value: () => {
          /* not a JSON value, but never visited */
        },
        enumerable: false,
      });
      input[Symbol('tag')] = () => {
        /* not a JSON value, but never visited */
      };
      const result = schema['~run']({ value: input }, {});
      expect(result).toStrictEqual({ typed: true, value: input });
      expect(result.value).toBe(input);
    });

    test('for deeply nested structures', () => {
      expectNoSchemaIssue(schema, [
        {
          name: 'Alice',
          tags: ['admin', 'user'],
          address: { city: 'NYC', zip: '10001' },
          history: [{ year: 2024, active: true }, null],
        },
      ]);
    });

    // Hint: This documents that jsonValue is validation-only: on success,
    // the input is returned unchanged, so no key is ever excluded, even
    // `__proto__`, `prototype`, and `constructor`.
    test('does not rebuild or alter the input on success', () => {
      const input = {
        name: 'Alice',
        tags: ['admin', 'user'],
        address: { city: 'NYC', zip: '10001' },
      };
      const result = schema['~run']({ value: input }, {});
      expect(result).toStrictEqual({ typed: true, value: input });
      expect(result.value).toBe(input);
      // @ts-expect-error `result.value` is narrowed to `JsonValue`
      expect(result.value.address).toBe(input.address);
      // @ts-expect-error `result.value` is narrowed to `JsonValue`
      expect(result.value.tags).toBe(input.tags);
    });

    test('for object with __proto__ key', () => {
      const input = JSON.parse('{"__proto__": 123, "foo": 456}');
      const result = schema['~run']({ value: input }, {});
      expect(result).toStrictEqual({ typed: true, value: input });
      expect(result.value).toBe(input);
    });

    test('for object with constructor and prototype keys', () => {
      const input = JSON.parse(
        '{"constructor":1,"prototype":2,"__proto__":3,"ok":4}'
      );
      const result = schema['~run']({ value: input }, {});
      expect(result).toStrictEqual({ typed: true, value: input });
      expect(result.value).toBe(input);
    });

    // Hint: This documents that a null-prototype object is treated as a
    // plain object, since it cannot be an instance of `Date`, `Map`, or any
    // other class.
    test('for object with null prototype', () => {
      const input = Object.assign(Object.create(null), { foo: 'bar' });
      const result = schema['~run']({ value: input }, {});
      expect(result).toStrictEqual({ typed: true, value: input });
      expect(result.value).toBe(input);
    });

    // Hint: This documents that a plain object created in another realm
    // (for example another `vm` context or, as simulated here, an iframe's
    // `contentWindow`) is still accepted, even though its prototype is not
    // `===` to this realm's `Object.prototype`.
    test('for plain object from another realm', () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      try {
        const otherWindow = iframe.contentWindow as unknown as typeof window;
        const input = new otherWindow.Object() as Record<string, unknown>;
        input.foo = 'bar';
        const result = schema['~run']({ value: input }, {});
        expect(result).toStrictEqual({ typed: true, value: input });
        expect(result.value).toBe(input);
      } finally {
        iframe.remove();
      }
    });

    // Hint: This documents that a plain array created in another realm is
    // still accepted, since its prototype is itself a real array (via
    // `Array.isArray`) that is otherwise plain-object-shaped, even though
    // it is not `===` to this realm's `Array.prototype`.
    test('for plain array from another realm', () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      try {
        const otherWindow = iframe.contentWindow as unknown as typeof window;
        const input: unknown[] = [1, 'two', false];
        Object.setPrototypeOf(input, otherWindow.Array.prototype);
        const result = schema['~run']({ value: input }, {});
        expect(result).toStrictEqual({ typed: true, value: input });
        expect(result.value).toBe(input);
      } finally {
        iframe.remove();
      }
    });
  });

  describe('should return dataset with issues', () => {
    const schema = jsonValue('message');
    const baseIssue: Omit<JsonValueIssue, 'input' | 'received'> = {
      kind: 'schema',
      type: 'jsonValue',
      expected: '(string | number | boolean | null | Object | Array)',
      message: 'message',
      requirement: undefined,
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    test('for undefined', () => {
      expectSchemaIssue(schema, baseIssue, [undefined]);
    });

    test('for functions', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
    });

    test('for symbols', () => {
      expectSchemaIssue(schema, baseIssue, [Symbol(), Symbol('foo')]);
    });

    test('for bigints', () => {
      expectSchemaIssue(schema, baseIssue, [0n, 123n]);
    });

    test('for NaN and Infinity', () => {
      expectSchemaIssue(schema, baseIssue, [NaN, Infinity, -Infinity]);
    });

    // Hint: Unlike `record`, this schema never copies the input into a new
    // plain object, so accepting a non-plain object would return it as is,
    // typed as `JsonValue`, even though it is really a live instance of
    // another class. It is rejected instead, even when it has no own
    // enumerable properties.
    test('for non-plain objects', () => {
      class Foo {
        bar = 'baz';
      }
      expectSchemaIssue(schema, baseIssue, [
        new Date(),
        new Map([['foo', 'bar']]),
        new Set([1, 2, 3]),
        new Foo(),
      ]);
    });

    // Hint: This documents that a custom class instance is rejected even if
    // its prototype's `constructor` property is reassigned to `Object`, to
    // impersonate a plain object. The check relies on the actual prototype
    // chain shape, not on this mutable, spoofable property.
    test('for object with spoofed constructor property', () => {
      class Foo {
        bar = 'baz';
      }
      Foo.prototype.constructor = Object;
      expectSchemaIssue(schema, baseIssue, [new Foo()], 'Object');
    });

    // Hint: Unlike `record`, this schema never copies the input into a new
    // array, so accepting an `Array` subclass instance would return it as
    // is, typed as `JsonValue`, even though it may carry extra behavior or
    // state beyond its indexed items.
    test('for array subclass instances', () => {
      class MyArray extends Array {}
      expectSchemaIssue(schema, baseIssue, [MyArray.from([1, 2])]);
    });

    // Hint: This documents that an array is rejected if its prototype is
    // not itself a real array (via `Array.isArray`), even when that
    // prototype is otherwise plain-object-shaped. Checking shape alone
    // would accept any ordinary object substituted as an array's
    // prototype, silently attaching its properties and methods (for
    // example a hijacked `map`) to the array.
    test('for array with an ordinary object as its prototype', () => {
      const input: number[] = [1, 2, 3];
      Object.setPrototypeOf(input, { map: () => 'hijacked' });
      expectSchemaIssue(schema, baseIssue, [input]);
    });

    // Hint: This documents that a hostile prototype whose `getPrototypeOf`
    // trap throws is treated as not plain, instead of making validation
    // throw. Only the prototype is a proxy here; `input` itself is a
    // regular object, so describing it in the issue message never invokes
    // the trap either.
    // Hint: This asserts on individual fields rather than with
    // `expectSchemaIssue`'s `toStrictEqual`, since deep-equality matchers
    // inspect the compared value's prototype and would trigger the same
    // trap themselves, unrelated to the schema's own behavior.
    test('for object with throwing getPrototypeOf trap in its prototype chain', () => {
      const evilProto = new Proxy(
        {},
        {
          getPrototypeOf() {
            throw new Error('should not be called');
          },
        }
      );
      const input: object = Object.create(evilProto);
      let result: FailureDataset<InferIssue<typeof schema>> | undefined;
      expect(() => {
        result = schema['~run']({ value: input }, {}) as FailureDataset<
          InferIssue<typeof schema>
        >;
      }).not.toThrow();
      expect(result?.typed).toBe(false);
      expect(result?.issues).toHaveLength(1);
      expect(result?.issues?.[0].received).toBe('Object');
    });

    // Hint: This documents that the plain-object check also excludes a
    // non-plain object from another realm, not just from this one.
    test('for non-plain object from another realm', () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      try {
        const otherWindow = iframe.contentWindow as unknown as typeof window;
        expectSchemaIssue(schema, baseIssue, [new otherWindow.Date()]);
      } finally {
        iframe.remove();
      }
    });
  });

  describe('should return dataset with nested issues', () => {
    const schema = jsonValue();

    test('for wrong value nested in array', () => {
      const input = ['foo', undefined, 'bar'];
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            kind: 'schema',
            type: 'jsonValue',
            input: undefined,
            expected: '(string | number | boolean | null | Object | Array)',
            received: 'undefined',
            message:
              'Invalid type: Expected (string | number | boolean | null | Object | Array) but received undefined',
            requirement: undefined,
            issues: undefined,
            lang: undefined,
            abortEarly: undefined,
            abortPipeEarly: undefined,
            path: [
              {
                type: 'array',
                origin: 'value',
                input,
                key: 1,
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for wrong value nested two levels deep in an object', () => {
      const address = { city: 'NYC', zip: undefined };
      const input = { name: 'Alice', address };
      const result = schema['~run']({ value: input }, {});
      expect(result.value).toBe(input);
      expect(result).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            kind: 'schema',
            type: 'jsonValue',
            input: undefined,
            expected: '(string | number | boolean | null | Object | Array)',
            received: 'undefined',
            message:
              'Invalid type: Expected (string | number | boolean | null | Object | Array) but received undefined',
            requirement: undefined,
            issues: undefined,
            lang: undefined,
            abortEarly: undefined,
            abortPipeEarly: undefined,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'address',
                value: address,
              },
              {
                type: 'object',
                origin: 'value',
                input: address,
                key: 'zip',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('with abort early', () => {
      const input = ['foo', undefined, 'bar', undefined];
      const result = schema['~run']({ value: input }, { abortEarly: true });
      expect(result.value).toBe(input);
      expect(result).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            kind: 'schema',
            type: 'jsonValue',
            input: undefined,
            expected: '(string | number | boolean | null | Object | Array)',
            received: 'undefined',
            message:
              'Invalid type: Expected (string | number | boolean | null | Object | Array) but received undefined',
            requirement: undefined,
            issues: undefined,
            lang: undefined,
            abortEarly: true,
            abortPipeEarly: undefined,
            path: [
              {
                type: 'array',
                origin: 'value',
                input,
                key: 1,
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for multiple wrong values nested in an array', () => {
      const input = ['foo', undefined, 'bar', undefined];
      const undefinedIssue = {
        kind: 'schema',
        type: 'jsonValue',
        input: undefined,
        expected: '(string | number | boolean | null | Object | Array)',
        received: 'undefined',
        message:
          'Invalid type: Expected (string | number | boolean | null | Object | Array) but received undefined',
        requirement: undefined,
        issues: undefined,
        lang: undefined,
        abortEarly: undefined,
        abortPipeEarly: undefined,
      } as const;
      expect(schema['~run']({ value: input }, {})).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...undefinedIssue,
            path: [
              {
                type: 'array',
                origin: 'value',
                input,
                key: 1,
                value: undefined,
              },
            ],
          },
          {
            ...undefinedIssue,
            path: [
              {
                type: 'array',
                origin: 'value',
                input,
                key: 3,
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('with abort early for an object', () => {
      const input = { a: undefined, b: undefined };
      const result = schema['~run']({ value: input }, { abortEarly: true });
      expect(result.value).toBe(input);
      expect(result).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            kind: 'schema',
            type: 'jsonValue',
            input: undefined,
            expected: '(string | number | boolean | null | Object | Array)',
            received: 'undefined',
            message:
              'Invalid type: Expected (string | number | boolean | null | Object | Array) but received undefined',
            requirement: undefined,
            issues: undefined,
            lang: undefined,
            abortEarly: true,
            abortPipeEarly: undefined,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'a',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    test('for wrong values nested through mixed array and object branches', () => {
      const list = [1, undefined];
      const meta = { ok: true, bad: undefined };
      const input = { list, meta };
      const undefinedIssue = {
        kind: 'schema',
        type: 'jsonValue',
        input: undefined,
        expected: '(string | number | boolean | null | Object | Array)',
        received: 'undefined',
        message:
          'Invalid type: Expected (string | number | boolean | null | Object | Array) but received undefined',
        requirement: undefined,
        issues: undefined,
        lang: undefined,
        abortEarly: undefined,
        abortPipeEarly: undefined,
      } as const;
      const result = schema['~run']({ value: input }, {});
      expect(result.value).toBe(input);
      expect(result).toStrictEqual({
        typed: false,
        value: input,
        issues: [
          {
            ...undefinedIssue,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'list',
                value: list,
              },
              {
                type: 'array',
                origin: 'value',
                input: list,
                key: 1,
                value: undefined,
              },
            ],
          },
          {
            ...undefinedIssue,
            path: [
              {
                type: 'object',
                origin: 'value',
                input,
                key: 'meta',
                value: meta,
              },
              {
                type: 'object',
                origin: 'value',
                input: meta,
                key: 'bad',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies FailureDataset<InferIssue<typeof schema>>);
    });

    // Hint: This documents that a sparse array's hole is read as `undefined`
    // and rejected like any other invalid item, unlike `JSON.stringify`,
    // which substitutes `null` for a hole.
    test('for a hole in a sparse array', () => {
      const input = [1, , 3]; // eslint-disable-line no-sparse-arrays
      const result = schema['~run']({ value: input }, {});
      expect(result.typed).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues?.[0].received).toBe('undefined');
      expect(result.issues?.[0].path).toStrictEqual([
        { type: 'array', origin: 'value', input, key: 1, value: undefined },
      ]);
    });

    test('for custom message applied to a nested issue', () => {
      const customSchema = jsonValue('custom message');
      const input = { a: [1, undefined] };
      const result = customSchema['~run']({ value: input }, {});
      expect(result.issues?.[0].message).toBe('custom message');
    });
  });

  describe('should reject circular references', () => {
    const schema = jsonValue();

    // Hint: `received` is explicitly set to `'circular reference'` rather
    // than left to describe `input`'s type (which would read `Object` or
    // `Array`, already present in the `expected` list, and so would be
    // self-contradictory: "Expected (... | Object | ...) but received
    // Object").
    test('for an object referencing itself', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const input: any = { foo: 1 };
      input.self = input;
      const result = schema['~run']({ value: input }, {});
      expect(result.typed).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues?.[0].received).toBe('circular reference');
      expect(result.issues?.[0].message).toBe(
        'Invalid type: Expected (string | number | boolean | null | Object | Array) but received circular reference'
      );
      expect(result.issues?.[0].path).toStrictEqual([
        { type: 'object', origin: 'value', input, key: 'self', value: input },
      ]);
    });

    test('for an array referencing itself', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const input: any[] = [1, 2];
      input.push(input);
      const result = schema['~run']({ value: input }, {});
      expect(result.typed).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues?.[0].received).toBe('circular reference');
      expect(result.issues?.[0].path).toStrictEqual([
        { type: 'array', origin: 'value', input, key: 2, value: input },
      ]);
    });

    test('for an object referencing an ancestor two levels up', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const root: any = { child: {} };
      root.child.grandchild = { root };
      const result = schema['~run']({ value: root }, {});
      expect(result.typed).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues?.[0].path).toStrictEqual([
        {
          type: 'object',
          origin: 'value',
          input: root,
          key: 'child',
          value: root.child,
        },
        {
          type: 'object',
          origin: 'value',
          input: root.child,
          key: 'grandchild',
          value: root.child.grandchild,
        },
        {
          type: 'object',
          origin: 'value',
          input: root.child.grandchild,
          key: 'root',
          value: root,
        },
      ]);
    });

    test('for the same object reused in sibling branches, not a cycle', () => {
      const shared = { x: 1 };
      const input = { a: shared, b: shared };
      expectNoSchemaIssue(schema, [input]);
    });

    test('for the same array reused as sibling elements, not a cycle', () => {
      const shared = [1, 2];
      const input = [shared, shared];
      expectNoSchemaIssue(schema, [input]);
    });

    // Hint: This documents that a shared, non-circular value referenced
    // from multiple places is validated once, not once per reference,
    // which would otherwise cost time exponential in the number of
    // references to it (see `_runJsonValue`'s `validated` hint). A getter
    // call count is asserted instead of wall-clock time, since the latter
    // would be flaky in CI.
    test('validates a value shared across many references only once', () => {
      let reads = 0;
      const shared: unknown = {};
      Object.defineProperty(shared, 'x', {
        enumerable: true,
        get() {
          reads++;
          return 1;
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let input: any = shared;
      for (let level = 0; level < 10; level++) {
        input = { left: input, right: input };
      }
      const result = schema['~run']({ value: input }, {});
      expect(result.typed).toBe(true);
      expect(result.issues).toBeUndefined();
      expect(reads).toBe(1);
    });
  });
});
