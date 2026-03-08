import * as v from 'valibot';
import type {
  ConversionConfig,
  ConversionContext,
  JsonSchema,
} from '../../types/index.ts';
import { addError, handleError } from '../../utils/index.ts';
import { convertAction } from '../convertAction/index.ts';

/**
 * Schema type.
 */
type Schema =
  | v.AnySchema
  | v.UnknownSchema
  | v.NullableSchema<
      v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      v.Default<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>, null>
    >
  | v.NullishSchema<
      v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      v.Default<
        v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
        null | undefined
      >
    >
  | v.NullSchema<v.ErrorMessage<v.NullIssue> | undefined>
  | v.StringSchema<v.ErrorMessage<v.StringIssue> | undefined>
  | v.BooleanSchema<v.ErrorMessage<v.BooleanIssue> | undefined>
  | v.NumberSchema<v.ErrorMessage<v.NumberIssue> | undefined>
  | v.LiteralSchema<v.Literal, v.ErrorMessage<v.LiteralIssue> | undefined>
  | v.PicklistSchema<
      v.PicklistOptions,
      v.ErrorMessage<v.PicklistIssue> | undefined
    >
  | v.EnumSchema<v.Enum, v.ErrorMessage<v.EnumIssue> | undefined>
  | v.VariantSchema<
      string,
      v.VariantOptions<string>,
      v.ErrorMessage<v.VariantIssue> | undefined
    >
  | v.UnionSchema<
      v.UnionOptions,
      v.ErrorMessage<v.UnionIssue<v.BaseIssue<unknown>>> | undefined
    >
  | v.IntersectSchema<
      v.IntersectOptions,
      v.ErrorMessage<v.IntersectIssue> | undefined
    >
  | v.ObjectSchema<v.ObjectEntries, v.ErrorMessage<v.ObjectIssue> | undefined>
  | v.ObjectWithRestSchema<
      v.ObjectEntries,
      v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      v.ErrorMessage<v.ObjectWithRestIssue> | undefined
    >
  | v.ExactOptionalSchema<
      v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      v.Default<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>, undefined>
    >
  | v.OptionalSchema<
      v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      v.Default<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>, undefined>
    >
  | v.UndefinedableSchema<
      v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      v.Default<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>, undefined>
    >
  | v.StrictObjectSchema<
      v.ObjectEntries,
      v.ErrorMessage<v.StrictObjectIssue> | undefined
    >
  | v.LooseObjectSchema<
      v.ObjectEntries,
      v.ErrorMessage<v.LooseObjectIssue> | undefined
    >
  | v.RecordSchema<
      v.BaseSchema<string, string | number | symbol, v.BaseIssue<unknown>>,
      v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      v.ErrorMessage<v.RecordIssue> | undefined
    >
  | v.TupleSchema<v.TupleItems, v.ErrorMessage<v.TupleIssue> | undefined>
  | v.TupleWithRestSchema<
      v.TupleItems,
      v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      v.ErrorMessage<v.TupleWithRestIssue> | undefined
    >
  | v.LooseTupleSchema<
      v.TupleItems,
      v.ErrorMessage<v.LooseTupleIssue> | undefined
    >
  | v.StrictTupleSchema<
      v.TupleItems,
      v.ErrorMessage<v.StrictTupleIssue> | undefined
    >
  | v.ArraySchema<
      v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      v.ErrorMessage<v.ArrayIssue> | undefined
    >
  | v.LazySchema<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>;

/**
 * Pipe type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pipe = readonly (Schema | v.PipeAction<any, any, v.BaseIssue<unknown>>)[];

/**
 * Schema or pipe type.
 */
type SchemaOrPipe = Schema | v.SchemaWithPipe<readonly [Schema, ...Pipe]>;

/**
 * Flattens a Valibot pipe by recursively expanding nested pipes.
 *
 * @param pipe The pipeline to flatten.
 *
 * @returns A flat pipeline.
 */
function flattenPipe(pipe: Pipe): Pipe {
  return pipe.flatMap((item) =>
    'pipe' in item ? flattenPipe(item.pipe as Pipe) : item
  );
}

// Create global reference count
let refCount = 0;

/**
 * Converts any supported Valibot schema to the JSON Schema format.
 *
 * @param jsonSchema The JSON Schema object.
 * @param valibotSchema The Valibot schema object.
 * @param config The conversion configuration.
 * @param context The conversion context.
 * @param skipRef Whether to skip using a reference.
 *
 * @returns The converted JSON Schema.
 */
export function convertSchema(
  jsonSchema: JsonSchema,
  valibotSchema: SchemaOrPipe,
  config: ConversionConfig | undefined,
  context: ConversionContext,
  skipRef = false
): JsonSchema {
  if (!skipRef) {
    // If schema is in reference map use reference and skip conversion
    const referenceId = context.referenceMap.get(valibotSchema);
    if (referenceId) {
      jsonSchema.$ref = `#/$defs/${referenceId}`;
      if (config?.overrideRef) {
        const refOverride = config.overrideRef({
          ...context,
          referenceId,
          valibotSchema,
          jsonSchema,
        });
        if (refOverride) {
          jsonSchema.$ref = refOverride;
        }
      }
      return jsonSchema;
    }
  }

  // If it is schema with pipe, convert each item of pipe
  if ('pipe' in valibotSchema) {
    // Flatten pipe by expanding nested pipes
    const flatPipe = flattenPipe(valibotSchema.pipe);

    // Create start and stop index variables
    let startIndex = 0;
    let stopIndex = flatPipe.length - 1;

    // If type mode is set to input, update stop index
    if (config?.typeMode === 'input') {
      const inputStopIndex = flatPipe
        .slice(1)
        .findIndex(
          (item) =>
            item.kind === 'schema' ||
            (item.kind === 'transformation' &&
              (item.type === 'find_item' ||
                item.type === 'parse_json' ||
                item.type === 'raw_transform' ||
                item.type === 'reduce_items' ||
                item.type === 'stringify_json' ||
                item.type === 'to_bigint' ||
                item.type === 'to_boolean' ||
                item.type === 'to_date' ||
                item.type === 'to_number' ||
                item.type === 'to_string' ||
                item.type === 'transform'))
        );
      if (inputStopIndex !== -1) {
        stopIndex = inputStopIndex;
      }

      // Otherwise, if type mode is set to output, update start index
    } else if (config?.typeMode === 'output') {
      const outputStartIndex = flatPipe.findLastIndex(
        (item) => item.kind === 'schema'
      );
      if (outputStartIndex !== -1) {
        startIndex = outputStartIndex;
      }
    }

    // Convert each item of pipe in specified range
    for (let index = startIndex; index <= stopIndex; index++) {
      // Get current pipe item
      const valibotPipeItem = flatPipe[index];

      // Convert Valibot schema or action to JSON Schema
      if (valibotPipeItem.kind === 'schema') {
        // Handle error if pipe contains another schema after start index
        if (index > startIndex) {
          handleError(
            'Set the "typeMode" config to "input" or "output" to convert pipelines with multiple schemas.',
            config
          );
        }

        // Convert Valibot schema to JSON Schema
        jsonSchema = convertSchema(
          jsonSchema,
          valibotPipeItem,
          config,
          context,
          // Hint: We skip using a reference because subsequent pipe elements
          // may change the JSON schema, which could result in invalid output
          // if we were to use a reference.
          true
        );

        // Convert Valibot action to JSON Schema
      } else {
        // @ts-expect-error
        jsonSchema = convertAction(jsonSchema, valibotPipeItem, config);
      }
    }

    // Return converted JSON Schema
    return jsonSchema;
  }

  // Create errors variable
  let errors: [string, ...string[]] | undefined;

  // Otherwise, convert individual schema to JSON Schema
  switch (valibotSchema.type) {
    // Primitive schemas

    case 'boolean': {
      jsonSchema.type = 'boolean';
      break;
    }

    case 'null': {
      if (config?.target === 'openapi-3.0') {
        // Hint: OpenAPI 3.0 does not have a null type. That's why we're using
        // an enum as a workaround.
        jsonSchema.enum = [null];
      } else {
        jsonSchema.type = 'null';
      }
      break;
    }

    case 'number': {
      jsonSchema.type = 'number';
      break;
    }

    case 'string': {
      jsonSchema.type = 'string';
      break;
    }

    // Complex schemas

    case 'array': {
      jsonSchema.type = 'array';
      jsonSchema.items = convertSchema(
        {},
        valibotSchema.item as SchemaOrPipe,
        config,
        context
      );
      break;
    }

    case 'tuple':
    case 'tuple_with_rest':
    case 'loose_tuple':
    case 'strict_tuple': {
      jsonSchema.type = 'array';

      // If target is OpenAPI 3.0
      if (config?.target === 'openapi-3.0') {
        // Uses anyOf pattern with minItems/maxItems
        jsonSchema.items = { anyOf: [] };
        jsonSchema.minItems = valibotSchema.items.length;
        for (const item of valibotSchema.items) {
          // @ts-expect-error
          jsonSchema.items.anyOf.push(
            convertSchema({}, item as SchemaOrPipe, config, context)
          );
        }

        // Add rest item to anyOf if present
        if (valibotSchema.type === 'tuple_with_rest') {
          // @ts-expect-error
          jsonSchema.items.anyOf.push(
            convertSchema(
              {},
              valibotSchema.rest as SchemaOrPipe,
              config,
              context
            )
          );

          // Set maxItems for tuples with fixed length
        } else if (
          valibotSchema.type === 'strict_tuple' ||
          valibotSchema.type === 'tuple'
        ) {
          jsonSchema.maxItems = valibotSchema.items.length;
        }

        // If target is draft-2020-12
      } else if (config?.target === 'draft-2020-12') {
        // Use prefixItems for draft-2020-12
        jsonSchema.prefixItems = [];
        jsonSchema.minItems = valibotSchema.items.length;
        for (const item of valibotSchema.items) {
          jsonSchema.prefixItems.push(
            convertSchema({}, item as SchemaOrPipe, config, context)
          );
        }

        // Add additional items depending on schema type
        if (valibotSchema.type === 'tuple_with_rest') {
          jsonSchema.items = convertSchema(
            {},
            valibotSchema.rest as SchemaOrPipe,
            config,
            context
          );
        } else if (valibotSchema.type === 'strict_tuple') {
          jsonSchema.items = false;
        }

        // If target is draft-07 or unspecified
      } else {
        // Use items array for draft-07
        jsonSchema.items = [];
        jsonSchema.minItems = valibotSchema.items.length;
        for (const item of valibotSchema.items) {
          jsonSchema.items.push(
            convertSchema({}, item as SchemaOrPipe, config, context)
          );
        }

        // Add additional items depending on schema type
        if (valibotSchema.type === 'tuple_with_rest') {
          jsonSchema.additionalItems = convertSchema(
            {},
            valibotSchema.rest as SchemaOrPipe,
            config,
            context
          );
        } else if (valibotSchema.type === 'strict_tuple') {
          jsonSchema.additionalItems = false;
        }
      }

      break;
    }

    case 'object':
    case 'object_with_rest':
    case 'loose_object':
    case 'strict_object': {
      jsonSchema.type = 'object';

      // Add JSON Schema of properties and mark required keys
      jsonSchema.properties = {};
      jsonSchema.required = [];
      for (const key in valibotSchema.entries) {
        const entry = valibotSchema.entries[key] as SchemaOrPipe;
        jsonSchema.properties[key] = convertSchema({}, entry, config, context);
        if (
          entry.type !== 'exact_optional' &&
          entry.type !== 'nullish' &&
          entry.type !== 'optional'
        ) {
          jsonSchema.required.push(key);
        }
      }

      // Add additional properties depending on schema type
      if (valibotSchema.type === 'object_with_rest') {
        jsonSchema.additionalProperties = convertSchema(
          {},
          valibotSchema.rest as SchemaOrPipe,
          config,
          context
        );
      } else if (valibotSchema.type === 'strict_object') {
        jsonSchema.additionalProperties = false;
      }

      break;
    }

    case 'record': {
      if (config?.target === 'openapi-3.0' && 'pipe' in valibotSchema.key) {
        errors = addError(
          errors,
          'The "record" schema with a schema for the key that contains a "pipe" cannot be converted to JSON Schema.'
        );
      }
      if (valibotSchema.key.type !== 'string') {
        errors = addError(
          errors,
          `The "record" schema with the "${valibotSchema.key.type}" schema for the key cannot be converted to JSON Schema.`
        );
      }

      jsonSchema.type = 'object';

      // propertyNames is not supported in OpenAPI 3.0
      if (config?.target !== 'openapi-3.0') {
        jsonSchema.propertyNames = convertSchema(
          {},
          valibotSchema.key as SchemaOrPipe,
          config,
          context
        );
      }

      jsonSchema.additionalProperties = convertSchema(
        {},
        valibotSchema.value as SchemaOrPipe,
        config,
        context
      );
      break;
    }

    // Special schemas

    case 'any':
    case 'unknown': {
      break;
    }

    case 'nullable':
    case 'nullish': {
      // If target is OpenAPI 3.0 use nullable property
      if (config?.target === 'openapi-3.0') {
        const innerSchema = convertSchema(
          {},
          valibotSchema.wrapped as SchemaOrPipe,
          config,
          context
        );
        Object.assign(jsonSchema, innerSchema);
        jsonSchema.nullable = true;

        // Otherwise, use union of wrapped schema and null
      } else {
        jsonSchema.anyOf = [
          convertSchema(
            {},
            valibotSchema.wrapped as SchemaOrPipe,
            config,
            context
          ),
          { type: 'null' },
        ];
      }

      // Add default value to JSON Schema, if available
      if (valibotSchema.default !== undefined) {
        // @ts-expect-error
        jsonSchema.default = v.getDefault(valibotSchema);
      }

      break;
    }

    case 'exact_optional':
    case 'optional':
    case 'undefinedable': {
      // Convert wrapped schema to JSON Schema
      jsonSchema = convertSchema(
        jsonSchema,
        valibotSchema.wrapped as SchemaOrPipe,
        config,
        context
      );

      // Add default value to JSON Schema, if available
      if (valibotSchema.default !== undefined) {
        // @ts-expect-error
        jsonSchema.default = v.getDefault(valibotSchema);
      }

      break;
    }

    case 'literal': {
      if (
        typeof valibotSchema.literal !== 'boolean' &&
        typeof valibotSchema.literal !== 'number' &&
        typeof valibotSchema.literal !== 'string'
      ) {
        errors = addError(
          errors,
          'The value of the "literal" schema is not JSON compatible.'
        );
      }
      if (config?.target === 'openapi-3.0') {
        // Hint: OpenAPI 3.0 does not support const. That's why we use an enum instead.
        // @ts-expect-error
        jsonSchema.enum = [valibotSchema.literal];
      } else {
        // @ts-expect-error
        jsonSchema.const = valibotSchema.literal;
      }
      break;
    }

    case 'enum': {
      jsonSchema.enum = valibotSchema.options;
      break;
    }

    case 'picklist': {
      if (
        valibotSchema.options.some(
          (option) => typeof option !== 'number' && typeof option !== 'string'
        )
      ) {
        errors = addError(
          errors,
          'An option of the "picklist" schema is not JSON compatible.'
        );
      }
      // @ts-expect-error
      jsonSchema.enum = valibotSchema.options;
      break;
    }

    case 'union': {
      jsonSchema.anyOf = valibotSchema.options.map((option) =>
        convertSchema({}, option as SchemaOrPipe, config, context)
      );
      break;
    }

    case 'variant': {
      jsonSchema.oneOf = valibotSchema.options.map((option) =>
        convertSchema({}, option as SchemaOrPipe, config, context)
      );
      break;
    }

    case 'intersect': {
      jsonSchema.allOf = valibotSchema.options.map((option) =>
        convertSchema({}, option as SchemaOrPipe, config, context)
      );
      break;
    }

    case 'lazy': {
      // Get wrapped Valibot schema
      let wrappedValibotSchema = context.getterMap.get(valibotSchema.getter);

      // Add wrapped Valibot schema to getter map, if necessary
      if (!wrappedValibotSchema) {
        wrappedValibotSchema = valibotSchema.getter(undefined);
        context.getterMap.set(valibotSchema.getter, wrappedValibotSchema);
      }

      // Get reference ID of wrapped Valibot schema
      let referenceId = context.referenceMap.get(wrappedValibotSchema);

      // Add wrapped Valibot schema to reference map and definitions, if necessary
      if (!referenceId) {
        referenceId = `${refCount++}`;
        context.referenceMap.set(wrappedValibotSchema, referenceId);
        context.definitions[referenceId] = convertSchema(
          {},
          wrappedValibotSchema as SchemaOrPipe,
          config,
          context,
          true
        );
      }

      // Add reference to JSON Schema object
      jsonSchema.$ref = `#/$defs/${referenceId}`;

      // Override reference, if necessary
      if (config?.overrideRef) {
        const refOverride = config.overrideRef({
          ...context,
          referenceId,
          valibotSchema: wrappedValibotSchema,
          jsonSchema,
        });
        if (refOverride) {
          jsonSchema.$ref = refOverride;
        }
      }

      break;
    }

    // Other schemas

    default: {
      errors = addError(
        errors,
        // @ts-expect-error
        `The "${valibotSchema.type}" schema cannot be converted to JSON Schema.`
      );
    }
  }

  // Override JSON Schema if specified and necessary
  if (config?.overrideSchema) {
    const schemaOverride = config.overrideSchema({
      ...context,
      referenceId: context.referenceMap.get(valibotSchema),
      valibotSchema,
      jsonSchema,
      errors,
    });
    if (schemaOverride) {
      return { ...schemaOverride };
    }
  }

  // Handle errors based on configuration
  if (errors) {
    for (const message of errors) {
      handleError(message, config);
    }
  }

  // Return converted JSON Schema
  return jsonSchema;
}
