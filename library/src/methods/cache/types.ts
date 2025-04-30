import type { OutputDataset } from '../../types/dataset.ts';
import type {
  BaseCache,
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';

/**
 * Cache instance options type.
 */
export interface CacheInstanceOptions<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> {
  /**
   * The cache instance.
   */
  cache: BaseCache<
    unknown,
    OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>
  >;
}
