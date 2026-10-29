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
 * IBAN countries by first letter of country code, based on the
 * [SWIFT IBAN Registry](https://www.swift.com/standards/data-standards/iban-international-bank-account-number).
 *
 * Hint: Each entry is the second letter of a country code followed by its
 * BBAN structure, where `n` stands for digits, `a` for uppercase letters and
 * `c` for both. For example, `E18n` in row `D` stands for `DE` with 18
 * digits. The structure also defines the length of the IBAN.
 */
const IBAN_COUNTRIES = [
  'D8n12c E19n L8n16c T16n Z4a20c', // A
  'A16n E12n G4a6n8c H4a14c I23n R8c15n2c Y4c4n16c', // B
  'H5n12c R18n Y8n16c Z20n', // C
  'E18n J23n K14n O4c20n', // D
  'E16n G25n S20n', // E
  'I14n K2a12n O14n R10n11c2n', // F
  'B4a14n E2a16n I4a15c L14n R7n16c T24c', // G
  'N4a20n R17n U24n', // H
  'E4a14n L19n Q4a15n S22n T1a10n12c', // I
  'O4a4n18c', // J
  'W4a22c Z3n13c', // K
  'B4n20c C4a24c I5n12c T16n U3n13c V4a13c Y21n', // L
  'C10n11c2n D20c E18n K3n10c2n N16n R23n T4a5n18c U4a19n3a', // M
  'I4a20n L4a10n O11n', // N
  'M3n16c', // O
  'K4a16c L24n S4a21c T21n', // P
  'A4a21c', // Q
  'O4a16c S18n U14n15c', // R
  'A2n18c C4a20n3a D14n E20n I15n K20n M1a10n12c O19n T21n V4a20n', // S
  'L19n N20n R6n16c', // T
  'A6n19c', // U
  'A18n G4a16n', // V
  '', // W
  'K16n', // X
  'E4a4n18c', // Y
  '', // Z
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

      // Create necessary variables, starting with the segment of two letters
      // of the country code
      let count = 0;
      let prefix = 0;
      let remainder = 0;
      let structure = '';
      let cursor = 0;
      let size = 2;
      let type = 97;
      let space = true;

      // Validate characters against segments of IBAN structure and calculate
      // ISO 7064 MOD 97-10 remainder of BBAN in a single pass
      for (let index = 0; index < input.length; index++) {
        const charCode = input.charCodeAt(index);

        // Skip single spaces between characters, as leading and double
        // spaces are rejected as invalid characters below
        if (charCode === 32 && !space) {
          space = true;
          continue;
        }
        space = false;

        // Start next segment, which is the check digits after the country
        // code or the next segment of the BBAN structure
        if (!size) {
          if (count === 2) {
            size = 2;
            type = 110;
          } else {
            while ((type = structure.charCodeAt(cursor++)) < 58) {
              size = size * 10 + type - 48;
            }

            // Reject characters after the end of the structure, where the
            // size is negative for the separating space or zero for the end
            // of the string
            if (size < 1) {
              return false;
            }
          }
        }
        size--;

        // Convert digits to 0 to 9 and uppercase letters to 10 to 35 and
        // check that the character matches the type of the segment
        const value =
          charCode < 58 ? charCode - 48 : charCode > 64 ? charCode - 55 : -1;
        if (value < (type === 97 ? 10 : 0) || value > (type === 110 ? 9 : 35)) {
          return false;
        }

        // Collect country code and check digits or add character to remainder
        if (count < 4) {
          prefix = prefix * (value > 9 ? 100 : 10) + value;
        } else {
          remainder = (remainder * (value > 9 ? 100 : 10) + value) % 97;
        }
        count++;

        // Find BBAN structure after second letter of country code
        if (count === 2) {
          structure = IBAN_COUNTRIES[input.charCodeAt(0) - 65];
          cursor = structure.indexOf(input[index]) + 1;
          if (!cursor) {
            return false;
          }
        }
      }

      // Check trailing space, end of structure and that check digits match
      // the ones calculated from BBAN and country code, which are moved to the
      // end with `00` as check digits
      const checkDigits = prefix % 100;
      return (
        !space &&
        !size &&
        !(structure.charCodeAt(cursor) > 47) &&
        checkDigits === 98 - ((remainder * 1000000 + prefix - checkDigits) % 97)
      );
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
