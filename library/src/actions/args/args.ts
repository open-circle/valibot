import type {
  LooseTupleIssue,
  LooseTupleSchema,
  StrictTupleIssue,
  StrictTupleSchema,
  TupleIssue,
  TupleSchema,
  TupleWithRestIssue,
  TupleWithRestSchema,
} from '../../schemas/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseTransformation,
  ErrorMessage,
  InferInput,
  TupleItems,
  UnknownDataset,
} from '../../types/index.ts';
import { ValiError } from '../../utils/index.ts';

/**
 * Schema type.
 */
type Schema =
  | LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined>
  | StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined>
  | TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined>
  | TupleWithRestSchema<
      TupleItems,
      BaseSchema<unknown, unknown, BaseIssue<unknown>>,
      ErrorMessage<TupleWithRestIssue> | undefined
    >;

/**
 * Args action type.
 */
export interface ArgsAction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput extends (...args: any[]) => unknown,
  TSchema extends Schema,
> extends BaseTransformation<
    TInput,
    (...args: InferInput<TSchema>) => ReturnType<TInput>,
    never
  > {
  /**
   * The action type.
   */
  readonly type: 'args';
  /**
   * The action reference.
   */
  readonly reference: typeof args;
  /**
   * The arguments schema.
   */
  readonly schema: TSchema;
}

/**
 * Creates a function arguments transformation action.
 *
 * @param schema The arguments schema.
 *
 * @returns An args action.
 */
export function args<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput extends (...args: any[]) => unknown,
  TSchema extends Schema,
>(schema: TSchema): ArgsAction<TInput, TSchema>;

// @__NO_SIDE_EFFECTS__
export function args(
  schema: Schema
): ArgsAction<(...args: unknown[]) => unknown, Schema> {
  // Reusable dataset frame; safe because the wrapped function is synchronous and non-reentrant
  const _argsDataset: UnknownDataset = { value: undefined, typed: false, issues: undefined };
  return {
    kind: 'transformation',
    type: 'args',
    reference: args,
    async: false,
    schema,
    '~run'(dataset, config) {
      const func = dataset.value;
      dataset.value = (...args_) => {
        _argsDataset.value = args_;
        _argsDataset.typed = false;
        _argsDataset.issues = undefined;
        const argsDataset = this.schema['~run'](_argsDataset, config);
        if (argsDataset.issues) {
          throw new ValiError(argsDataset.issues);
        }
        return func(...argsDataset.value);
      };
      return dataset;
    },
  };
}
