import type * as v from 'valibot';
import type { ConversionConfig, JsonSchema } from '../../types/index.ts';
import { addError, handleError } from '../../utils/index.ts';

/**
 * Action type.
 */
type Action =
  | v.Base64Action<string, v.ErrorMessage<v.Base64Issue<string>> | undefined>
  | v.BicAction<string, v.ErrorMessage<v.BicIssue<string>> | undefined>
  | v.Cuid2Action<string, v.ErrorMessage<v.Cuid2Issue<string>> | undefined>
  | v.DecimalAction<string, v.ErrorMessage<v.DecimalIssue<string>> | undefined>
  | v.DescriptionAction<unknown, string>
  | v.DigitsAction<string, v.ErrorMessage<v.DigitsIssue<string>> | undefined>
  | v.EmailAction<string, v.ErrorMessage<v.EmailIssue<string>> | undefined>
  | v.EmojiAction<string, v.ErrorMessage<v.EmojiIssue<string>> | undefined>
  | v.EmptyAction<
      v.LengthInput,
      v.ErrorMessage<v.EmptyIssue<v.LengthInput>> | undefined
    >
  | v.EntriesAction<
      v.EntriesInput,
      number,
      v.ErrorMessage<v.EntriesIssue<v.EntriesInput, number>> | undefined
    >
  | v.ExamplesAction<unknown, readonly unknown[]>
  | v.HexadecimalAction<
      string,
      v.ErrorMessage<v.HexadecimalIssue<string>> | undefined
    >
  | v.HexColorAction<
      string,
      v.ErrorMessage<v.HexColorIssue<string>> | undefined
    >
  | v.IntegerAction<number, v.ErrorMessage<v.IntegerIssue<number>> | undefined>
  | v.Ipv4Action<string, v.ErrorMessage<v.Ipv4Issue<string>> | undefined>
  | v.Ipv6Action<string, v.ErrorMessage<v.Ipv6Issue<string>> | undefined>
  | v.IsoDateAction<string, v.ErrorMessage<v.IsoDateIssue<string>> | undefined>
  | v.IsoDateTimeAction<
      string,
      v.ErrorMessage<v.IsoDateTimeIssue<string>> | undefined
    >
  | v.IsoTimeAction<string, v.ErrorMessage<v.IsoTimeIssue<string>> | undefined>
  | v.IsoTimestampAction<
      string,
      v.ErrorMessage<v.IsoTimestampIssue<string>> | undefined
    >
  | v.LengthAction<
      v.LengthInput,
      number,
      v.ErrorMessage<v.LengthIssue<v.LengthInput, number>> | undefined
    >
  | v.MaxEntriesAction<
      v.EntriesInput,
      number,
      v.ErrorMessage<v.MaxEntriesIssue<v.EntriesInput, number>> | undefined
    >
  | v.MaxLengthAction<
      v.LengthInput,
      number,
      v.ErrorMessage<v.MaxLengthIssue<v.LengthInput, number>> | undefined
    >
  | v.MaxValueAction<
      v.ValueInput,
      v.ValueInput,
      v.ErrorMessage<v.MaxValueIssue<v.ValueInput, v.ValueInput>> | undefined
    >
  | v.MetadataAction<unknown, Record<string, unknown>>
  | v.MinEntriesAction<
      v.EntriesInput,
      number,
      v.ErrorMessage<v.MinEntriesIssue<v.EntriesInput, number>> | undefined
    >
  | v.MinLengthAction<
      v.LengthInput,
      number,
      v.ErrorMessage<v.MinLengthIssue<v.LengthInput, number>> | undefined
    >
  | v.MinValueAction<
      v.ValueInput,
      v.ValueInput,
      v.ErrorMessage<v.MinValueIssue<v.ValueInput, v.ValueInput>> | undefined
    >
  | v.MultipleOfAction<
      number,
      number,
      v.ErrorMessage<v.MultipleOfIssue<number, number>> | undefined
    >
  | v.NanoIdAction<string, v.ErrorMessage<v.NanoIdIssue<string>> | undefined>
  | v.NonEmptyAction<
      v.LengthInput,
      v.ErrorMessage<v.NonEmptyIssue<v.LengthInput>> | undefined
    >
  | v.OctalAction<string, v.ErrorMessage<v.OctalIssue<string>> | undefined>
  | v.RegexAction<string, v.ErrorMessage<v.RegexIssue<string>> | undefined>
  | v.TitleAction<unknown, string>
  | v.UlidAction<string, v.ErrorMessage<v.UlidIssue<string>> | undefined>
  | v.UrlAction<string, v.ErrorMessage<v.UrlIssue<string>> | undefined>
  | v.UuidAction<string, v.ErrorMessage<v.UuidIssue<string>> | undefined>
  | v.ValueAction<
      v.ValueInput,
      v.ValueInput,
      v.ErrorMessage<v.ValueIssue<v.ValueInput, v.ValueInput>> | undefined
    >;

/**
 * Converts any supported Valibot action to the JSON Schema format.
 *
 * @param jsonSchema The JSON Schema object.
 * @param valibotAction The Valibot action object.
 * @param config The conversion configuration.
 *
 * @returns The converted JSON Schema.
 */
export function convertAction(
  jsonSchema: JsonSchema,
  valibotAction: Action,
  config: ConversionConfig | undefined
): JsonSchema {
  // Ignore action if specified in configuration
  if (config?.ignoreActions?.includes(valibotAction.type)) {
    return jsonSchema;
  }

  // Create errors variable
  let errors: [string, ...string[]] | undefined;

  // Convert Valibot action to JSON Schema
  switch (valibotAction.type) {
    case 'base64': {
      jsonSchema.contentEncoding = 'base64';
      break;
    }

    case 'bic':
    case 'cuid2':
    case 'decimal':
    case 'digits':
    case 'emoji':
    case 'hexadecimal':
    case 'hex_color':
    case 'nanoid':
    case 'octal':
    case 'ulid': {
      jsonSchema.pattern = valibotAction.requirement.source;
      break;
    }

    case 'description': {
      jsonSchema.description = valibotAction.description;
      break;
    }

    case 'email': {
      jsonSchema.format = 'email';
      break;
    }

    case 'empty': {
      if (jsonSchema.type === 'array') {
        jsonSchema.maxItems = 0;
      } else {
        if (jsonSchema.type !== 'string') {
          errors = addError(
            errors,
            `The "${valibotAction.type}" action is not supported on type "${jsonSchema.type}".`
          );
        }
        jsonSchema.maxLength = 0;
      }
      break;
    }

    case 'entries': {
      jsonSchema.minProperties = valibotAction.requirement;
      jsonSchema.maxProperties = valibotAction.requirement;
      break;
    }

    case 'examples': {
      if (Array.isArray(jsonSchema.examples)) {
        // @ts-expect-error
        jsonSchema.examples = [
          ...jsonSchema.examples,
          ...valibotAction.examples,
        ];
      } else {
        // @ts-expect-error
        jsonSchema.examples = valibotAction.examples;
      }
      break;
    }

    case 'integer': {
      jsonSchema.type = 'integer';
      break;
    }

    case 'ipv4': {
      jsonSchema.format = 'ipv4';
      break;
    }

    case 'ipv6': {
      jsonSchema.format = 'ipv6';
      break;
    }

    case 'iso_date': {
      jsonSchema.format = 'date';
      break;
    }

    case 'iso_date_time':
    case 'iso_timestamp': {
      jsonSchema.format = 'date-time';
      break;
    }

    case 'iso_time': {
      jsonSchema.format = 'time';
      break;
    }

    case 'length': {
      if (jsonSchema.type === 'array') {
        jsonSchema.minItems = valibotAction.requirement;
        jsonSchema.maxItems = valibotAction.requirement;
      } else {
        if (jsonSchema.type !== 'string') {
          errors = addError(
            errors,
            `The "${valibotAction.type}" action is not supported on type "${jsonSchema.type}".`
          );
        }
        jsonSchema.minLength = valibotAction.requirement;
        jsonSchema.maxLength = valibotAction.requirement;
      }
      break;
    }

    case 'max_entries': {
      jsonSchema.maxProperties = valibotAction.requirement;
      break;
    }

    case 'max_length': {
      if (jsonSchema.type === 'array') {
        jsonSchema.maxItems = valibotAction.requirement;
      } else {
        if (jsonSchema.type !== 'string') {
          errors = addError(
            errors,
            `The "${valibotAction.type}" action is not supported on type "${jsonSchema.type}".`
          );
        }
        jsonSchema.maxLength = valibotAction.requirement;
      }
      break;
    }

    case 'max_value': {
      if (jsonSchema.type !== 'number' && jsonSchema.type !== 'integer') {
        errors = addError(
          errors,
          `The "max_value" action is not supported on type "${jsonSchema.type}".`
        );
      }
      // @ts-expect-error
      jsonSchema.maximum = valibotAction.requirement;
      break;
    }

    case 'metadata': {
      if (typeof valibotAction.metadata.title === 'string') {
        jsonSchema.title = valibotAction.metadata.title;
      }
      if (typeof valibotAction.metadata.description === 'string') {
        jsonSchema.description = valibotAction.metadata.description;
      }
      if (Array.isArray(valibotAction.metadata.examples)) {
        if (Array.isArray(jsonSchema.examples)) {
          jsonSchema.examples = [
            ...jsonSchema.examples,
            ...valibotAction.metadata.examples,
          ];
        } else {
          jsonSchema.examples = valibotAction.metadata.examples;
        }
      }
      break;
    }

    case 'min_entries': {
      jsonSchema.minProperties = valibotAction.requirement;
      break;
    }

    case 'min_length': {
      if (jsonSchema.type === 'array') {
        jsonSchema.minItems = valibotAction.requirement;
      } else {
        if (jsonSchema.type !== 'string') {
          errors = addError(
            errors,
            `The "${valibotAction.type}" action is not supported on type "${jsonSchema.type}".`
          );
        }
        jsonSchema.minLength = valibotAction.requirement;
      }
      break;
    }

    case 'min_value': {
      if (jsonSchema.type !== 'number' && jsonSchema.type !== 'integer') {
        errors = addError(
          errors,
          `The "min_value" action is not supported on type "${jsonSchema.type}".`
        );
      }
      // @ts-expect-error
      jsonSchema.minimum = valibotAction.requirement;
      break;
    }

    case 'multiple_of': {
      jsonSchema.multipleOf = valibotAction.requirement;
      break;
    }

    case 'non_empty': {
      if (jsonSchema.type === 'array') {
        jsonSchema.minItems = 1;
      } else {
        if (jsonSchema.type !== 'string') {
          errors = addError(
            errors,
            `The "${valibotAction.type}" action is not supported on type "${jsonSchema.type}".`
          );
        }
        jsonSchema.minLength = 1;
      }
      break;
    }

    case 'regex': {
      if (valibotAction.requirement.flags) {
        errors = addError(
          errors,
          'RegExp flags are not supported by JSON Schema.'
        );
      }
      jsonSchema.pattern = valibotAction.requirement.source;
      break;
    }

    case 'title': {
      jsonSchema.title = valibotAction.title;
      break;
    }

    case 'url': {
      jsonSchema.format = 'uri';
      break;
    }

    case 'uuid': {
      jsonSchema.format = 'uuid';
      break;
    }

    case 'value': {
      // Hint: It is not necessary to validate the type of the JSON schema or
      // Valibot action requirement, as this action can only follow a valid
      // schema in the pipeline anyway.
      // @ts-expect-error
      jsonSchema.const = valibotAction.requirement;
      break;
    }

    default: {
      errors = addError(
        errors,
        // @ts-expect-error
        `The "${valibotAction.type}" action cannot be converted to JSON Schema.`
      );
    }
  }

  // Override JSON Schema if specified and necessary
  if (config?.overrideAction) {
    const actionOverride = config.overrideAction({
      valibotAction,
      jsonSchema,
      errors,
    });
    if (actionOverride) {
      return { ...actionOverride };
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
