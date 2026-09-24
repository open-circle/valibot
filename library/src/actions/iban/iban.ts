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
 * IBAN countries by length, starting with 15 characters, based on the
 * [SWIFT IBAN Registry](https://www.swift.com/standards/data-standards/iban-international-bank-account-number).
 *
 * Hint: Each country code is followed by the BBAN structure, where `n` stands
 * for digits, `a` for uppercase letters and `c` for both.
 */
const IBAN_COUNTRIES = [
  'NO11n', // 15
  'BE12n', // 16
  '', // 17
  'DK14n FI14n FK2a12n FO14n GL14n NL4a10n SD14n', // 18
  'MK3n10c2n SI15n', // 19
  'AT16n BA16n EE16n KZ3n13c LT16n LU3n13c MN16n XK16n', // 20
  'CH5n12c HR17n LI5n12c LV4a13c', // 21
  'BG4a6n8c BH4a14c CR18n DE18n GB4a14n GE2a16n IE4a14n ME18n RS18n VA18n', // 22
  'AE19n GI4a15c IL19n IQ4a15n OM3n16c SO19n TL19n', // 23
  'AD8n12c CZ20n ES20n MD20c PK4a16c RO4a16c SA2n18c SE20n SK20n TN20n VG4a16n', // 24
  'LY21n PT21n ST21n', // 25
  'IS22n TR6n16c', // 26
  'BI23n DJ23n FR10n11c2n GR7n16c IT1a10n12c MC10n11c2n MR23n SM1a10n12c', // 27
  'AL8n16c AZ4a20c BY4c4n16c CY8n16c DO4c20n GT24c HN4a20n HU24n LB4n20c NI4a20n PL24n SV4a20n', // 28
  'BR8c15n2c EG25n PS4a21c QA4a21c UA6n19c', // 29
  'JO4a4n18c KW4a22c MU4a19n3a YE4a4n18c', // 30
  'MT4a5n18c SC4a20n3a', // 31
  'LC4a24c', // 32
  'RU14n15c', // 33
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
      let letters = 0;
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
        // and mark letter positions of BBAN
        if (count++ < 4) {
          prefix = prefix * (isLetter ? 100 : 10) + value;
        } else {
          remainder = (remainder * (isLetter ? 100 : 10) + value) % 97;
          if (isLetter) {
            letters |= 1 << (count - 5);
          }
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

      // Find BBAN structure of country with this length, as country codes are
      // separated by structures without uppercase letters
      const countries = IBAN_COUNTRIES[count - 15];
      let index = countries
        ? countries.indexOf(
            String.fromCharCode(
              ((prefix / 10000) | 0) + 55,
              (((prefix / 100) | 0) % 100) + 55
            )
          )
        : -1;
      if (index < 0) {
        return false;
      }

      // Check letter positions of BBAN against each segment of structure
      index += 2;
      for (let position = 0; position < count - 4; ) {
        let size = 0;
        let type = countries.charCodeAt(index++);
        while (type < 58) {
          size = size * 10 + type - 48;
          type = countries.charCodeAt(index++);
        }
        const mask = (1 << size) - 1;
        const segment = (letters >>> position) & mask;
        if (type === 110 ? segment : type === 97 && segment !== mask) {
          return false;
        }
        position += size;
      }
      return true;
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
