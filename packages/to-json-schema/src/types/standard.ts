import type { StandardProps } from 'valibot';

/**
 * JSON Schema interface.
 */
export interface StandardJsonSchema<TInput, TOutput> {
  /**
   * The Standard JSON Schema properties.
   */
  readonly '~standard': StandardJsonProps<TInput, TOutput>;
}

/**
 * The Standard JSON Schema properties interface.
 */
interface StandardJsonProps<TInput, TOutput>
  extends StandardProps<TInput, TOutput> {
  /**
   * Methods for generating the input/output JSON Schema.
   */
  readonly jsonSchema: StandardJsonConverter;
}

/**
 * The Standard JSON Schema converter interface.
 */
interface StandardJsonConverter {
  /**
   * Converts the input type to JSON Schema. May throw if conversion is not supported.
   */
  readonly input: (options: StandardJsonOptions) => Record<string, unknown>;
  /**
   * Converts the output type to JSON Schema. May throw if conversion is not supported.
   */
  readonly output: (options: StandardJsonOptions) => Record<string, unknown>;
}

/**
 * The target version of the generated JSON Schema.
 */
type StandardJsonTarget =
  | 'draft-2020-12'
  | 'draft-07'
  | 'openapi-3.0'
  | ({} & string);

/**
 * The options for the input/output methods.
 */
interface StandardJsonOptions {
  /**
   * Specifies the target version of the generated JSON Schema.
   */
  readonly target: StandardJsonTarget;
  /**
   * Explicit support for additional vendor-specific parameters, if needed.
   */
  readonly libraryOptions?: Record<string, unknown> | undefined;
}
