import {
  getGlobalMessage,
  getSchemaMessage,
  getSpecificMessage,
} from '../../storages/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  BaseTransformation,
  BaseTransformationAsync,
  BaseValidation,
  BaseValidationAsync,
  Config,
  ErrorMessage,
  InferInput,
  InferIssue,
  IssuePathItem,
  OutputDataset,
  UnknownDataset,
} from '../../types/index.ts';
import { _stringify } from '../_stringify/index.ts';

/**
 * Context type.
 */
type Context =
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | BaseValidation<any, unknown, BaseIssue<unknown>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | BaseValidationAsync<any, unknown, BaseIssue<unknown>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | BaseTransformation<any, unknown, BaseIssue<unknown>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | BaseTransformationAsync<any, unknown, BaseIssue<unknown>>;

/**
 * Other interface.
 */
interface Other<TContext extends Context> {
  input?: unknown | undefined;
  expected?: string | undefined;
  received?: string | undefined;
  message?: ErrorMessage<InferIssue<TContext>> | undefined;
  path?: [IssuePathItem, ...IssuePathItem[]] | undefined;
  issues?:
    | [BaseIssue<InferInput<TContext>>, ...BaseIssue<InferInput<TContext>>[]]
    | undefined;
}

/**
 * Adds an issue to the dataset.
 *
 * @param context The issue context.
 * @param label The issue label.
 * @param dataset The input dataset.
 * @param config The configuration.
 * @param other The optional props.
 *
 * @internal
 */
export function _addIssue<const TContext extends Context>(
  context: TContext & {
    expects?: string | null;
    requirement?: unknown;
    message?:
      | ErrorMessage<Extract<InferIssue<TContext>, { type: TContext['type'] }>>
      | undefined;
  },
  label: string,
  dataset: UnknownDataset | OutputDataset<unknown, BaseIssue<unknown>>,
  config: Config<InferIssue<TContext>>,
  other?: Other<TContext>
): void {
  // Get expected and received string
  const input = other && 'input' in other ? other.input : dataset.value;
  const expected = other?.expected ?? context.expects ?? null;
  const received = other?.received ?? _stringify(input);

  // Create issue object
  // Hint: The issue is deliberately not constructed with the spread operator
  // for performance reasons
  const issue: BaseIssue<unknown> = {
    kind: context.kind,
    type: context.type,
    input,
    expected,
    received,
    message: `Invalid ${label}: ${
      expected ? `Expected ${expected} but r` : 'R'
    }eceived ${received}`,
    requirement: context.requirement,
    path: other?.path,
    issues: other?.issues,
    lang: config.lang,
    abortEarly: config.abortEarly,
    abortPipeEarly: config.abortPipeEarly,
  };

  // Check if context is a schema
  const isSchema = context.kind === 'schema';

  // Get custom issue message
  const message =
    other?.message ??
    context.message ??
    getSpecificMessage(context.reference, issue.lang) ??
    (isSchema ? getSchemaMessage(issue.lang) : null) ??
    config.message ??
    getGlobalMessage(issue.lang);

  // If custom message if specified, override default message
  if (message !== undefined) {
    // @ts-expect-error
    issue.message =
      typeof message === 'function'
        ? // @ts-expect-error
          message(issue)
        : message;
  }

  // If context is a schema, set typed to `false`
  if (isSchema) {
    dataset.typed = false;
  }

  // Add issue to dataset
  if (dataset.issues) {
    dataset.issues.push(issue);
  } else {
    // @ts-expect-error
    dataset.issues = [issue];
  }
}
