import type {
  LooseTupleIssue,
  LooseTupleSchema,
  LooseTupleSchemaAsync,
  StrictTupleIssue,
  StrictTupleSchema,
  StrictTupleSchemaAsync,
  TupleIssue,
  TupleSchema,
  TupleSchemaAsync,
  TupleWithRestIssue,
  TupleWithRestSchema,
  TupleWithRestSchemaAsync,
} from '../../schemas/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  BaseTransformation,
  ErrorMessage,
  InferInput,
  SuccessDataset,
  TupleItems,
  TupleItemsAsync,
} from '../../types/index.ts';
import { ValiError } from '../../utils/index.ts';

export namespace argsAsync {
  /**
   * Schema type.
   */
  export type Schema =
    | LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined>
    | LooseTupleSchemaAsync<
        TupleItemsAsync,
        ErrorMessage<LooseTupleIssue> | undefined
      >
    | StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined>
    | StrictTupleSchemaAsync<
        TupleItemsAsync,
        ErrorMessage<StrictTupleIssue> | undefined
      >
    | TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined>
    | TupleSchemaAsync<TupleItemsAsync, ErrorMessage<TupleIssue> | undefined>
    | TupleWithRestSchema<
        TupleItems,
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<TupleWithRestIssue> | undefined
      >
    | TupleWithRestSchemaAsync<
        TupleItemsAsync,
        | BaseSchema<unknown, unknown, BaseIssue<unknown>>
        | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<TupleWithRestIssue> | undefined
      >;
}

/**
 * Args action async type.
 */
export interface ArgsActionAsync<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput extends (...args: any[]) => unknown,
  TSchema extends argsAsync.Schema,
> extends BaseTransformation<
    TInput,
    (...args: InferInput<TSchema>) => Promise<Awaited<ReturnType<TInput>>>,
    never
  > {
  /**
   * The action type.
   */
  readonly type: 'args';
  /**
   * The action reference.
   */
  readonly reference: typeof argsAsync;
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
export function argsAsync<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TInput extends (...args: any[]) => unknown,
  TSchema extends argsAsync.Schema,
>(schema: TSchema): ArgsActionAsync<TInput, TSchema>;

// @__NO_SIDE_EFFECTS__
export function argsAsync(
  schema: argsAsync.Schema
): ArgsActionAsync<(...args: unknown[]) => unknown, argsAsync.Schema> {
  return {
    kind: 'transformation',
    type: 'args',
    reference: argsAsync,
    async: false,
    schema,
    '~run'(dataset, config) {
      const func = dataset.value;
      dataset.value = async (...args) => {
        const argsDataset = await schema['~run']({ value: args }, config);
        if (argsDataset.issues) {
          throw new ValiError(argsDataset.issues);
        }
        return func(...argsDataset.value);
      };
      return dataset as SuccessDataset<
        (...args: unknown[]) => Promise<unknown>
      >;
    },
  };
}
