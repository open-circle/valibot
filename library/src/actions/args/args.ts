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
} from '../../types/index.ts';
import { ValiError } from '../../utils/index.ts';

export namespace args {
  /**
   * Schema type.
   */
  export type Schema =
    | LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined>
    | StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined>
    | TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined>
    | TupleWithRestSchema<
        TupleItems,
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<TupleWithRestIssue> | undefined
      >;
}

/**
 * Args action type.
 */
export interface ArgsAction<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput extends (...args: any[]) => unknown,
  TSchema extends args.Schema,
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
  TSchema extends args.Schema,
>(schema: TSchema): ArgsAction<TInput, TSchema>;

// @__NO_SIDE_EFFECTS__
export function args(
  schema: args.Schema
): ArgsAction<(...args: unknown[]) => unknown, args.Schema> {
  return {
    kind: 'transformation',
    type: 'args',
    reference: args,
    async: false,
    schema,
    '~run'(dataset, config) {
      const func = dataset.value;
      dataset.value = (...args_) => {
        const argsDataset = this.schema['~run']({ value: args_ }, config);
        if (argsDataset.issues) {
          throw new ValiError(argsDataset.issues);
        }
        return func(...argsDataset.value);
      };
      return dataset;
    },
  };
}
