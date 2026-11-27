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
 * @param input The rejected discriminator value.
 *
 * @returns The expected decoded discriminator.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _getDiscriminatorExpected(
  schema: GenericSchema | GenericSchemaAsync,
  input: unknown
): string {
  if ('pipe' in schema) {
    const pipe = schema.pipe as readonly (
      | GenericPipeItem<unknown>
      | GenericPipeItemAsync<unknown>
    )[];
    const lastSchema = _getPreviousSchema(pipe, pipe.length);
    if (lastSchema) {
      return _getDiscriminatorExpected(lastSchema, input);
    }
  }
  if (schema.type === 'codec' && 'decoded' in schema) {
    return _getDiscriminatorExpected(
      schema.decoded as GenericSchema | GenericSchemaAsync,
      input
    );
  }
  if ('wrapped' in schema) {
    const wrapped = schema.wrapped as GenericSchema | GenericSchemaAsync;
    const expected = _getDiscriminatorExpected(wrapped, input);
    // Exclude replaced undefined defaults without evaluating callbacks again
    if (
      (schema.type === 'optional' || schema.type === 'undefinedable') &&
      'default' in schema &&
      schema.default !== undefined &&
      (typeof schema.default !== 'function' || input === undefined)
    ) {
      return expected;
    }
    return schema.expects.replace(wrapped.expects, () => expected);
  }
  return schema.expects;
}
