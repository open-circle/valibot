import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  ErrorMessage,
  InferIssue,
  MapPathItem,
  OutputDataset,
} from '../../types/index.ts';
import { _addIssue, _standardSchema } from '../../utils/index.ts';
import type { map } from './map.ts';
import type { InferMapInput, InferMapOutput, MapIssue } from './types.ts';

/**
 * Map schema async interface.
 */
export interface MapSchemaAsync<
  TKey extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TValue extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<MapIssue> | undefined,
> extends BaseSchemaAsync<
    InferMapInput<TKey, TValue>,
    InferMapOutput<TKey, TValue>,
    MapIssue | InferIssue<TKey> | InferIssue<TValue>
  > {
  /**
   * The schema type.
   */
  readonly type: 'map';
  /**
   * The schema reference.
   */
  readonly reference: typeof map | typeof mapAsync;
  /**
   * The expected property.
   */
  readonly expects: 'Map';
  /**
   * The map key schema.
   */
  readonly key: TKey;
  /**
   * The map value schema.
   */
  readonly value: TValue;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a map schema.
 *
 * @param key The key schema.
 * @param value The value schema.
 *
 * @returns A map schema.
 */
export function mapAsync<
  const TKey extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TValue extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(key: TKey, value: TValue): MapSchemaAsync<TKey, TValue, undefined>;

/**
 * Creates a map schema.
 *
 * @param key The key schema.
 * @param value The value schema.
 * @param message The error message.
 *
 * @returns A map schema.
 */
export function mapAsync<
  const TKey extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TValue extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<MapIssue> | undefined,
>(
  key: TKey,
  value: TValue,
  message: TMessage
): MapSchemaAsync<TKey, TValue, TMessage>;

// @__NO_SIDE_EFFECTS__
export function mapAsync(
  key:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  value:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<MapIssue>
): MapSchemaAsync<
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<MapIssue> | undefined
> {
  return _standardSchema<
    MapSchemaAsync<
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
      | BaseSchema<unknown, unknown, BaseIssue<unknown>>
      | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
      ErrorMessage<MapIssue> | undefined
    >
  >({
    kind: 'schema',
    type: 'map',
    reference: mapAsync,
    expects: 'Map',
    async: true,
    key,
    value,
    message,
    async '~run'(
      this: MapSchemaAsync<
        | BaseSchema<unknown, unknown, BaseIssue<unknown>>
        | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
        | BaseSchema<unknown, unknown, BaseIssue<unknown>>
        | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
        ErrorMessage<MapIssue> | undefined
      >,
      dataset,
      config
    ) {
      // Get input value from dataset
      const input = dataset.value;

      // If root type is valid, check nested types
      if (input instanceof Map) {
        // Set typed to `true` and value to empty map
        // @ts-expect-error
        dataset.typed = true;
        dataset.value = new Map();

        // Parse schema of each map entry
        const datasets = await Promise.all(
          [...input].map(([inputKey, inputValue]) =>
            Promise.all([
              inputKey,
              inputValue,
              this.key['~run']({ value: inputKey }, config),
              this.value['~run']({ value: inputValue }, config),
            ])
          )
        );

        // Process datasets of each map entry
        for (const [
          inputKey,
          inputValue,
          keyDataset,
          valueDataset,
        ] of datasets) {
          // If there are issues, capture them
          if (keyDataset.issues) {
            // Create map path item
            const pathItem: MapPathItem = {
              type: 'map',
              origin: 'key',
              input,
              key: inputKey,
              value: inputValue,
            };

            // Add modified item dataset issues to issues
            for (const issue of keyDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                // @ts-expect-error
                issue.path = [pathItem];
              }
              // @ts-expect-error
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              // @ts-expect-error
              dataset.issues = keyDataset.issues;
            }

            // If necessary, abort early
            if (config.abortEarly) {
              dataset.typed = false;
              break;
            }
          }

          // If there are issues, capture them
          if (valueDataset.issues) {
            // Create map path item
            const pathItem: MapPathItem = {
              type: 'map',
              origin: 'value',
              input,
              key: inputKey,
              value: inputValue,
            };

            // Add modified item dataset issues to issues
            for (const issue of valueDataset.issues) {
              if (issue.path) {
                issue.path.unshift(pathItem);
              } else {
                // @ts-expect-error
                issue.path = [pathItem];
              }
              // @ts-expect-error
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) {
              // @ts-expect-error
              dataset.issues = valueDataset.issues;
            }

            // If necessary, abort early
            if (config.abortEarly) {
              dataset.typed = false;
              break;
            }
          }

          // If not typed, map typed to `false`
          if (!keyDataset.typed || !valueDataset.typed) {
            dataset.typed = false;
          }

          // Add value to dataset
          // @ts-expect-error
          dataset.value.set(keyDataset.value, valueDataset.value);
        }

        // Otherwise, add map issue
      } else {
        _addIssue(this, 'type', dataset, config);
      }

      // Return output dataset
      // @ts-expect-error
      return dataset as OutputDataset<
        Map<unknown, unknown>,
        MapIssue | BaseIssue<unknown>
      >;
    },
  });
}
