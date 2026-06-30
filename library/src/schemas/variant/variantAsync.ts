import { ABORT_EARLY_CONFIG } from '../../const.ts';
import type {
  BaseIssue,
  BaseSchemaAsync,
  ErrorMessage,
  InferInput,
  InferOutput,
  OutputDataset,
} from '../../types/index.ts';
import {
  _addIssue,
  _getStandardProps,
  _joinExpects,
} from '../../utils/index.ts';
import type {
  InferVariantIssue,
  VariantIssue,
  VariantOptionsAsync,
  VariantOptionSchema,
  VariantOptionSchemaAsync,
} from './types.ts';
import type { variant } from './variant.ts';

/**
 * Builds a map from discriminator value to variant option for O(1) dispatch.
 *
 * Returns `null` (disabling the fast path) whenever the options cannot be
 * unambiguously keyed by a single discriminator value: a nested variant, a
 * discriminator schema whose accepted values are not statically enumerable
 * (only `literal`, `enum` and `picklist` are), a `NaN` value (Map lookups use
 * SameValueZero, `literal` compares with `===`), or a value claimed by more
 * than one option.
 *
 * @param key The discriminator key.
 * @param options The variant options.
 *
 * @returns The discriminator map or `null`.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
function _buildDiscriminatorMap(
  key: string,
  options: VariantOptionsAsync<string>
): Map<unknown, VariantOptionsAsync<string>[number]> | null {
  const map = new Map<unknown, VariantOptionsAsync<string>[number]>();
  for (const option of options) {
    // Nested variants cannot be statically keyed here
    if (option.type === 'variant') {
      return null;
    }
    const discriminatorSchema = option.entries[key];
    let values: readonly unknown[];
    if (!discriminatorSchema) {
      return null;
    } else if (discriminatorSchema.type === 'literal') {
      // @ts-expect-error
      values = [discriminatorSchema.literal];
    } else if (
      discriminatorSchema.type === 'enum' ||
      discriminatorSchema.type === 'picklist'
    ) {
      // @ts-expect-error
      values = discriminatorSchema.options;
    } else {
      // Non-enumerable discriminator (e.g. optional, union, custom)
      return null;
    }
    for (const value of values) {
      // `NaN` would match under SameValueZero but never under `===`
      if (value !== value) {
        return null;
      }
      // Colliding discriminator values are ambiguous
      if (map.has(value)) {
        return null;
      }
      map.set(value, option);
    }
  }
  return map;
}

/**
 * Variant schema async interface.
 */
export interface VariantSchemaAsync<
  TKey extends string,
  TOptions extends VariantOptionsAsync<TKey>,
  TMessage extends ErrorMessage<VariantIssue> | undefined,
> extends BaseSchemaAsync<
    InferInput<TOptions[number]>,
    InferOutput<TOptions[number]>,
    VariantIssue | InferVariantIssue<TOptions>
  > {
  /**
   * The schema type.
   */
  readonly type: 'variant';
  /**
   * The schema reference.
   */
  readonly reference: typeof variant | typeof variantAsync;
  /**
   * The expected property.
   */
  readonly expects: 'Object';
  /**
   * The discriminator key.
   */
  readonly key: TKey;
  /**
   * The variant options.
   */
  readonly options: TOptions;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a variant schema.
 *
 * @param key The discriminator key.
 * @param options The variant options.
 *
 * @returns A variant schema.
 */
export function variantAsync<
  const TKey extends string,
  const TOptions extends VariantOptionsAsync<TKey>,
>(key: TKey, options: TOptions): VariantSchemaAsync<TKey, TOptions, undefined>;

/**
 * Creates a variant schema.
 *
 * @param key The discriminator key.
 * @param options The variant options.
 * @param message The error message.
 *
 * @returns An variant schema.
 */
export function variantAsync<
  const TKey extends string,
  const TOptions extends VariantOptionsAsync<TKey>,
  const TMessage extends ErrorMessage<VariantIssue> | undefined,
>(
  key: TKey,
  options: TOptions,
  message: TMessage
): VariantSchemaAsync<TKey, TOptions, TMessage>;

// @__NO_SIDE_EFFECTS__
export function variantAsync(
  key: string,
  options: VariantOptionsAsync<string>,
  message?: ErrorMessage<VariantIssue>
): VariantSchemaAsync<
  string,
  VariantOptionsAsync<string>,
  ErrorMessage<VariantIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'variant',
    reference: variantAsync,
    expects: 'Object',
    async: true,
    key,
    options,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    async '~run'(dataset, config) {
      // Get input value from dataset
      const input = dataset.value;

      // If root type is valid, check nested types
      if (input && typeof input === 'object') {
        // Lazily build a discriminator map for O(1) option dispatch. It is
        // `null` whenever the options cannot be unambiguously keyed by a single
        // discriminator value, in which case the slow path below is used.
        // @ts-expect-error
        let discriminatorMap = this._discriminatorMap as
          | Map<unknown, VariantOptionsAsync<string>[number]>
          | null
          | undefined;
        if (discriminatorMap === undefined) {
          discriminatorMap = _buildDiscriminatorMap(this.key, this.options);
          // @ts-expect-error
          this._discriminatorMap = discriminatorMap;
        }

        // Fast path: dispatch directly to the single option whose discriminator
        // matches the input. On a miss, fall through to the slow path so the
        // discriminator issue and message are produced identically.
        if (discriminatorMap) {
          // @ts-expect-error
          const option = discriminatorMap.get(input[this.key]);
          if (option) {
            return (await option['~run'](
              { value: input },
              config
            )) as OutputDataset<
              InferOutput<VariantOptionsAsync<string>[number]>,
              VariantIssue | BaseIssue<unknown>
            >;
          }
        }

        // Create output dataset variable
        let outputDataset:
          | OutputDataset<unknown, BaseIssue<unknown>>
          | undefined;

        // Create variables to store invalid discriminator information
        let maxDiscriminatorPriority = 0;
        let invalidDiscriminatorKey = this.key;
        let expectedDiscriminators: string[] = [];

        // Create recursive function to parse nested variant options
        const parseOptions = async (
          variant:
            | VariantOptionSchema<string>
            | VariantOptionSchemaAsync<string>,
          allKeys: Set<string>
        ) => {
          for (const schema of variant.options) {
            // If it is a variant schema, parse its options recursively
            if (schema.type === 'variant') {
              await parseOptions(schema, new Set(allKeys).add(schema.key));

              // Otherwise, check discriminators and parse object schema
            } else {
              // Create variables to store local discriminator information
              let keysAreValid = true;
              let currentPriority = 0;

              // Check if all discriminator keys are valid and collect
              // information about invalid discriminator keys if not
              for (const currentKey of allKeys) {
                // If any discriminator is invalid, mark keys as invalid
                const discriminatorSchema = schema.entries[currentKey];
                if (
                  currentKey in input
                    ? (
                        await discriminatorSchema['~run'](
                          // @ts-expect-error
                          { typed: false, value: input[currentKey] },
                          ABORT_EARLY_CONFIG
                        )
                      ).issues
                    : discriminatorSchema.type !== 'exact_optional' &&
                      discriminatorSchema.type !== 'optional' &&
                      discriminatorSchema.type !== 'nullish'
                ) {
                  keysAreValid = false;

                  // If invalid discriminator key is not equal to current key
                  // and if current key has a higher priority or same priority
                  // but is the first one present in input, reset invalid
                  // discriminator information
                  if (
                    invalidDiscriminatorKey !== currentKey &&
                    (maxDiscriminatorPriority < currentPriority ||
                      (maxDiscriminatorPriority === currentPriority &&
                        currentKey in input &&
                        !(invalidDiscriminatorKey in input)))
                  ) {
                    maxDiscriminatorPriority = currentPriority;
                    invalidDiscriminatorKey = currentKey;
                    expectedDiscriminators = [];
                  }

                  // If invalid discriminator key is equal to current key,
                  // store its expected value
                  if (invalidDiscriminatorKey === currentKey) {
                    expectedDiscriminators.push(
                      schema.entries[currentKey].expects
                    );
                  }

                  // Break loop on first invalid discriminator key
                  break;
                }

                // Increase priority for next discriminator key
                currentPriority++;
              }

              // If all discriminators are valid, parse input with schema of option
              if (keysAreValid) {
                const optionDataset = await schema['~run'](
                  { value: input },
                  config
                );

                // Store output dataset if necessary
                // Hint: Only the first untyped or typed dataset is returned, and
                // typed datasets take precedence over untyped ones.
                if (
                  !outputDataset ||
                  (!outputDataset.typed && optionDataset.typed)
                ) {
                  outputDataset = optionDataset;
                }
              }
            }

            // If valid option is found, break loop
            // Hint: The `break` statement is intentionally placed at the end of
            // the loop to break any outer loops in case of recursive execution.
            if (outputDataset && !outputDataset.issues) {
              break;
            }
          }
        };

        // Parse input with nested variant options recursively
        await parseOptions(this, new Set([this.key]));

        // If any output dataset is available, return it
        if (outputDataset) {
          return outputDataset;
        }

        // Otherwise, add discriminator issue
        _addIssue(this, 'type', dataset, config, {
          // @ts-expect-error
          input: input[invalidDiscriminatorKey],
          expected: _joinExpects(expectedDiscriminators, '|'),
          path: [
            {
              type: 'object',
              origin: 'value',
              input: input as Record<string, unknown>,
              key: invalidDiscriminatorKey,
              // @ts-expect-error
              value: input[invalidDiscriminatorKey],
            },
          ],
        });

        // Otherwise, add variant issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }

      // Finally, return  output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        InferOutput<VariantOptionsAsync<string>[number]>,
        VariantIssue | BaseIssue<unknown>
      >;
    },
  };
}
