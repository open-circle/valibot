# Changelog

All notable changes to the library will be documented in this file.

## v1.5.0 (December 11, 2025)

- Add support for JSON Schema draft-2020-12 and OpenAPI 3.0 Schema Object format
- Add `propertyNames` support to record schemas for key validation constraints
- Add support for `toBigint`, `toBoolean`, `toDate`, `toNumber` and `toString` actions for `typeMode: 'input'`
- Add new `toStandardJsonSchema` function to convert Valibot schemas to Standard JSON Schema format
- Change return type from `JSONSchema7` to a custom `JsonSchema` type

## v1.4.0 (December 02, 2025)

- Add support for `examples` action
- Add support for `integer` when used with `minValue` and `maxValue` actions (pull request #1367)
- Change Valibot peer dependency to v1.2.0
- Fix conversion of `exactOptional` object properties (pull request #1220)
- Fix conversion of `variant` to use `oneOf` instead of `anyOf` (pull request #1193)

## v1.3.0 (June 01, 2025)

- Add `ignoreActions` configuration to be able to ignore specific actions during conversion
- Add `typeMode` configuration to be able to control whether to convert input or output type of schema
- Add `ConversionContext`, `OverrideSchemaContext`, `OverrideActionContext` and `OverrideRefContext` to exports
- Change JSDoc comments to improve documentation
- Change build step to tsdown and Rolldown

## v1.2.0 (May 17, 2025)

- Add support for title, description and examples in `metadata` action (pull request #1189)
- Add new override configurations to override default behaviour of JSON Schema conversion (pull request #1197)
- Add storage for global definitions with `addGlobalDefs` and `getGlobalDefs` (pull request #1197)
- Add new `toJsonSchemaDefs` function to convert Valibot schema definitions to JSON Schema definitions (pull request #1197)

## v1.1.0 (May 06, 2025)

- Add support for `minEntries` and `maxEntries` action (pull request #1100)
- Add support for `entries` action (pull request #1156)
- Change Valibot peer dependency to v1.1.0
- Fix `toJsonSchema` to be independent of definition order (pull request #1133)
- Fix `additionalItems` for tuple schemas and add `minItems` (pull request #1126)

## v1.0.0 (March 19, 2025)

- Add support for `exactOptional` and `undefinedable` schema
- Add support for `base64`, `isoTime`, `isoDateTime`, `nonEmpty` and `url` action (pull request #962)
- Add support for `bic`, `cuid2`, `empty`, `decimal`, `digits`, `emoji`, `hexColor`, `hexadecimal`, `nanoid`, `octal` and `ulid` action (pull request #998)
- Change Valibot peer dependency to v1.0.0
- Change extraction of default value from `nullable`, `nullish` and `optional` schema
- Change `force` to `errorMode` in config for better control (issue #889)
- Change `additionalProperties` for `object` and `looseObject` schema (pull request #1001)

## v0.2.1 (September 30, 2024)

- Fix type export for Deno (pull request #854)

## v0.2.0 (September 15, 2024)

- Add support for `title` action (discussion #826)

## v0.1.1 (September 14, 2024)

- Fix maximum call stack bug for recursive schemas
- Fix invalid JSON Schema ouput for recursive schemas

## v0.1.0 (September 13, 2024)

- Initial release
