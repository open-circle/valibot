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
  if (
    'wrapped' in schema &&
    (schema.type === 'optional' ||
      schema.type === 'exact_optional' ||
      schema.type === 'nullable' ||
      schema.type === 'nullish' ||
      schema.type === 'undefinedable')
  ) {
    const expected = _getDiscriminatorExpected(
      schema.wrapped as GenericSchema | GenericSchemaAsync
    );
    switch (schema.type) {
      case 'exact_optional':
        return expected;
      case 'nullable':
        return `(${expected} | null)`;
      case 'nullish':
        return `(${expected} | null | undefined)`;
      default:
        return `(${expected} | undefined)`;
    }
  }
  return schema.expects;
}
