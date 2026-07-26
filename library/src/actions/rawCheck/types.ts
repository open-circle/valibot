import type {
  BaseIssue,
  Config,
  ErrorMessage,
  IssuePathItem,
  OutputDataset,
} from '../../types/index.ts';

/**
 * Raw check issue interface.
 */
export interface RawCheckIssue<TInput> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'raw_check';
}

/**
 * Raw check issue info interface.
 */
export interface RawCheckIssueInfo<TInput> {
  label?: string | undefined;
  input?: unknown | undefined;
  expected?: string | undefined;
  received?: string | undefined;
  message?: ErrorMessage<RawCheckIssue<TInput>> | undefined;
  path?: [IssuePathItem, ...IssuePathItem[]] | undefined;
}

/**
 * Raw check add issue type.
 */
export type RawCheckAddIssue<TInput> = (
  info?: RawCheckIssueInfo<TInput>
) => void;

/**
 * Raw check context interface.
 */
export interface RawCheckContext<TInput> {
  readonly dataset: OutputDataset<TInput, BaseIssue<unknown>>;
  readonly config: Config<RawCheckIssue<TInput>>;
  readonly addIssue: RawCheckAddIssue<TInput>;
}
