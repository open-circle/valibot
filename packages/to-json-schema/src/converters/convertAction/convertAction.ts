import type * as v from 'valibot';
import type { ConversionConfig, JsonSchema } from '../../types/index.ts';
import {
  addError,
  escapeRegExp,
  handleError,
  isJsonConstValue,
  isJsonEnumValues,
} from '../../utils/index.ts';

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
  | v.DomainAction<string, v.ErrorMessage<v.DomainIssue<string>> | undefined>
  | v.EmailAction<string, v.ErrorMessage<v.EmailIssue<string>> | undefined>
  | v.EmojiAction<string, v.ErrorMessage<v.EmojiIssue<string>> | undefined>
  | v.EmptyAction<
      v.LengthInput,
      v.ErrorMessage<v.EmptyIssue<v.LengthInput>> | undefined
    >
  | v.EndsWithAction<
      string,
      string,
      v.ErrorMessage<v.EndsWithIssue<string, string>> | undefined
    >
  | v.EntriesAction<
      v.EntriesInput,
      number,
      v.ErrorMessage<v.EntriesIssue<v.EntriesInput, number>> | undefined
    >
  | v.ExamplesAction<unknown, readonly unknown[]>
  | v.GtValueAction<
      v.ValueInput,
      v.ValueInput,
      v.ErrorMessage<v.GtValueIssue<v.ValueInput, v.ValueInput>> | undefined
    >
  | v.HashAction<string, v.ErrorMessage<v.HashIssue<string>> | undefined>
  | v.HexadecimalAction<
      string,
      v.ErrorMessage<v.HexadecimalIssue<string>> | undefined
    >
  | v.HexColorAction<
      string,
      v.ErrorMessage<v.HexColorIssue<string>> | undefined
    >
  | v.IncludesAction<
      string,
      string,
      v.ErrorMessage<v.IncludesIssue<string, string>> | undefined
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
  | v.IsoTimeSecondAction<
      string,
      v.ErrorMessage<v.IsoTimeSecondIssue<string>> | undefined
    >
  | v.IsoTimestampAction<
      string,
      v.ErrorMessage<v.IsoTimestampIssue<string>> | undefined
    >
  | v.IsoWeekAction<string, v.ErrorMessage<v.IsoWeekIssue<string>> | undefined>
  | v.IsrcAction<string, v.ErrorMessage<v.IsrcIssue<string>> | undefined>
  | v.JwsCompactAction<
      string,
      v.ErrorMessage<v.JwsCompactIssue<string>> | undefined
    >
  | v.LengthAction<
      v.LengthInput,
      number,
      v.ErrorMessage<v.LengthIssue<v.LengthInput, number>> | undefined
    >
  | v.LtValueAction<
      v.ValueInput,
      v.ValueInput,
      v.ErrorMessage<v.LtValueIssue<v.ValueInput, v.ValueInput>> | undefined
    >
  | v.MacAction<string, v.ErrorMessage<v.MacIssue<string>> | undefined>
  | v.Mac48Action<string, v.ErrorMessage<v.Mac48Issue<string>> | undefined>
  | v.Mac64Action<string, v.ErrorMessage<v.Mac64Issue<string>> | undefined>
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
  | v.NotValueAction<
      v.ValueInput,
      v.ValueInput,
      v.ErrorMessage<v.NotValueIssue<v.ValueInput, v.ValueInput>> | undefined
    >
  | v.NotValuesAction<
      v.ValueInput,
      v.ValueInput[],
      v.ErrorMessage<v.NotValuesIssue<v.ValueInput, v.ValueInput[]>> | undefined
    >
  | v.OctalAction<string, v.ErrorMessage<v.OctalIssue<string>> | undefined>
  | v.RegexAction<string, v.ErrorMessage<v.RegexIssue<string>> | undefined>
  | v.RfcEmailAction<
      string,
      v.ErrorMessage<v.RfcEmailIssue<string>> | undefined
    >
  | v.SafeIntegerAction<
      number,
      v.ErrorMessage<v.SafeIntegerIssue<number>> | undefined
    >
  | v.SlugAction<string, v.ErrorMessage<v.SlugIssue<string>> | undefined>
  | v.StartsWithAction<
      string,
      string,
      v.ErrorMessage<v.StartsWithIssue<string, string>> | undefined
    >
  | v.TitleAction<unknown, string>
  | v.UlidAction<string, v.ErrorMessage<v.UlidIssue<string>> | undefined>
  | v.UrlAction<string, v.ErrorMessage<v.UrlIssue<string>> | undefined>
  | v.UuidAction<string, v.ErrorMessage<v.UuidIssue<string>> | undefined>
  | v.ValueAction<
      v.ValueInput,
      v.ValueInput,
      v.ErrorMessage<v.ValueIssue<v.ValueInput, v.ValueInput>> | undefined
    >
  | v.ValuesAction<
      v.ValueInput,
      v.ValueInput[],
      v.ErrorMessage<v.ValuesIssue<v.ValueInput, v.ValueInput[]>> | undefined
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
    case 'domain':
    case 'emoji':
    case 'hash':
    case 'hexadecimal':
    case 'hex_color':
    case 'isrc':
    case 'iso_time_second':
    case 'iso_week':
    case 'mac':
    case 'mac48':
    case 'mac64':
    case 'nanoid':
    case 'octal':
    case 'slug':
    case 'ulid': {
      if (jsonSchema.pattern) {
        errors = addError(
          errors,
          `The "${valibotAction.type}" action is not supported in combination with another regex action.`
        );
      } else {
        jsonSchema.pattern = valibotAction.requirement.source;
      }
      break;
    }

    case 'description': {
      jsonSchema.description = valibotAction.description;
      break;
    }

    case 'email':
    case 'rfc_email': {
      jsonSchema.format = 'email';
      break;
    }

    case 'ends_with': {
      if (jsonSchema.pattern) {
        errors = addError(
          errors,
          `The "${valibotAction.type}" action is not supported in combination with another regex action.`
        );
      } else {
        jsonSchema.pattern = `${escapeRegExp(valibotAction.requirement)}$`;
      }
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

    case 'gt_value': {
      if (jsonSchema.type !== 'number' && jsonSchema.type !== 'integer') {
        errors = addError(
          errors,
          `The "gt_value" action is not supported on type "${jsonSchema.type}".`
        );
      }
      if (config?.target === 'openapi-3.0') {
        errors = addError(
          errors,
          'The "gt_value" action is not supported for OpenAPI 3.0.'
        );
        break;
      }
      jsonSchema.exclusiveMinimum = valibotAction.requirement as number;
      break;
    }

    case 'includes': {
      if (jsonSchema.pattern) {
        errors = addError(
          errors,
          `The "${valibotAction.type}" action is not supported in combination with another regex action.`
        );
      } else {
        jsonSchema.pattern = escapeRegExp(valibotAction.requirement);
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

    case 'jws_compact': {
      if (jsonSchema.pattern) {
        errors = addError(
          errors,
          `The "${valibotAction.type}" action is not supported in combination with another regex action.`
        );
      } else {
        jsonSchema.pattern = valibotAction.requirement.source;
      }
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

    case 'lt_value': {
      if (jsonSchema.type !== 'number' && jsonSchema.type !== 'integer') {
        errors = addError(
          errors,
          `The "lt_value" action is not supported on type "${jsonSchema.type}".`
        );
      }
      if (config?.target === 'openapi-3.0') {
        errors = addError(
          errors,
          'The "lt_value" action is not supported for OpenAPI 3.0.'
        );
        break;
      }
      jsonSchema.exclusiveMaximum = valibotAction.requirement as number;
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
      jsonSchema.maximum = valibotAction.requirement as number;
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
      jsonSchema.minimum = valibotAction.requirement as number;
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

    case 'not_value': {
      if (!isJsonConstValue(valibotAction.requirement)) {
        errors = addError(
          errors,
          'The requirement of the "not_value" action is not JSON compatible.'
        );
        break;
      }
      if (config?.target === 'openapi-3.0') {
        jsonSchema.not = { enum: [valibotAction.requirement] };
      } else {
        jsonSchema.not = { const: valibotAction.requirement };
      }
      break;
    }

    case 'not_values': {
      if (!isJsonEnumValues(valibotAction.requirement)) {
        errors = addError(
          errors,
          'A requirement of the "not_values" action is not JSON compatible.'
        );
        break;
      }
      jsonSchema.not = { enum: valibotAction.requirement };
      break;
    }

    case 'regex': {
      if (valibotAction.requirement.flags) {
        errors = addError(
          errors,
          'RegExp flags are not supported by JSON Schema.'
        );
      }
      if (jsonSchema.pattern) {
        errors = addError(
          errors,
          `The "${valibotAction.type}" action is not supported in combination with another regex action.`
        );
      } else {
        jsonSchema.pattern = valibotAction.requirement.source;
      }
      break;
    }

    case 'safe_integer': {
      jsonSchema.type = 'integer';
      if (
        typeof jsonSchema.minimum !== 'number' ||
        jsonSchema.minimum < Number.MIN_SAFE_INTEGER
      ) {
        jsonSchema.minimum = Number.MIN_SAFE_INTEGER;
      }
      if (
        typeof jsonSchema.maximum !== 'number' ||
        jsonSchema.maximum > Number.MAX_SAFE_INTEGER
      ) {
        jsonSchema.maximum = Number.MAX_SAFE_INTEGER;
      }
      break;
    }

    case 'starts_with': {
      if (jsonSchema.pattern) {
        errors = addError(
          errors,
          `The "${valibotAction.type}" action is not supported in combination with another regex action.`
        );
      } else {
        jsonSchema.pattern = `^${escapeRegExp(valibotAction.requirement)}`;
      }
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
      if (!isJsonConstValue(valibotAction.requirement)) {
        errors = addError(
          errors,
          'The requirement of the "value" action is not JSON compatible.'
        );
        break;
      }
      if (config?.target === 'openapi-3.0') {
        // Hint: OpenAPI 3.0 does not support const. That's why we use an
        // enum instead.
        jsonSchema.enum = [valibotAction.requirement];
      } else {
        jsonSchema.const = valibotAction.requirement;
      }
      break;
    }

    case 'values': {
      if (!isJsonEnumValues(valibotAction.requirement)) {
        errors = addError(
          errors,
          'A requirement of the "values" action is not JSON compatible.'
        );
        break;
      }
      jsonSchema.enum = valibotAction.requirement;
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
