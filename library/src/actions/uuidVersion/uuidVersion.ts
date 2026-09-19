import type {
  BaseIssue,
  BaseValidation,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';

/**
 * The UUID version union type.
 */
export type UuidVersion = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Builds a UUID regex that checks for a specific version. The version is the
 * high nibble of the 13th hex digit (the first character of the third group).
 */
function uuidVersionRegex(version: UuidVersion): RegExp {
  return new RegExp(
    `^[\\da-f]{8}-[\\da-f]{4}-${version}[\\da-f]{3}-[\\da-f]{4}-[\\da-f]{12}$`,
    'iu',
  );
}

/**
 * UUID version issue interface.
 */
export interface UuidVersionIssue<TInput extends string>
  extends BaseIssue<TInput> {
  readonly kind: 'validation';
  readonly type: 'uuid_version';
  readonly expected: null;
  readonly received: `"${string}"`;
  readonly requirement: RegExp;
}

/**
 * UUID version action interface.
 */
export interface UuidVersionAction<
  TInput extends string,
  TMessage extends ErrorMessage<UuidVersionIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, UuidVersionIssue<TInput>> {
  readonly type: 'uuid_version';
  readonly reference: typeof uuidVersion;
  readonly expects: null;
  readonly requirement: RegExp;
  readonly message: TMessage;
}

/**
 * Creates a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)
 * validation action that checks for a specific version.
 *
 * @param version The UUID version (1-8).
 *
 * @returns An UUID version action.
 */
export function uuidVersion<TInput extends string>(
  version: UuidVersion,
): UuidVersionAction<TInput, undefined>;

/**
 * Creates a UUID validation action that checks for a specific version.
 *
 * @param version The UUID version (1-8).
 * @param message The error message.
 *
 * @returns An UUID version action.
 */
export function uuidVersion<
  TInput extends string,
  const TMessage extends ErrorMessage<UuidVersionIssue<TInput>> | undefined,
>(
  version: UuidVersion,
  message: TMessage,
): UuidVersionAction<TInput, TMessage>;

// @__NO_SIDE_EFFECTS__
export function uuidVersion(
  version: UuidVersion,
  message?: ErrorMessage<UuidVersionIssue<string>>,
): UuidVersionAction<string, ErrorMessage<UuidVersionIssue<string>> | undefined> {
  return {
    kind: 'validation',
    type: 'uuid_version',
    reference: uuidVersion,
    async: false,
    expects: null,
    requirement: uuidVersionRegex(version),
    message,
    '~run'(dataset, config) {
      if (dataset.typed && !this.requirement.test(dataset.value)) {
        _addIssue(this, 'UUID', dataset, config);
      }
      return dataset;
    },
  };
}