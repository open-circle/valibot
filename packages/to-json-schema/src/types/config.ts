import type * as v from 'valibot';
import type { JsonSchema } from './schema.ts';

/**
 * JSON Schema conversion context interface.
 */
export interface ConversionContext {
  /**
   * The JSON Schema definitions that have already been created.
   */
  readonly definitions: Record<string, JsonSchema>;
  /**
   * The JSON Schema reference map that is used to look up the reference ID
   * for a given Valibot schema.
   */
  readonly referenceMap: Map<
    v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
    string
  >;
  /**
   * The lazy schema getter map that is used internally to ensure that
   * recursive lazy schemas are unwrapped only once.
   */
  readonly getterMap: Map<
    (input: unknown) => v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
    v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
  >;
}

/**
 * JSON Schema override context interface for schemas.
 *
 * @beta
 */
export interface OverrideSchemaContext extends ConversionContext {
  /**
   * The JSON Schema reference ID.
   */
  readonly referenceId: string | undefined;
  /**
   * The Valibot schema to be converted.
   */
  readonly valibotSchema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
  /**
   * The converted JSON Schema.
   */
  readonly jsonSchema: JsonSchema;
  /**
   * The errors of the current Valibot schema conversion.
   */
  readonly errors: [string, ...string[]] | undefined;
}

/**
 * JSON Schema override context interface for actions.
 *
 * @beta
 */
export interface OverrideActionContext {
  /**
   * The Valibot action to be converted.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly valibotAction: v.PipeAction<any, any, v.BaseIssue<unknown>>;
  /**
   * The converted JSON Schema.
   */
  readonly jsonSchema: JsonSchema;
  /**
   * The errors of the current Valibot action conversion.
   */
  readonly errors: [string, ...string[]] | undefined;
}

/**
 * JSON Schema override context interface for references.
 *
 * @beta
 */
export interface OverrideRefContext extends ConversionContext {
  /**
   * The JSON Schema reference ID.
   */
  readonly referenceId: string;
  /**
   * The Valibot schema to be converted.
   */
  readonly valibotSchema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;
  /**
   * The converted JSON Schema.
   */
  readonly jsonSchema: JsonSchema;
}

/**
 * JSON Schema conversion config interface.
 */
export interface ConversionConfig {
  /**
   * The target JSON Schema draft version. Defaults to 'draft-07'.
   */
  readonly target?: 'draft-07' | 'draft-2020-12' | 'openapi-3.0';
  /**
   * Whether to convert the input or output type of the Valibot schema to JSON Schema.
   *
   * When set to 'input', conversion stops before the first potential type
   * transformation action or second schema in any pipeline.
   *
   * When set to 'output', conversion of any pipelines starts from the last
   * schema in the pipeline. Therefore, the output type must be specified
   * explicitly with a schema after the last type transformation action.
   *
   * @beta
   */
  readonly typeMode?: 'ignore' | 'input' | 'output';
  /**
   * The policy for handling incompatible schemas and actions.
   */
  readonly errorMode?: 'throw' | 'warn' | 'ignore';
  /**
   * The schema definitions for constructing recursive schemas. If not
   * specified, the definitions are generated automatically as needed.
   */
  readonly definitions?: Record<
    string,
    v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
  >;
  /**
   * Overrides the JSON Schema conversion for a specific Valibot schema.
   *
   * Only return a JSON Schema if you want to override the default conversion
   * behaviour and suppress errors for a specific schema. Returning either
   * `null` or `undefined` will skip the override.
   *
   * @param context The conversion context.
   *
   * @returns A JSON Schema, if overridden.
   *
   * @beta
   */
  readonly overrideSchema?: (
    context: OverrideSchemaContext
  ) => JsonSchema | null | undefined;
  /**
   * The actions that should be ignored during the conversion.
   *
   * @beta
   */
  readonly ignoreActions?: string[];
  /**
   * Overrides the JSON Schema reference for a specific Valibot action.
   *
   * Only return a JSON Schema if you want to override the default conversion
   * behaviour and suppress errors for a specific action. Returning either
   * `null` or `undefined` will skip the override.
   *
   * @param context The conversion context.
   *
   * @returns A JSON Schema, if overridden.
   *
   * @beta
   */
  readonly overrideAction?: (
    context: OverrideActionContext
  ) => JsonSchema | null | undefined;
  /**
   * Overrides the JSON Schema reference for a specific reference ID.
   *
   * @param context The conversion context.
   *
   * @returns A reference ID, if overridden.
   *
   * @beta
   */
  readonly overrideRef?: (
    context: OverrideRefContext
  ) => string | null | undefined;
}
