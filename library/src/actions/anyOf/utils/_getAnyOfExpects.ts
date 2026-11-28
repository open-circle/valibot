import type { GenericValidation } from '../../../types/index.ts';
import { _joinExpects } from '../../../utils/index.ts';
import type { AnyOfOptionsAsync } from '../anyOfAsync.ts';

type UncheckedAnyOfOption = Partial<Record<keyof GenericValidation, unknown>>;

/**
 * Checks the options and builds their expectation string.
 *
 * @param options The alternatives to validate.
 * @param allowAsync Whether asynchronous actions are permitted.
 *
 * @returns The combined expectation.
 *
 * @internal
 */
export function _getAnyOfExpects(
  options: AnyOfOptionsAsync,
  allowAsync: boolean
): string {
  if (!Array.isArray(options) || options.length < 2) {
    throw new TypeError(
      'The any of options must contain at least two actions.'
    );
  }

  for (let index = 0; index < options.length; index++) {
    const action = options[index] as UncheckedAnyOfOption | null;

    if (
      !action ||
      typeof action !== 'object' ||
      typeof action.async !== 'boolean' ||
      (!allowAsync && action.async) ||
      typeof action.type !== 'string' ||
      typeof action.reference !== 'function' ||
      typeof action['~run'] !== 'function' ||
      !(
        (action.kind === 'validation' &&
          (action.expects === null || typeof action.expects === 'string')) ||
        action.kind === 'transformation'
      )
    ) {
      const type =
        typeof action?.type === 'string' ? ` of type "${action.type}"` : '';
      throw new TypeError(
        `The any of option at index ${index}${type} must be a ${allowAsync ? '' : 'sync '}validation or transformation action.`
      );
    }
  }

  return _joinExpects(
    options.map(
      (option) => ('expects' in option && option.expects) || option.type
    ),
    '|'
  );
}
