import type { TitleAction } from '../../actions/title/title.ts';
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
          | TitleAction<unknown, string>
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
          | TitleAction<unknown, string>
        )[],
      ]
    >;

/**
 * Returns the title of the schema.
 *
 * If multiple titles are defined, the last one of the highest level is
 * returned. If no title is defined, `undefined` is returned.
 *
 * @param schema The schema to get the title from.
 *
 * @returns The title, if any.
 *
 * @beta
 */
// TODO: Investigate if return type can be strongly typed
// @__NO_SIDE_EFFECTS__
export function getTitle(schema: Schema): string | undefined {
  return _getLastMetadata(schema, 'title');
}
