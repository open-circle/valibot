import type { DescriptionAction } from '../../actions/index.ts';
import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  PipeItem,
  PipeItemAsync,
} from '../../types/index.ts';
import { _getLastMetadata } from '../../utils/index.ts';
import type { SchemaWithPipe, SchemaWithPipeAsync } from '../index.ts';

/**
 * Schema type.
 */
type Schema =
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
  | SchemaWithPipe<
      readonly [
        BaseSchema<unknown, unknown, BaseIssue<unknown>>,
        ...(
          | PipeItem<any, unknown, BaseIssue<unknown>> // eslint-disable-line @typescript-eslint/no-explicit-any
          | DescriptionAction<unknown, string>
        )[],
      ]
    >
  | SchemaWithPipeAsync<
      readonly [
        (
          | BaseSchema<unknown, unknown, BaseIssue<unknown>>
          | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
        ),
        ...(
          | PipeItem<any, unknown, BaseIssue<unknown>> // eslint-disable-line @typescript-eslint/no-explicit-any
          | PipeItemAsync<any, unknown, BaseIssue<unknown>> // eslint-disable-line @typescript-eslint/no-explicit-any
          | DescriptionAction<unknown, string>
        )[],
      ]
    >;

/**
 * Returns the description of the schema.
 *
 * If multiple descriptions are defined, the last one of the highest level is
 * returned. If no description is defined, `undefined` is returned.
 *
 * @param schema The schema to get the description from.
 *
 * @returns The description, if any.
 *
 * @beta
 */
// TODO: Investigate if return type can be strongly typed
// @__NO_SIDE_EFFECTS__
export function getDescription(schema: Schema): string | undefined {
  return _getLastMetadata(schema, 'description');
}
