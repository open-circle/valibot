import type {
  BaseIssue,
  BaseTransformation,
  MaybeReadonly,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _joinExpects, _stringify } from '../../utils/index.ts';

/**
 * String to boolean options.
 */
export interface StringboolOptions {
  truthy?: MaybeReadonly<string[]>;
  falsy?: MaybeReadonly<string[]>;
  /**
   * Options: `"sensitive"`, `"insensitive"`
   *
   * @default `"insensitive"`
   */
  case?: 'sensitive' | 'insensitive' | undefined;
}

const defaultOptions: Required<StringboolOptions> = {
  truthy: ['true', '1', 'yes', 'y', 'on', 'enabled'],
  falsy: ['false', '0', 'no', 'n', 'off', 'disabled'],
  case: 'insensitive',
};

/**
 * String to boolean issue interface.
 */
export interface StringboolIssue<TInput> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'transformation';
  /**
   * The issue type.
   */
  readonly type: 'stringbool';
  /**
   * The expected property.
   */
  readonly expected: string;
}

/**
 * String to boolean action interface.
 */
export interface StringboolAction<
  TInput,
  TOptions extends StringboolOptions = StringboolOptions,
> extends BaseTransformation<TInput, boolean, StringboolIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'stringbool';
  /**
   * The action reference.
   */
  readonly reference: typeof stringbool;
  /**
   * The expected property.
   */
  readonly expects: string;
  /**
   * The stringbool options.
   */
  readonly options: TOptions;
}

/**
 * Creates a string to boolean transformation action.
 *
 * @param options The stringbool options.
 *
 * @returns A string to boolean action.
 */
// @__NO_SIDE_EFFECTS__
export function stringbool<
  TInput,
  TOptions extends StringboolOptions = StringboolOptions,
>(options?: TOptions): StringboolAction<TInput, TOptions> {
  let truthyValues = options?.truthy ?? defaultOptions.truthy;
  let falsyValues = options?.falsy ?? defaultOptions.falsy;
  const caseOption = options?.case ?? defaultOptions.case;

  if (caseOption !== 'sensitive') {
    truthyValues = truthyValues.map((value) => value.toLowerCase());
    falsyValues = falsyValues.map((value) => value.toLowerCase());
  }

  const truthySet = new Set(truthyValues);
  const falsySet = new Set(falsyValues);
  const validValues = [...truthyValues, ...falsyValues];

  const resolvedOptions = {
    truthy: truthyValues,
    falsy: falsyValues,
    case: caseOption,
  } as TOptions;

  return {
    kind: 'transformation',
    type: 'stringbool',
    reference: stringbool,
    expects: _joinExpects(validValues.map(_stringify), '|'),
    options: resolvedOptions,
    async: false,
    '~run'(dataset, config) {
      const inputAsString = String(dataset.value);
      const inputValue =
        resolvedOptions.case === 'insensitive'
          ? inputAsString.toLowerCase()
          : inputAsString;

      if (truthySet.has(inputValue)) {
        // @ts-expect-error
        dataset.value = true;
      } else if (falsySet.has(inputValue)) {
        // @ts-expect-error
        dataset.value = false;
      } else {
        _addIssue(this, 'stringbool', dataset, config);
        // @ts-expect-error
        dataset.typed = false;
      }

      return dataset as OutputDataset<boolean, StringboolIssue<TInput>>;
    },
  };
}
