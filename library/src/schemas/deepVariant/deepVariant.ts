import { BaseIssue, BaseSchema, ErrorMessage, InferInput, InferIssue, InferOutput, MaybeReadonly, ObjectEntries, OptionalEntrySchema, OutputDataset } from "../../types";
import { _addIssue, _getStandardProps } from "../../utils";
import { literal } from "../literal";
import { LooseObjectIssue, LooseObjectSchema } from "../looseObject";
import { number } from "../number";
import { object, ObjectIssue, ObjectSchema } from "../object";
import { ObjectWithRestIssue, ObjectWithRestSchema } from "../objectWithRest";
import { StrictObjectIssue, StrictObjectSchema } from "../strictObject";

/**
 * Variant issue interface.
 */
export interface DeepVariantIssue extends BaseIssue<unknown> {
  /**
   * The issue kind.
   */
  readonly kind: 'schema';
  /**
   * The issue type.
   */
  readonly type: 'deepVariant';
  /**
   * The expected property.
   */
  readonly expected: string;
}


export interface DeepVariantOptionSchema<TPath extends string>
  extends BaseSchema<unknown, unknown, DeepVariantIssue | BaseIssue<unknown>> {
  readonly type: 'deepVariant';
  readonly reference: typeof deepVariant;
  readonly path: string;
  readonly options: DeepVariantOptions;
  readonly message: ErrorMessage<DeepVariantIssue> | undefined;
}

/**
 * Variant object entries type.
 */
type DeepVariantObjectEntries = Record<
  string,
  BaseSchema<unknown, unknown, BaseIssue<unknown>> | OptionalEntrySchema
> &
  ObjectEntries;

type DeepVariantOption =
| LooseObjectSchema<
    DeepVariantObjectEntries,
    ErrorMessage<LooseObjectIssue> | undefined
  >
| ObjectSchema<
    DeepVariantObjectEntries,
    ErrorMessage<ObjectIssue> | undefined
  >
| ObjectWithRestSchema<
    DeepVariantObjectEntries,
    BaseSchema<unknown, unknown, BaseIssue<unknown>>,
    ErrorMessage<ObjectWithRestIssue> | undefined
  >
| StrictObjectSchema<
    DeepVariantObjectEntries,
    ErrorMessage<StrictObjectIssue> | undefined
  >;

type DeepVariantOptions = MaybeReadonly<
  DeepVariantOption[]
>



/**
 * Infer deepVariant issue type.
 */
export type InferDeepVariantIssue<
  TOptions extends DeepVariantOptions,
> = Exclude<
  InferIssue<TOptions[number]>,
  { type: 'loose_object' | 'object' | 'object_with_rest' }
>;


/**
 * Variant schema interface.
 */
export interface DeepVariantSchema<
  TPath extends string,
  TOptions extends DeepVariantOptions,
  TMessage extends ErrorMessage<DeepVariantIssue> | undefined,
> extends BaseSchema<
    InferInput<TOptions[number]>,
    InferOutput<TOptions[number]>,
    DeepVariantIssue | InferDeepVariantIssue<TOptions>
  > {
  /**
   * The schema type.
   */
  readonly type: 'deepVariant';
  /**
   * The schema reference.
   */
  readonly reference: typeof deepVariant;
  /**
   * The expected property.
   */
  readonly expects: 'Object';
  /**
   * The discriminator key.
   */
  readonly path: TPath;
  /**
   * The deepVariant options.
   */
  readonly options: TOptions;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a deepVariant schema.
 *
 * @param path The discriminator path.
 * @param options The deepVariant options.
 *
 * @returns A deepVariant schema.
 */
export function deepVariant<
  const TPath extends string,
  const TOptions extends DeepVariantOptions,
>(path: TPath, options: TOptions): DeepVariantSchema<TPath, TOptions, undefined>;

/**
 * Creates a deepVariant schema.
 *
 * @param path The discriminator path.
 * @param options The deepVariant options.
 * @param message The error message.
 *
 * @returns An deepVariant schema.
 */
export function deepVariant<
  const TPath extends string,
  const TOptions extends DeepVariantOptions,
  const TMessage extends ErrorMessage<DeepVariantIssue> | undefined,
>(
  path: TPath,
  options: TOptions,
  message: TMessage
): DeepVariantSchema<TPath, TOptions, TMessage>;

export function deepVariant(
  path: string, options: DeepVariantOptions, message?: string
): DeepVariantSchema<
  string,
  DeepVariantOptions,
  ErrorMessage<DeepVariantIssue> | undefined
>{
  return {
    kind: 'schema',
    type: 'deepVariant',
    reference: deepVariant,
    expects: 'Object',
    async: false,
    path,
    options,
    message,
    get '~standard'() {
      return _getStandardProps(this);
    },
    '~run'(dataset, config) {

      const input = dataset.value;

      if (input && typeof input === 'object') {
      
        const parseOptions = (
          deepVariant: DeepVariantOptionSchema<string>,
          path: string
        ) => {
          for (const schema of deepVariant.options) {
            let keyIsValid = true;
    
            const pathParts = path.split(".");
            let currentSchemaEntries = schema.entries;
            let _input = input;
            while (pathParts.length) {
              const pathPart = pathParts[0];
              const discriminatorSchema = currentSchemaEntries[pathPart] as DeepVariantOption;
              const currentInputAtCurrentDepth = _input;
              if (!(pathPart in currentInputAtCurrentDepth)) {
                // Can't continue navigation as as key part does not exist on a object
                keyIsValid = false;
                break;
              }

              if (
                pathParts.length === 1 &&
                !discriminatorSchema["~run"](
                  { typed: false, value: currentInputAtCurrentDepth[pathPart] },
                  config
                ).issues
              ) {
                return schema;
              }
    
              _input = currentInputAtCurrentDepth[pathPart];
              currentSchemaEntries = discriminatorSchema.entries;
              pathParts.shift();
            
            }

            if (!keyIsValid) {
              // Invalid key provided, as no path has been found
              // _addIssue({}, {})
            }
          }
        }

        const schemaToUse = parseOptions(this, this.path);
        if (!schemaToUse) {
          // Did not find a variant to use
          // _addIssue({}, {})
        }

        if (
          schemaToUse?.["~run"]({ typed: false, value: input }, config).issues
        ) {
          // Found variant, but input is invalid for it.
          // _addIssue({}, {})
        }
      }

      // @ts-expect-error
      return dataset as OutputDataset<
        InferOutput<DeepVariantOptions[number]>,
        DeepVariantIssue | BaseIssue<unknown>
      >
    }
  }
}
