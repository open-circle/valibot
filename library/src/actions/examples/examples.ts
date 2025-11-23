import type { BaseMetadata } from '../../types';

/**
 * Examples action interface.
 */
export interface ExamplesAction<TInput, TExamples extends readonly TInput[]>
  extends BaseMetadata<TInput> {
  /**
   * The action type.
   */
  readonly type: 'examples';
  /**
   * The action reference.
   */
  readonly reference: typeof examples;
  /**
   * The examples.
   */
  readonly examples: TExamples;
}

/**
 * Creates an examples metadata action.
 *
 * @param examples_ The examples.
 *
 * @returns An examples action.
 */
// @__NO_SIDE_EFFECTS__
export function examples<TInput, const TExamples extends readonly TInput[]>(
  examples_: TExamples
): ExamplesAction<TInput, TExamples> {
  return {
    kind: 'metadata',
    type: 'examples',
    reference: examples,
    examples: examples_,
  };
}
