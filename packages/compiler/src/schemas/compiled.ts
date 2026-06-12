import type {
  BaseIssue,
  BaseSchema,
  Config,
  InferInput,
  InferIssue,
  InferOutput,
  OutputDataset,
  UnknownDataset,
} from 'valibot';
import { _getStandardProps } from 'valibot';

/**
 * Compiled schema interface.
 */
export interface CompiledSchema<
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
> extends BaseSchema<
    InferInput<TSchema>,
    InferOutput<TSchema>,
    InferIssue<TSchema>
  > {
  /**
   * The schema type.
   */
  readonly type: 'compiled';
  /**
   * The schema reference.
   */
  readonly reference: typeof compiled;
  /**
   * The wrapped schema.
   */
  readonly schema: TSchema;
}

/**
 * Creates a compiled schema that wraps another schema.
 *
 * At dev time, `~run` delegates to the wrapped schema. At build time, the
 * Valibot compiler plugin rewrites `~run` with optimized inline validation.
 *
 * @param schema The schema to compile.
 *
 * @returns A compiled schema.
 */
// @__NO_SIDE_EFFECTS__
export function compiled<
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): CompiledSchema<TSchema> {
  return {
    kind: 'schema',
    type: 'compiled',
    reference: compiled,
    expects: schema.expects,
    async: false,
    schema,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(
      dataset: UnknownDataset,
      config: Config<BaseIssue<unknown>>
    ): OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>> {
      return schema['~run'](dataset, config);
    },
  };
}
