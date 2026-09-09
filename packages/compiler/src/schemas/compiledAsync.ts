import type {
  BaseIssue,
  BaseSchemaAsync,
  Config,
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
  UnknownDataset,
} from 'valibot';
import { _getStandardProps } from 'valibot';

/**
 * Compiled async schema interface.
 */
export interface CompiledSchemaAsync<
  TSchema extends BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> extends BaseSchemaAsync<
    InferInput<TSchema>,
    InferOutput<TSchema>,
    InferIssue<TSchema>
  > {
  /**
   * The schema type.
   */
  readonly type: 'compiled_async';
  /**
   * The schema reference.
   */
  readonly reference: typeof compiledAsync;
  /**
   * The wrapped schema.
   */
  readonly schema: TSchema;
}

/**
 * Creates a compiled async schema that wraps another async schema.
 *
 * At dev time, `~run` delegates to the wrapped schema. At build time, the
 * Valibot compiler plugin rewrites `~run` with optimized inline validation.
 *
 * @param schema The async schema to compile.
 *
 * @returns A compiled async schema.
 */
// @__NO_SIDE_EFFECTS__
export function compiledAsync<
  const TSchema extends BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): CompiledSchemaAsync<TSchema> {
  return {
    kind: 'schema',
    type: 'compiled_async',
    reference: compiledAsync,
    expects: schema.expects,
    async: true,
    schema,
    get '~standard'() {
      return _getStandardProps(this);
    },
    async '~run'(
      dataset: UnknownDataset,
      config: Config<BaseIssue<unknown>>
    ): Promise<OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>> {
      return schema['~run'](dataset, config);
    },
  };
}
