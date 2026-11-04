import type {
  BaseIssue,
  Config,
  ErrorMessage,
  GenericSchema,
  GenericSchemaAsync,
  InferInput,
  InferOutput,
  IssuePathItem,
  SuccessDataset,
} from '../../types/index.ts';

/**
 * Codec conversion issue interface.
 */
export interface CodecIssue<TInput> extends BaseIssue<TInput> {
  readonly kind: 'schema';
  readonly type: 'codec';
}

/**
 * Codec issue information interface.
 */
export interface CodecIssueInfo<TInput> {
  label?: string | undefined;
  input?: unknown | undefined;
  expected?: string | undefined;
  received?: string | undefined;
  message?: ErrorMessage<BaseIssue<TInput>> | undefined;
  path?: [IssuePathItem, ...IssuePathItem[]] | undefined;
}

/**
 * Codec conversion context interface.
 */
export interface CodecContext<TInput> {
  readonly dataset: SuccessDataset<TInput>;
  readonly config: Config<CodecIssue<TInput>>;
  readonly addIssue: (info?: CodecIssueInfo<TInput>) => void;
  readonly NEVER: never;
}

/**
 * Codec conversion operations interface.
 */
export interface CodecOperations<
  TEncoded extends GenericSchema | GenericSchemaAsync,
  TDecoded extends GenericSchema | GenericSchemaAsync,
> {
  readonly decode: (
    input: InferOutput<TEncoded>,
    context: CodecContext<InferOutput<TEncoded>>
  ) => InferInput<TDecoded>;
  readonly encode: (
    input: InferInput<TDecoded>,
    context: CodecContext<InferInput<TDecoded>>
  ) => InferOutput<TEncoded>;
}

/**
 * Async codec conversion operations interface.
 */
export interface CodecOperationsAsync<
  TEncoded extends GenericSchema | GenericSchemaAsync,
  TDecoded extends GenericSchema | GenericSchemaAsync,
> {
  readonly decode: (
    input: InferOutput<TEncoded>,
    context: CodecContext<InferOutput<TEncoded>>
  ) => InferInput<TDecoded> | Promise<InferInput<TDecoded>>;
  readonly encode: (
    input: InferInput<TDecoded>,
    context: CodecContext<InferInput<TDecoded>>
  ) => InferOutput<TEncoded> | Promise<InferOutput<TEncoded>>;
}
