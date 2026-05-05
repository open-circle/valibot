import type {
  BaseIssue,
  Config,
  ErrorMessage,
  IssuePathItem,
  SuccessDataset,
} from '../../types/index.ts';

/**
 * Raw transform issue interface.
 */
export interface RawTransformIssue<TInput> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'transformation';
  /**
   * The issue type.
   */
  readonly type: 'raw_transform';
}

/**
 * Raw transform issue info interface.
 */
export interface RawTransformIssueInfo<TInput> {
  label?: string | undefined;
  input?: unknown | undefined;
  expected?: string | undefined;
  received?: string | undefined;
  message?: ErrorMessage<RawTransformIssue<TInput>> | undefined;
  path?: [IssuePathItem, ...IssuePathItem[]] | undefined;
}

/**
 * Raw transform add issue type.
 */
export type RawTransformAddIssue<TInput> = (
  info?: RawTransformIssueInfo<TInput>
) => void;

/**
 * Raw transform context interface.
 */
export interface RawTransformContext<TInput> {
  readonly dataset: SuccessDataset<TInput>;
  readonly config: Config<RawTransformIssue<TInput>>;
  readonly addIssue: RawTransformAddIssue<TInput>;
  readonly NEVER: never;
}
