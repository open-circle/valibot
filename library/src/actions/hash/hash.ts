import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * Hash lengths object.
 */
const HASH_LENGTHS = {
  md4: 32,
  md5: 32,
  sha1: 40,
  sha256: 64,
  sha384: 96,
  sha512: 128,
  ripemd128: 32,
  ripemd160: 40,
  tiger128: 32,
  tiger160: 40,
  tiger192: 48,
  crc32: 8,
  crc32b: 8,
  adler32: 8,
} as const;

/**
 * Hash type type.
 */
export type HashType = keyof typeof HASH_LENGTHS;

/**
 * Hash issue interface.
 */
export interface HashIssue<TInput extends string> extends BaseIssue<TInput> {
  /**
   * The issue kind.
   */
  readonly kind: 'validation';
  /**
   * The issue type.
   */
  readonly type: 'hash';
  /**
   * The expected property.
   */
  readonly expected: null;
  /**
   * The received property.
   */
  readonly received: `"${string}"`;
  /**
   * The hash regex.
   */
  readonly requirement: RegExp;
}

/**
 * Hash action interface.
 */
export interface HashAction<
  TInput extends string,
  TMessage extends ErrorMessage<HashIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, HashIssue<TInput>> {
  /**
   * The action type.
   */
  readonly type: 'hash';
  /**
   * The action reference.
   */
  readonly reference: typeof hash;
  /**
   * The expected property.
   */
  readonly expects: null;
  /**
   * The hash regex.
   */
  readonly requirement: RegExp;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a [hash](https://en.wikipedia.org/wiki/Hash_function) validation action.
 *
 * @param types The hash types.
 *
 * @returns A hash action.
 */
export function hash<TInput extends string>(
  types: [HashType, ...HashType[]]
): HashAction<TInput, undefined>;

/**
 * Creates a [hash](https://en.wikipedia.org/wiki/Hash_function) validation action.
 *
 * @param types The hash types.
 * @param message The error message.
 *
 * @returns A hash action.
 */
export function hash<
  TInput extends string,
  const TMessage extends ErrorMessage<HashIssue<TInput>> | undefined,
>(
  types: [HashType, ...HashType[]],
  message: TMessage
): HashAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function hash(
  types: [HashType, ...HashType[]],
  message?: ErrorMessage<HashIssue<string>>
): HashAction<string, ErrorMessage<HashIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'hash',
    reference: hash,
    expects: null,
    async: false,
    requirement: RegExp(
      types.map((type) => `^[a-fA-F0-9]{${HASH_LENGTHS[type]}}$`).join('|'),
      'u'
    ),
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'hash', dataset, config);
      }
      return dataset;
    },
  };
}
