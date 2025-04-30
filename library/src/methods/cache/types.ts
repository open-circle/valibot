import type { OutputDataset } from '../../types/dataset.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  InferIssue,
  InferOutput,
} from '../../types/index.ts';
import type { BaseCache } from '../../utils/index.ts';

export interface CacheInstanceOptions<
  TSchema extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> {
  cache: BaseCache<
    unknown,
    OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>
  >;
}
