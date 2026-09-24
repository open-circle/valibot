import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * IBAN issue interface.
 */
export interface IbanIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'iban';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The validation function.
   */
  readonly requirement: (input: string) => boolean;
}

/**
 * IBAN action interface.
 */
export interface IbanAction<
  TInput extends string,
  TMessage extends ErrorMessage<IbanIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, IbanIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'iban';
  /**
   * The action reference.
   */
  readonly reference: typeof iban;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The validation function.
   */
  readonly requirement: (input: string) => boolean;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * IBAN country codes by length, starting with 15 characters, based on the
 * [SWIFT IBAN Registry](https://www.swift.com/standards/data-standards/iban-international-bank-account-number).
 */
const IBAN_COUNTRIES = [
  'NO', // 15
  'BE', // 16
  '', // 17
  'DKFIFKFOGLNLSD', // 18
  'MKSI', // 19
  'ATBAEEKZLTLUMNXK', // 20
  'CHHRLILV', // 21
  'BGBHCRDEGBGEIEMERSVA', // 22
  'AEGIILIQOMSOTL', // 23
  'ADCZESMDPKROSASESKTNVG', // 24
  'LYPTST', // 25
  'ISTR', // 26
  'BIDJFRGRITMCMRSM', // 27
  'ALAZBYCYDOGTHNHULBNIPLSV', // 28
  'BREGPSQAUA', // 29
  'JOKWMUYE', // 30
  'MTSC', // 31
  'LC', // 32
  'RU', // 33
];

/**
 * Creates an [IBAN](https://en.wikipedia.org/wiki/International_Bank_Account_Number) validation action.
 *
 * @returns An IBAN action.
 *
 * @beta
 */
export function iban<TInput extends string>(): IbanAction<TInput, undefined>;

/**
 * Creates an [IBAN](https://en.wikipedia.org/wiki/International_Bank_Account_Number) validation action.
 *
 * @param message The error message.
 *
 * @returns An IBAN action.
 *
 * @beta
 */
export function iban<
  TInput extends string,
  const TMessage extends ErrorMessage<IbanIssue<TInput>> | undefined,
>(message: TMessage): IbanAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function iban(
  message?: ErrorMessage<IbanIssue<string>>
): IbanAction<string, ErrorMessage<IbanIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'iban',
    reference: iban,
    async: false,
    expects: null,
    requirement(input) {
      // Check maximum length of print format with single spaces
      if (input.length > 67) {
        return false;
      }

      // Create necessary variables
      let count = 0;
      let prefix = 0;
      let remainder = 0;
      let space = true;

      // Validate characters and calculate ISO 7064 MOD 97-10 remainder of
      // BBAN in a single pass
      for (let index = 0; index < input.length; index++) {
        const charCode = input.charCodeAt(index);

        // Skip single spaces between characters, as leading and double
        // spaces are rejected as invalid characters below
        if (charCode === 32 && !space) {
          space = true;
          continue;
        }
        space = false;

        // Convert digits to 0 to 9 and uppercase letters to 10 to 35
        const value =
          charCode < 58 ? charCode - 48 : charCode > 64 ? charCode - 55 : -1;
        const isLetter = value > 9;

        // Check for letters in country code, digits in check digits and
        // digits or letters in BBAN
        if (
          value < 0 ||
          value > 35 ||
          (count < 2 ? !isLetter : count < 4 && isLetter)
        ) {
          return false;
        }

        // Collect country code and check digits or add character to remainder
        if (count++ < 4) {
          prefix = prefix * (isLetter ? 100 : 10) + value;
        } else {
          remainder = (remainder * (isLetter ? 100 : 10) + value) % 97;
        }
      }

      // Check trailing space, check digits, as the algorithm only produces
      // 02 to 98, and remainder with country code and check digits moved to
      // the end
      const checkDigits = prefix % 100;
      if (
        space ||
        checkDigits < 2 ||
        checkDigits > 98 ||
        (remainder * 1000000 + prefix) % 97 !== 1
      ) {
        return false;
      }

      // Check if country code is registered with this length
      const countries = IBAN_COUNTRIES[count - 15];
      if (countries) {
        const country = (prefix / 100) | 0;
        for (let index = 0; index < countries.length; index += 2) {
          if (
            (countries.charCodeAt(index) - 55) * 100 +
              countries.charCodeAt(index + 1) -
              55 ===
            country
          ) {
            return true;
          }
        }
      }
      return false;
    },
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement(dataset.value)) {
        _addIssue(this, 'IBAN', dataset, config);
      }
      return dataset;
    },
  };
}
