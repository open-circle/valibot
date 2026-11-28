import { describe, expectTypeOf, test } from 'vitest';
import {
  anyOf,
  anyOfAsync,
  type AnyOfIssue,
  type AnyOfOptionsAsync,
  brand,
  type Brand,
  checkAsync,
  type CheckIssue,
  description,
  email,
  type EmailIssue,
  guard,
  type InferInput,
  type InferIssue,
  type InferOutput,
  pipe,
  pipeAsync,
  string,
  transformAsync,
} from '../../index.ts';

describe('anyOfAsync', () => {
  test('should infer message and issue types for mixed options', () => {
    const options = [
      email<string>(),
      checkAsync<string>(() => Promise.resolve(false)),
    ] as const satisfies AnyOfOptionsAsync;
    const action = anyOfAsync(options);
    expectTypeOf(action.options).toEqualTypeOf<typeof options>();
    expectTypeOf(action.async).toEqualTypeOf<true>();
    expectTypeOf(action.message).toEqualTypeOf<undefined>();
    expectTypeOf(
      anyOfAsync(options, 'invalid').message
    ).toEqualTypeOf<'invalid'>();
    type Issue = EmailIssue<string> | CheckIssue<string>;
    expectTypeOf<InferInput<typeof action>>().toEqualTypeOf<string>();
    expectTypeOf<InferOutput<typeof action>>().toEqualTypeOf<string>();
    expectTypeOf<InferIssue<typeof action>>().toEqualTypeOf<
      Issue | AnyOfIssue<Issue>
    >();
    anyOfAsync(options, (issue) => {
      expectTypeOf(issue).toEqualTypeOf<AnyOfIssue<Issue>>();
      return issue.expected;
    });
  });

  test('should infer nested outputs from the pipe input', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const schema = pipeAsync(
      string(),
      anyOfAsync([
        anyOf([
          guard((value: string): value is 'local' => value === 'local'),
          brand('id'),
        ]),
        anyOfAsync([
          transformAsync((value: string) => Promise.resolve(value.length)),
          transformAsync((value: string) => Promise.resolve(!!value)),
        ]),
      ])
    );
    expectTypeOf<InferOutput<typeof schema>>().toEqualTypeOf<
      'local' | (string & Brand<'id'>) | number | boolean
    >();
  });

  test('should reject invalid options and synchronous consumers', () => {
    // @ts-expect-error
    anyOfAsync([email()]);
    // @ts-expect-error
    anyOfAsync([email(), description('id')]);
    // @ts-expect-error
    anyOfAsync([email(), checkAsync((value: number) => value > 0)]);
    const asyncAction = anyOfAsync([email(), email()]);
    // @ts-expect-error
    anyOf([email(), asyncAction]);
    // @ts-expect-error
    pipe(string(), asyncAction);
  });
});
