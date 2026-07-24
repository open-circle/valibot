/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseSchema, SuccessDataset } from '../../types/index.ts';
import { _standardSchema } from '../../utils/index.ts';

/**
 * Any schema interface.
 */
export interface AnySchema extends BaseSchema<any, any, never> {
  /**
   * The schema type.
   */
  readonly type: 'any';
  /**
   * The schema reference.
   */
  readonly reference: typeof any;
  /**
   * The expected property.
   */
  readonly expects: 'any';
}

/**
 * Creates an any schema.
 *
 * Hint: This schema function exists only for completeness and is not
 * recommended in practice. Instead, `unknown` should be used to accept
 * unknown data.
 *
 * @returns An any schema.
 */
// @__NO_SIDE_EFFECTS__
export function any(): AnySchema {
  return _standardSchema<AnySchema>({
    kind: 'schema',
    type: 'any',
    reference: any,
    expects: 'any',
    async: false,
    '~run'(dataset) {
      // @ts-expect-error
      dataset.typed = true;
      // @ts-expect-error
      return dataset as SuccessDataset<any>;
    },
  });
}
