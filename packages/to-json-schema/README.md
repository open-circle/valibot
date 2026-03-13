# Valibot to JSON Schema

Utility to convert [Valibot](https://valibot.dev) schemas to JSON Schema. Supports JSON Schema draft-07, draft-2020-12, and OpenAPI 3.0 Schema Object formats.

```js
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

toJsonSchema(v.string()); // { $schema: "http://json-schema.org/draft-07/schema#", type: "string" }
```

This package is particularly popular for:

- **API Documentation**: Generate OpenAPI specifications from your Valibot schemas
- **Code Generation**: Create client SDKs and types from your validation schemas
- **LLM Integration**: Generate structured outputs for Large Language Models
- **Schema Sharing**: Share validation logic between different programming languages

> Some Valibot features can't be mapped to JSON schema. For example, transformation actions have no equivalent in JSON schema. Also, some Valibot schemas or validations are too JS-specific and do not have an equivalent JSON schema attribute.

## Supported features

**Note**: Converted schemas may behave slightly differently in JSON schema validators (especially for string format) because their implementation is different from Valibot's.

| Schema           | Status | Note                                                                                                                                  |
| ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `any`            | ✅     |                                                                                                                                       |
| `array`          | ✅     |                                                                                                                                       |
| `boolean`        | ✅     |                                                                                                                                       |
| `enum`           | ✅     |                                                                                                                                       |
| `exactOptional`  | ✅     |                                                                                                                                       |
| `intersect`      | ✅     |                                                                                                                                       |
| `lazy`           | ⚠️     | The `.getter` function is always executed with `undefined` as input                                                                   |
| `literal`        | ⚠️     | Only JSON compatible values are supported                                                                                             |
| `looseObject`    | ✅     |                                                                                                                                       |
| `looseTuple`     | ✅     |                                                                                                                                       |
| `null`           | ✅     |                                                                                                                                       |
| `nullable`       | ✅     |                                                                                                                                       |
| `nullish`        | ✅     |                                                                                                                                       |
| `number`         | ✅     |                                                                                                                                       |
| `objectWithRest` | ✅     |                                                                                                                                       |
| `object`         | ✅     |                                                                                                                                       |
| `optional`       | ✅     |                                                                                                                                       |
| `picklist`       | ⚠️     | Only JSON compatible values are supported                                                                                             |
| `record`         | ⚠️     | Only `string` schemas for the key of the record are supported. Adds `propertyNames` for key validation (not available in OpenAPI 3.0) |
| `strictObject`   | ✅     |                                                                                                                                       |
| `strictTuple`    | ✅     |                                                                                                                                       |
| `string`         | ✅     |                                                                                                                                       |
| `tupleWithRest`  | ✅     |                                                                                                                                       |
| `tuple`          | ✅     |                                                                                                                                       |
| `union`          | ✅     |                                                                                                                                       |
| `undefinedable`  | ✅     |                                                                                                                                       |
| `unknown`        | ✅     |                                                                                                                                       |
| `variant`        | ⚠️     | The discriminator key will be ignored                                                                                                 |

| Actions        | Status | Note                                                        |
| -------------- | ------ | ----------------------------------------------------------- |
| `base64`       | ✅     |                                                             |
| `bic`          | ✅     |                                                             |
| `cuid2`        | ✅     |                                                             |
| `decimal`      | ✅     |                                                             |
| `description`  | ✅     |                                                             |
| `digits`       | ✅     |                                                             |
| `email`        | ✅     |                                                             |
| `emoji`        | ✅     |                                                             |
| `empty`        | ✅     |                                                             |
| `entries`      | ✅     |                                                             |
| `hexadecimal`  | ✅     |                                                             |
| `hexColor`     | ✅     |                                                             |
| `integer`      | ✅     |                                                             |
| `ipv4`         | ✅     |                                                             |
| `ipv6`         | ✅     |                                                             |
| `isoDate`      | ✅     |                                                             |
| `isoDateTime`  | ✅     |                                                             |
| `isoTime`      | ✅     |                                                             |
| `isoTimestamp` | ✅     |                                                             |
| `length`       | ⚠️     | Only in combination with `string` and `array` schema        |
| `maxEntries`   | ✅     |                                                             |
| `maxLength`    | ⚠️     | Only in combination with `string` and `array` schema        |
| `maxValue`     | ⚠️     | Only in combination with `number` schema                    |
| `metadata`     | ⚠️     | Only for valid `title`, `description` and `examples` values |
| `minEntries`   | ✅     |                                                             |
| `minLength`    | ⚠️     | Only in combination with `string` and `array` schemas       |
| `minValue`     | ⚠️     | Only in combination with `number` schema                    |
| `multipleOf`   | ✅     |                                                             |
| `nanoid`       | ✅     |                                                             |
| `nonEmpty`     | ✅     |                                                             |
| `octal`        | ✅     |                                                             |
| `regex`        | ⚠️     | RexExp flags are not supported in JSON schema               |
| `title`        | ✅     |                                                             |
| `ulid`         | ✅     |                                                             |
| `url`          | ✅     |                                                             |
| `uuid`         | ✅     |                                                             |
| `value`        | ✅     |                                                             |

## Configurations

| Option         | Type                                                                  | Note                                                                                                                      |
| -------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| target         | `'draft-07' \| 'draft-2020-12' \| 'openapi-3.0'`                      | The target JSON Schema format. Defaults to `'draft-07'`.                                                                  |
| typeMode       | `'ignore' \| 'input' \| 'output'`                                     | Whether to convert the input or output type of the Valibot schema to JSON Schema.                                         |
| errorMode      | `'throw' \| 'warn' \| 'ignore'`                                       | The policy for handling incompatible schemas and actions.                                                                 |
| definitions    | `Record<string, GenericSchema>`                                       | The schema definitions for constructing recursive schemas. If not specified, the definitions are generated automatically. |
| overrideSchema | `(context: OverrideSchemaContext) => JsonSchema \| null \| undefined` | Overrides the JSON Schema conversion for a specific Valibot schema.                                                       |
| ignoreActions  | `string[]`                                                            | The actions that should be ignored during the conversion.                                                                 |
| overrideAction | `(context: OverrideActionContext) => JsonSchema \| null \| undefined` | Overrides the JSON Schema reference for a specific Valibot action.                                                        |
| overrideRef    | `(context: OverrideRefContext) => string \| null \| undefined`        | Overrides the JSON Schema reference for a specific reference ID.                                                          |

### Target format

The `target` configuration allows you to specify which JSON Schema format to generate. Different targets have different capabilities and syntax:

```js
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

const schema = v.nullable(v.string());

// JSON Schema draft-07 (default)
toJsonSchema(schema);
// { $schema: "http://json-schema.org/draft-07/schema#", anyOf: [{ type: "string" }, { type: "null" }] }

// JSON Schema draft-2020-12
toJsonSchema(schema, { target: 'draft-2020-12' });
// { $schema: "https://json-schema.org/draft/2020-12/schema", anyOf: [{ type: "string" }, { type: "null" }] }

// OpenAPI 3.0 Schema Object
toJsonSchema(schema, { target: 'openapi-3.0' });
// { type: "string", nullable: true }
```

**Note**: Some features like `propertyNames` for record schemas are not available in OpenAPI 3.0.

### Type mode

The `typeMode` configuration controls whether to convert the input or output type of the Valibot schema to JSON Schema.

- When set to `'input'`, conversion stops before the first potential type transformation action or second schema in any pipeline.
- When set to `'output'`, conversion of any pipelines starts from the last schema in the pipeline. Therefore, the output type must be specified explicitly with a schema after the last type transformation action.
- When set to `'ignore'` (default), the entire pipeline is converted.

This is particularly useful when defining API endpoints where external developers need different schema information for requests vs responses:

```js
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

const ValibotSchema = v.pipe(
  v.string(),
  v.decimal(),
  v.transform(Number),
  v.number(),
  v.maxValue(100)
);

toJsonSchema(ValibotSchema, { typeMode: 'input' });

// {
//   $schema: "http://json-schema.org/draft-07/schema#",
//   type: "string",
//   pattern: "^[+-]?(?:\\d*\\.)?\\d+$"
// }

toJsonSchema(ValibotSchema, { typeMode: 'output' });

// {
//   $schema: "http://json-schema.org/draft-07/schema#",
//   type: "number",
//   maximum: 100
// }
```

### Error mode

The `errorMode` configuration controls how the converter handles unsupported schemas and actions. By default, the error mode is set to `'throw'`. To force the conversion of unsupported Valibot features, you can set it to `'ignore'`.

> Unsupported schemas usually return an empty JSON schema (`{}`) and unsupported actions are usually ignored.

```js
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

toJsonSchema(v.file(), { errorMode: 'ignore' }); // {}

toJsonSchema(v.pipe(v.string(), v.creditCard()), { errorMode: 'ignore' }); // { type: "string" }
```

### Override functions

The package provides powerful override capabilities to customize the JSON Schema conversion process. You can override the conversion of specific schemas, actions, or references.

#### Override schema conversion

Handle unsupported schemas or customize conversion behavior:

```js
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

const ValibotSchema = v.object({ createdAt: v.date() });

toJsonSchema(ValibotSchema, {
  overrideSchema(context) {
    if (context.valibotSchema.type === 'date') {
      return { type: 'string', format: 'date-time' };
    }
  },
});

// {
//   $schema: "http://json-schema.org/draft-07/schema#",
//   type: "object",
//   properties: {
//     createdAt: { type: "string" format: "date-time" }
//   },
//   required: ["createdAt"]
// }
```

#### Override reference IDs

Customize reference IDs for OpenAPI or other specifications:

```js
import { toJsonSchemaDefs } from '@valibot/to-json-schema';
import * as v from 'valibot';

const UserSchema = v.object({ name: v.string() });

toJsonSchemaDefs(
  { UserSchema },
  { overrideRef: (context) => `#/schemas/${context.referenceId}` }
);
```

### Enhanced metadata support

Use the generic `metadata` action to add title, description, and examples to your schemas or the individual `title`and `description` actions:

```js
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

const ValibotSchema = v.pipe(
  v.string(),
  v.email(),
  v.metadata({
    title: 'Email Schema',
    description: 'A schema that validates email addresses.',
    examples: ['jane@example.com'],
  })
);

toJsonSchema(ValibotSchema);

// {
//   $schema: "http://json-schema.org/draft-07/schema#",
//   type: "string",
//   format: "email",
//   title: "Email Schema",
//   description: "A schema that validates email addresses.",
//   examples: ["jane@example.com"]
// }
```

### Definitions

Nested and recursive schemas can be broken in multiple reusable definitions.

```js
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

const EmailSchema = v.pipe(v.string(), v.email());
toJsonSchema(v.object({ email: EmailSchema }), {
  definitions: { EmailSchema },
});

// {
//   $schema: "http://json-schema.org/draft-07/schema#",
//   type: "object",
//   properties: {
//     email: {
//       $ref: "#/$defs/EmailSchema"
//     }
//   },
//   required: ["email"],
//   $defs: {
//     EmailSchema: {
//       type: "string",
//       format: "email"
//     }
//   }
// }
```

Definitions are not required for converting `lazy` schemas. Missing definitions will be generated automatically.

```js
import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

const StringSchema = v.string();
toJsonSchema(v.object({ key: v.lazy(() => StringSchema) }));

// {
//   $schema: "http://json-schema.org/draft-07/schema#",
//   type: "object",
//   properties: {
//     key: {
//       $ref: "#/$defs/0"
//     }
//   },
//   required: ["key"],
//   $defs: {
//     0: {
//       type: "string"
//     }
//   }
// }
```

## Additional functions

### `toStandardJsonSchema`

Converts a Valibot schema to the [Standard JSON Schema](https://standardschema.dev/) format. This format is useful when working with tools and libraries that support the Standard JSON Schema specification.

```js
import { toStandardJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

const schema = toStandardJsonSchema(
  v.object({
    id: v.pipe(v.string(), v.uuid()),
    name: v.pipe(v.string(), v.nonEmpty()),
    age: v.optional(v.number()),
  })
);
```

### `toJsonSchemaDefs`

Converts only the provided Valibot schema definitions to JSON Schema definitions, without wrapping them in a root schema. This is particularly useful for OpenAPI specifications where you need only the schema definitions.

```js
import { toJsonSchemaDefs } from '@valibot/to-json-schema';
import * as v from 'valibot';

const EmailSchema = v.pipe(v.string(), v.email());
const UserSchema = v.object({
  name: v.string(),
  email: EmailSchema,
});

toJsonSchemaDefs({ EmailSchema, UserSchema });

// {
//   EmailSchema: {
//     type: "string",
//     format: "email"
//   },
//   UserSchema: {
//     type: "object",
//     properties: {
//       name: {
//         type: "string"
//       },
//       email: {
//         $ref: "#/$defs/EmailSchema"
//       }
//     },
//     required: ["name", "email"]
//   }
// }
```

#### OpenAPI integration

For OpenAPI specifications, you can customize reference IDs:

```js
import { toJsonSchemaDefs } from '@valibot/to-json-schema';
import * as v from 'valibot';

const ValibotSchema1 = v.string();
const ValibotSchema2 = v.number();
const ValibotSchema3 = v.tuple([ValibotSchema1, ValibotSchema2]);

toJsonSchemaDefs(
  { ValibotSchema1, ValibotSchema2, ValibotSchema3 },
  { overrideRef: (context) => `#/schemas/${context.referenceId}` }
);

// {
//   ValibotSchema1: { type: "string" },
//   ValibotSchema2: { type: "number" },
//   ValibotSchema3: {
//     type: "array",
//     items: [
//       { $ref: "#/schemas/ValibotSchema1" },
//       { $ref: "#/schemas/ValibotSchema2" }
//     ],
//     minItems: 2
//   }
// }
```

### Global definitions

For advanced use cases, you can manage global schema definitions that will be automatically used when converting schemas. This is particularly useful for larger projects with many reusable schemas.

```js
import { addGlobalDefs, toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';

const ValibotSchema1 = v.string();
const ValibotSchema2 = v.number();

addGlobalDefs({ ValibotSchema1, ValibotSchema2 });

const ValibotSchema3 = v.tuple([ValibotSchema1, ValibotSchema2]);

toJsonSchema(ValibotSchema3);

// {
//   $schema: "http://json-schema.org/draft-07/schema#",
//   type: "array",
//   items: [
//     { $ref: "#/$defs/ValibotSchema1" },
//     { $ref: "#/$defs/ValibotSchema2" }
//   ],
//   minItems: 2,
//   $defs: {
//     ValibotSchema1: { type: "string" },
//     ValibotSchema2: { type: "number" }
//   }
// }
```

You can also convert global definitions directly using `toJsonSchemaDefs`:

```js
const globalDefs = getGlobalDefs();
if (globalDefs) {
  const schemaDefs = toJsonSchemaDefs(globalDefs);
}
```
