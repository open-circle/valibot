import type {
  BaseIssue,
  BaseSchema,
  ErrorMessage,
  OutputDataset,
} from '../../types/index.ts';
import {
  _addIssue,
  _joinExpects,
  _standardSchema,
  _stringify,
} from '../../utils/index.ts';

/**
 * Enum interface.
 */
export interface Enum {
  [key: string]: string | number;
}

/**
 * Enum values type.
 */
export type EnumValues<TEnum extends Enum> = {
  [TKey in keyof TEnum]: TKey extends number
    ? TEnum[TKey] extends string
      ? TEnum[TEnum[TKey]] extends TKey
        ? never
        : TEnum[TKey]
      : TEnum[TKey]
    : TKey extends 'NaN' | 'Infinity' | '-Infinity'
      ? TEnum[TKey] extends string
        ? TEnum[TEnum[TKey]] extends number
          ? never
          : TEnum[TKey]
        : TEnum[TKey]
      : TKey extends `+${number}`
        ? TEnum[TKey]
        : TKey extends `${infer TNumber extends number}`
          ? TEnum[TKey] extends string
            ? TEnum[TEnum[TKey]] extends TNumber
              ? never
              : TEnum[TKey]
            : TEnum[TKey]
          : TEnum[TKey];
}[keyof TEnum];

/**
 * Enum issue interface.
 */
export interface EnumIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'enum';
  /**
   * The expected property.
   */
  readonly expected: string;
}

/**
 * Enum schema interface.
 */
export interface EnumSchema<
  TEnum extends Enum,
  TMessage extends ErrorMessage<EnumIssue> | undefined,
> extends BaseSchema<EnumValues<TEnum>, EnumValues<TEnum>, EnumIssue> {
  /**
   * The schema type.
   */
  readonly type: 'enum';
  /**
   * The schema reference.
   */
  readonly reference: typeof enum_;
  /**
   * The enum object.
   */
  readonly enum: TEnum;
  /**
   * The enum options.
   */
  readonly options: EnumValues<TEnum>[];
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates an enum schema.
 *
 * @param enum__ The enum object.
 *
 * @returns An enum schema.
 */
export function enum_<const TEnum extends Enum>(
  enum__: TEnum
): EnumSchema<TEnum, undefined>;

/**
 * Creates an enum schema.
 *
 * @param enum__ The enum object.
 * @param message The error message.
 *
 * @returns An enum schema.
 */
export function enum_<
  const TEnum extends Enum,
  const TMessage extends ErrorMessage<EnumIssue> | undefined,
>(enum__: TEnum, message: TMessage): EnumSchema<TEnum, TMessage>;

// @__NO_SIDE_EFFECTS__
export function enum_(
  enum__: Enum,
  message?: ErrorMessage<EnumIssue>
): EnumSchema<Enum, ErrorMessage<EnumIssue> | undefined> {
  const options: EnumValues<Enum>[] = [];
  for (const key in enum__) {
    if (
      `${+key}` !== key ||
      typeof enum__[key] !== 'string' ||
      !Object.is(enum__[enum__[key]], +key)
    ) {
      options.push(enum__[key]);
    }
  }
  return _standardSchema<EnumSchema<Enum, ErrorMessage<EnumIssue> | undefined>>(
    {
      kind: 'schema',
      type: 'enum',
      reference: enum_,
      expects: _joinExpects(options.map(_stringify), '|'),
      async: false,
      enum: enum__,
      options,
      message,
      '~run'(
        this: EnumSchema<Enum, ErrorMessage<EnumIssue> | undefined>,
        dataset,
        config
      ) {
        // @ts-expect-error
        if (this.options.includes(dataset.value)) {
          // @ts-expect-error
          dataset.typed = true;
        } else {
          _addIssue(this, 'type', dataset, config);
        }
        // @ts-expect-error
        return dataset as OutputDataset<string | number, EnumIssue>;
      },
    }
  );
}

export { enum_ as enum };
