import type {
  GenericPipeItem,
  GenericPipeItemAsync,
  GenericSchema,
  GenericSchemaAsync,
} from '../../types/index.ts';
import { _getPreviousSchema } from '../../utils/_runBackwardPipe/_getPreviousSchema.ts';

/**
 * Returns the expected decoded discriminator without running the schema.
 *
 * @param schema The discriminator schema.
 *
 * @returns The expected decoded discriminator.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _getDiscriminatorExpected(
  schema: GenericSchema | GenericSchemaAsync
): string {
  if ('pipe' in schema) {
    const pipe = schema.pipe as readonly (
      | GenericPipeItem<unknown>
      | GenericPipeItemAsync<unknown>
    )[];
    const lastSchema = _getPreviousSchema(pipe, pipe.length);
    if (lastSchema) {
      return _getDiscriminatorExpected(lastSchema);
    }
  }
  if (schema.type === 'codec' && 'decoded' in schema) {
    return _getDiscriminatorExpected(
      schema.decoded as GenericSchema | GenericSchemaAsync
    );
  }
  return schema.expects;
}
