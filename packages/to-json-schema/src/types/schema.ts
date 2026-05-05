type JsonSchemaTypeName =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

type JsonSchemaType =
  | string
  | number
  | boolean
  | JsonSchemaObject
  | JsonSchemaArray
  | null;

interface JsonSchemaObject {
  [key: string]: JsonSchemaType;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface JsonSchemaArray extends Array<JsonSchemaType> {}

type JsonSchemaDefinition = JsonSchema | boolean;

/**
 * JSON Schema interface.
 */
export interface JsonSchema {
  $id?: string | undefined;
  $ref?: string | undefined;
  $schema?: string | undefined;
  $comment?: string | undefined;
  $defs?: Record<string, JsonSchemaDefinition> | undefined;
  type?: JsonSchemaTypeName | JsonSchemaTypeName[] | undefined;
  nullable?: boolean | undefined;
  enum?: JsonSchemaType[] | undefined;
  const?: JsonSchemaType | undefined;
  multipleOf?: number | undefined;
  maximum?: number | undefined;
  exclusiveMaximum?: number | undefined;
  minimum?: number | undefined;
  exclusiveMinimum?: number | undefined;
  maxLength?: number | undefined;
  minLength?: number | undefined;
  pattern?: string | undefined;
  items?: JsonSchemaDefinition | JsonSchemaDefinition[] | undefined;
  prefixItems?: JsonSchemaDefinition[] | undefined;
  additionalItems?: JsonSchemaDefinition | undefined;
  maxItems?: number | undefined;
  minItems?: number | undefined;
  uniqueItems?: boolean | undefined;
  contains?: JsonSchemaDefinition | undefined;
  maxProperties?: number | undefined;
  minProperties?: number | undefined;
  required?: string[] | undefined;
  properties?: Record<string, JsonSchemaDefinition> | undefined;
  patternProperties?: Record<string, JsonSchemaDefinition> | undefined;
  additionalProperties?: JsonSchemaDefinition | undefined;
  dependencies?: Record<string, JsonSchemaDefinition | string[]> | undefined;
  propertyNames?: JsonSchemaDefinition | undefined;
  if?: JsonSchemaDefinition | undefined;
  then?: JsonSchemaDefinition | undefined;
  else?: JsonSchemaDefinition | undefined;
  allOf?: JsonSchemaDefinition[] | undefined;
  anyOf?: JsonSchemaDefinition[] | undefined;
  oneOf?: JsonSchemaDefinition[] | undefined;
  not?: JsonSchemaDefinition | undefined;
  format?: string | undefined;
  contentMediaType?: string | undefined;
  contentEncoding?: string | undefined;
  definitions?: Record<string, JsonSchemaDefinition> | undefined;
  title?: string | undefined;
  description?: string | undefined;
  default?: JsonSchemaType | undefined;
  readOnly?: boolean | undefined;
  writeOnly?: boolean | undefined;
  examples?: JsonSchemaType | undefined;
}

/**
 * JSON Schema 7 interface.
 *
 * @deprecated Use `JsonSchema` instead.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JSONSchema7 extends JsonSchema {}
