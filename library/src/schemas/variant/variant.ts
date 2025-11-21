import type {
  BaseIssue,
  BaseSchema,
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
  VariantOptions,
  VariantOptionSchema,
} from './types.ts';

/**
 * Variant schema interface.
 */
export interface VariantSchema<
  TKey extends string,
  TOptions extends VariantOptions<TKey>,
  TMessage extends ErrorMessage<VariantIssue> | undefined,
> extends BaseSchema<
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
  readonly reference: typeof variant;
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
export function variant<
  const TKey extends string,
  const TOptions extends VariantOptions<TKey>,
>(key: TKey, options: TOptions): VariantSchema<TKey, TOptions, undefined>;

/**
 * Creates a variant schema.
 *
 * @param key The discriminator key.
 * @param options The variant options.
 * @param message The error message.
 *
 * @returns An variant schema.
 */
export function variant<
  const TKey extends string,
  const TOptions extends VariantOptions<TKey>,
  const TMessage extends ErrorMessage<VariantIssue> | undefined,
>(
  key: TKey,
  options: TOptions,
  message: TMessage
): VariantSchema<TKey, TOptions, TMessage>;

// @__NO_SIDE_EFFECTS__
export function variant(
  key: string,
  options: VariantOptions<string>,
  message?: ErrorMessage<VariantIssue>
): VariantSchema<
  string,
  VariantOptions<string>,
  ErrorMessage<VariantIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'variant',
    reference: variant,
    expects: 'Object',
    async: false,
    key,
    options,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {
      // Get input value from dataset
      const input = dataset.value;

      // If root type is valid, check nested types
      if (input && typeof input === 'object') {
        // Create output dataset variable
        let outputDataset:
          | OutputDataset<unknown, BaseIssue<unknown>>
          | undefined;

        // Create variables to store invalid discriminator information
        let maxDiscriminatorPriority = 0;
        let invalidDiscriminatorKey = this.key;
        let expectedDiscriminators: string[] = [];

        // Create recursive function to parse nested variant options
        const parseOptions = (
          variant: VariantOptionSchema<string>,
          allKeys: Set<string>
        ) => {
          for (const schema of variant.options) {
            // If it is a variant schema, parse its options recursively
            if (schema.type === 'variant') {
              parseOptions(schema, new Set(allKeys).add(schema.key));

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
                    ? discriminatorSchema['~run'](
                        // @ts-expect-error
                        { typed: false, value: input[currentKey] },
                        { abortEarly: true }
                      ).issues
                    : discriminatorSchema.type !== 'exact_optional' &&
                      discriminatorSchema.type !== 'optional' &&
                      discriminatorSchema.type !== 'nullish' &&
                      discriminatorSchema.type !== 'undefinedable'
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
                const optionDataset = schema['~run']({ value: input }, config);

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
        parseOptions(this, new Set([this.key]));

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
        InferOutput<VariantOptions<string>[number]>,
        VariantIssue | BaseIssue<unknown>
      >;
    },
  };
}
