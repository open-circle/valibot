# Changelog

All notable changes to the library will be documented in this file.

## vX.X.X (Month DD, YYYY)

- Add `toBigint`, `toBoolean`, `toDate`, `toNumber` and `toString` transformation actions (pull request #1212)
- Change build step to tsdown

## v1.1.0 (May 06, 2025)

- Add `message` method to overwrite local error message configuration of a schema (pull request #1103)
- Add `summarize` method to summarize issues into a pretty-printable multi-line string (pull request #1158)
- Add `getTitle`, `getDescription` and `getMetadata` methods to extract metadata of a schema (pull request #1154)
- Add `minEntries` and `maxEntries` validation action to validate number of object entries (pull request #1100)
- Add `entries` and `notEntries` validation action to validate number of object entries (pull request #1156)
- Add `parseJson` and `stringifyJson` transformation action to parse and stringify JSON (pull request #1137)
- Add `flavor` transformation action to flavor the output type of a schema (pull request #950)
- Add support for bigints to `multipleOf` validation action (pull request #1164)
- Change implementation of `variant` and `variantAsync` schema to improve performance by aborting validation of discriminators early (pull request #1110)
- Change name of `NanoIDAction` and `NanoIDIssue` interface to `NanoIdAction` and `NanoIdIssue` (pull request #1171)
- Fix internal `MarkOptional` type to fix input and output type of objects in edge cases (issue #1176)

## v1.0.0 (March 18, 2025)

- Add `assert` method to assert values (issue #862)
- Add `checkItemsAsync` action (pull request #856)
- Add `graphemes`, `maxGraphemes`, `minGraphemes` and `notGraphemes` action (pull request #853)
- Add `words`, `maxWords`, `minWords` and `notWords` action
- Add `args` and `returns` action to transform functions (issue #243)
- Add `rfcEmail` action to validate RFC 5322 email addresses (pull request #912)
- Add `gtValue` and `ltValue` action for greater than and less than validation (pull request #978, #985)
- Add `values` and `notValues` action for easier multi-value validation (pull request #919)
- Add `slug` action to validate URL slugs (pull request #910)
- Add support for `ReadonlyMap` and `ReadonlySet` to `readonly` action (issue #1059)
- Add `entriesFromObjects` util to improve tree shaking (pull request #1023)
- Add new overload signature to `pipe` and `pipeAync` method to support unlimited pipe items of same input and output type (issue #852)
- Add `@__NO_SIDE_EFFECTS__` notation to improve tree shaking (pull request #995)
- Add `exactOptional` and `exactOptionalAsync` schema (PR #1013)
- Change types and implementation to support Standard Schema
- Change behaviour of `minValue` and `maxValue` for `NaN` (pull request #843)
- Change type and behaviour of `nullable`, `nullableAsync`, `nullish`, `nullishAsync`, `optional`, `optionalAsync`, `undefinedable` and `undefinedableAsync` for undefined default value (issue #878)
- Change type signature of `partialCheck` and `partialCheckAsync` action to add `.pathList` property in a type-safe way
- Change type signature of `findItem` action to support type predicates (issue #867)
- Change validation of missing object entries in `looseObject`, `looseObjectAsync`, `object`, `objectAsync`, `objectWithRest`, `objectWithRestAsync`, `strictObject` and `strictObject` (PR #1013)
- Change type signature of `optional` and `optionalAsync` when used within an object schema (PR #1013)
- Change `MarkOptional` type to fix order of entries and TS error when using generic schemas (issue #1021)
- Change `VariantOption` and `VariantOptionAsync` type to fix TS error when using generic schemas (issue #842)
- Change implementation of `variant` and `variantAsync` to support optional discriminators using `exactOptional`, `exactOptionalAsync`, `optional`, `optionalAsync`, `nullish` or `nullishAsync`
- Change `_addIssue` to not ignore empty strings as error message (pull request #1065)
- Change `ISO_DATE_TIME_REGEX` and `ISO_TIMESTAMP_REGEX` to support space as separator (pull request #1064)
- Change pipe tuple of `pipe` and `pipeAsync` to be readonly by default
- Change `forward`, `forwardCheck`, `partialCheck` and `partialCheckAsync` to improve TypeScript performance (issue #987)
- Change `DECIMAL_REGEX` to support floats that start with a dot (pull request #1086)
- Change exports to export only public types to reduce noise
- Refactor `bytes`, `maxBytes`, `minBytes` and `notBytes` action
- Fix implementation of `nonOptional`, `nonOptionalAsync`, `nonNullable`, `nonNullableAsync`, `nonNullish` and `nonNullishAsync` schema in edge cases (issue #909)
- Fix instantiation error for `any` in `PathKeys` type (issue #929)
- Fix TypeScript error of `keyof` method for objects with many keys (pull request #988)
- Fix options filtering in `enum_` schema (pull request #941)
- Fix `partialCheck` and `partialCheckAsync` action for typed data with issues

## v0.42.1 (September 20, 2024)

- Fix function type declaration of `_run` property

## v0.42.0 (September 15, 2024)

- Add `metadata` action to add custom metadata to a schema
- Add `title` metadata action to add a title to a schema (discussion #826)
- Add `decimal` action to validate integer and float strings (pull request #823)
- Rename `decimal` action to `digits` (pull request #823)
- Rename `NoPipe` type to `SchemaWithoutPipe`
- Fix inference of generics in `IssueDotPath` type (issue #814)

## v0.41.0 (September 01, 2024)

- Change `reference` property of all action base types to be less strict (issue #799)
- Change implementation of `variant` and `variantAsync` to improve performance and issues generation for nested variants with different discriminators (pull request #809)

## v0.40.0 (August 29, 2024)

- Add `nanoid` action to validate Nano IDs (pull request #789)
- Add `undefinedable` and `undefinedableAsync` schema (issue #385)
- Fix invalid output type for transformed optional object entries (issue #806)

## v0.39.0 (August 24, 2024)

- Add support for `exactOptionalPropertyTypes` config (issue #385)
- Fix `IssueDotPath` type for `pipe` and `pipeAsync` method (issue #793)
- Fix `IssueDotPath` type for `variant` and `variantAsync` schema (issue #700)

## v0.38.0 (August 20, 2024)

- Change `expects` and `expected` property by enclosing combined values in parentheses
- Change question mark handling for `optional`, `optionalAsync`, `nullish` and `nullishAsync` schemas in objects
- Fix TypeScript errors in `TuplePath` and `QuestionMarkSchema` type (issue #659, #776)
- Fix missing TypeScript errors in `pipe` and `pipeAsync` method (pull request #785)

## v0.37.0 (July 30, 2024)

- Add `base64` action to validate Base64 strings (pull request #644)
- Add `description` metadata action (pull request #747)
- Add metadata feature to `pipe` and `pipeAsync` method (pull request #747)
- Refactor `HEXADECIMAL_REGEX` (pull request #666)
- Change `unknown[]` in `LengthInput` type to `ArrayLike<unknown>`
- Change `ArrayInput` and `ContentInput` type to use `MaybeReadonly`
- Change `EMOJI_REGEX` to be more accurate and strict (pull request #666)
- Fix bug in `fallback` and `fallbackAsync` method for specific schemas (pull request #752)
- Fix bug in `fallbackAsync` method for async schemas (pull request #732)

## v0.36.0 (July 05, 2024)

- Add `normalize` action to normalize strings (issue #691)
- Add support for async schemas to `entriesFromList` util
- Add support for numbers and symbols to `entriesFromList` util (issue #492)
- Add `key` property to `SetPathItem` type to improve DX (issue #693, #694)
- Remove `FunctionReference` type and refactor code

## v0.35.0 (June 25, 2024)

- Increase argument limit of `pipe` and `pipeAsync` method (issue #643)

## v0.34.0 (June 24, 2024)

- Add `file`, `function` and `promise` schema
- Add `awaitAsync` action to await promise in pipeline
- Add `operation` property to `filterItems`, `findItem`, `mapItems`, `reduceItems` and `sortItem` action
- Rename `action` argument of `filterItems`, `findItem`, `mapItems`, `reduceItems` and `sortItem` action to `operation`
- Rename `action` argument and property of `transform` and `transformAsync` action to `operation`
- Change and improve implementation of `_stringify` util

## v0.33.3 (June 19, 2024)

- Fix `_isPartiallyTyped` util of `partialCheck` and `partialCheckAsync` action

## v0.33.2 (June 19, 2024)

- Fix type exports for JSR and Deno (pull request #663)

## v0.33.1 (June 18, 2024)

- Fix types of `partialCheck` and `partialCheckAsync` action

## v0.33.0 (June 18, 2024)

- Add export alias with reserved keywords for functions with underscore suffix
- Add `partialCheck` and `partialCheckAsync` action (issue #76, #145, #260)
- Add `checkItems`, `filterItems`, `findItem`, `mapItems`, `reduceItems` and `sortItem` action (issue #595)
- Rename `every` and `some` action to `everyItem` and `someItem`
- Rename `_isAllowedObjectKey` to `_isValidObjectKey` and add check for inherited properties
- Remove `RecordPathItem` and `TuplePathItem` type and refactor code
- Fix `received` property of issue in `date` schema for invalid dates (issue #654)

## v0.32.0 (June 14, 2024)

- Add `rawCheck`, `rawCheckAsync`, `rawTransform` and `rawTransformAsync` action (issue #597)
- Change `FlatErrors` type for better developer experience (discussion #640)
- Change `pipe` and `pipeAsync` method to mark output as untyped only when necessary (discussion #613)
- Remove unused `skipPipe` option from `Config` type and refactor library
- Fix `this` reference in `looseTuple`, `looseTupleAsync`, `strictTuple`, `strictTupleAsync`, `tuple`, `tupleAsync`, `tupleWithRest` and `tupleWithRestAsync` schema (pull request #649)
- Fix type of `options` key in `EnumSchema` interface

## v0.31.1 (June 08, 2024)

- Fix missing file extension for Deno (pull request #637)

## v0.31.0 (June 06, 2024)

> To migrate from an older version, please see the official [migration guide](https://valibot.dev/guides/migrate-to-v0.31.0/) and our [announcement post](https://valibot.dev/blog/valibot-v0.31.0-is-finally-available/).

## v0.30.0 (March 06, 2024)

- Add `Default` and `DefaultAsync` type and refactor codebase
- Add `Fallback` and `FallbackAsync` type and refactor codebase
- Add `isOfType` type guard util to check the type of an object
- Refactor `getDefaults` and `getDefaultsAsync` method (pull request #259)
- Refactor `getFallbacks` and `getFallbacksAsync` method (pull request #259)
- Change type definitions from `type` to `interface` (pull request #259, #451)
- Remove deprecated properties of `safeParse` and `safeParseAsync` method
- Remove any deprecated method, schema and validation functions
- Fix `NestedPath` type of `flatten` for async schemas (issue #456)
- Fix implementation of `DefaultValue` type for transformed values

## v0.29.0 (February 19, 2024)

- Add `every` and `some` pipeline validation action
- Add `input` of schema to `getter` function of `recursive` and `recursiveAsync` schema (pull request #441)
- Change implementation of `transform` and `transformAsync` method to only run transformations if there are no issues (issue #436)
- Rename `recursive` and `recursiveAsync` schema to `lazy` and `lazyAsync` (issue #440)
- Fix bug in `i18n` util when using `setSchemaMessage`

## v0.28.1 (February 06, 2024)

- Fix bug in `union` and `unionAsync` schema for transformed inputs (issue #420)

## v0.28.0 (February 05, 2024)

> Note: The library has been revised and refactored. Therefore, not every change is listed in detail.

- Add i18n feature, global configurations and improve error messages (pull request #397)
- Add `number` and `bigint` to `PicklistOptions` type (issue #378)
- Fix missing export of `forwardAsync` method (issue #412)

## v0.27.1 (January 28, 2024)

- Fix missing file extension for Deno (pull request #387)

## v0.27.0 (January 24, 2024)

- Remove `NonNullable`, `NonNullish` and `NonOptional` type
- Add `NonNullableInput`, `NonNullableOutput`, `NonNullishInput`, `NonNullishOutput`, `NonOptionalInput` and `NonOptionalOutput` type
- Improve type signature of `omit`, `omitAsync`, `pick` and `pickAsync` schema to also allow read-only object keys (issue #380)
- Fix type of `pipe` argument at `intersect` and `intersectAsync` schema

## v0.26.0 (January 16, 2024)

- Improve performance of `enum_` and `enumAsync` schema by caching values
- Change ISO timestamp regex to support timestamps with lower and higher millisecond accuracy (pull request #353)
- Change issue handling of `union`, `unionAsync`, `variant` and `variantAsync` schema to improve developer experience
- Fix bug in `getDefaults`, `getDefaultsAsync`, `getFallbacks` and `getFallbacksAsync` schema for falsy but not `undefined` values (issue #356)
- Fix type of `pipe` argument at `union`, `unionAsync`, `variant` and `variantAsync` schema
- Fix bug that broke pipeline execution in `union`, `unionAsync`, `variant` and `variantAsync` schema (issue #364)
- Fix typo in type name of `startsWith` validation action (pull request #375)

## v0.25.0 (December 26, 2023)

- Add `creditCard`, `decimal`, `hash`, `hexadecimal`, `hexColor` and `octal` pipeline validation action (pull request #292, #304, #307, #308, #309)
- Add `pipe` parameter to `intersect`, `intersectAsync`, `union`, `unionAsync`, `variant` and `variantAsync` schema (discussion #297)
- Add support for multiple variant options with same discriminator key to `variant` and `variantAsync` schema (issue #310)
- Add path to issues if discriminator key of `variant` and `variantAsync` schema is missing (issue #235, #303)
- Change `PicklistOptions` type and generics of `picklist` and `picklistAsync` schema

## v0.24.1 (December 11, 2023)

- Fix output type of optional `object` and `objectAsync` entries with default value (issue #286)
- Fix output type of `nullable`, `nullableAsync`, `nullish`, `nullishAsync`, `optional` and `optionalAsync` schema with default value (issue #286)

## v0.24.0 (December 10, 2023)

- Add support for `special` schema as key of `record` schema (issue #291)
- Add support for `special` and `specialAsync` schema as key of `recordAsync` schema (issue #291)
- Fix input and output type of optional `object` and `objectAsync` entries with default value (issue #286)

## v0.23.0 (December 08, 2023)

- Add `bic` validation function (pull request #284)
- Add `mac`, `mac48` and `mac64` validation function (pull request #270)
- Change `PicklistOptions`, `UnionOptions` and `UnionOptionsAsync` type from tuple to array (issue #279)
- Change `IntersectOptions`, `IntersectOptionsAsync`, `UnionOptions` and `UnionOptionsAsync` type to support readonly values (issue #279)
- Fix optional keys of `ObjectInput` and `ObjectOutput` type (issue #242)

## v0.22.0 (December 03, 2023)

- Add support for boolean to `notValue` validation (pull request #261)
- Add `.typed` to schema validation result and execute pipeline of complex schemas if output is typed (issue #76, #145)
- Add `forward` method that forwards issues of pipelines to nested fields (issue #76, #145)
- Add `skipPipe` option to `is` type guard method (pull request #166)
- Change return type of `safeParse` and `safeParseAsync` method
- Rename and change util functions and refactor codebase
- Fix `RecordInput` and `RecordOuput` type when using `unionAsync` as key
- Fix output type for `nullable`, `nullableAsync`, `nullish`, `nullishAsync`, `optional` and `optionalAsync` when using a default value (issue #271)

## v0.21.0 (November 19, 2023)

- Change structure of schemas, validations and transformations to make properties accessible (pull request #211)
- Fix errors in JSDoc comments and add JSDoc ESLint plugin (pull request #205)
- Fix missing file extension for Deno (pull request #249)

## v0.20.1 (November 2, 2023)

- Remove `never` from type signatur of strict objects and tuples (issue #234)

## v0.20.0 (October 31, 2023)

> Note: The library has been revised and refactored. There is a migration guide in the [release notes](https://github.com/open-circle/valibot/releases/tag/v0.20.0).

- Add `getRestAndDefaultArgs` utility function
- Add `rest` argument to `object` and `objectAsync` schema
- Add `variant` and `variantAsync` schema (issue #90, #216)
- Add `getFallback` property to schema in `fallback` method (pull request #177)
- Add `PartialObjectEntries` and `PartialObjectEntriesAsync` type (issue #217)
- Add export for any validation regex (pull request #219)
- Add `getDefaultAsync`, `getDefaults` and `getDefaultsAsync`, `getFallback`, `getFallbackAsync`, `getFallbacks`, `getFallbacksAsync` method (issue #155)
- Add support for schema validation to `transform` and `transformAsync`
- Fix type check in `date` and `dateAsync` for invalid dates (pull request #214)
- Improve security of regular expressions (pull request #202)
- Improve `optional`, `optionalAsync`, `nullable`, `nullableAsync`, `nullish` and `nullishAsync` schema
- Change `ObjectSchema` and `ObjectSchemaAsync` type
- Change type check in `tuple` and `tupleAsync` to be less strict
- Change return type of `action` argument in `coerce` and `coerceAsync` to `unknown`
- Change type of `brand`, `getDefault`, `transform` and `transformAsync` method
- Change type of `array`, `arrayAsync`, `intersection`, `intersectionAsync`, `map`, `mapAsync`, `object`, `objectAsync`, `union`, `unionAsync`, `record`, `recordAsync`, `set`, `setAsync`, `tuple` and `tupleAsync` schema
- Rename `schema` property of every schema type to `type`
- Rename `intersection` and `intersectionAsync` schema to `intersect` and `intersectAsync`
- Rename `enumType` and `enumTypeAsync` schema to `picklist` and `picklistAsync`
- Rename `nativeEnum` and `nativeEnumAsync` schema to `enum_` and `enumAsync`
- Rename `nullType` and `nullTypeAsync` schema to `null_` and `nullAsync`
- Rename `undefinedType` and `undefinedTypeAsync` schema to `undefined_` and `undefinedAsync`
- Rename `voidType` and `voidTypeAsync` schema to `void_` and `voidAsync`
- Rename `default` property of `optional`, `optionalAsync`, `nullable`, `nullableAsync`, `nullish` and `nullishAsync` schema to `getDefault`
- Rename `ObjectShape` and `ObjectShapeAsync` types to `ObjectEntries` and `ObjectEntriesAsync`
- Rename `TupleShape` and `TupleShapeAsync` types to `TupleItems` and `TupleItemsAsync`
- Deprecate `passthrough`, `strict` and `strip` method in favor of `object` schema with `rest` argument

## v0.19.0 (October 08, 2023)

- Add `notBytes`, `notLength`, `notSize` and `notValue` validation function (pull request #194)
- Add support for unions as key of `record` and `recordAsync` schema (issue #201)
- Add support for pipeline validation to `transform` and `transformAsync` (issue #197)
- Change regex of `email` validation to improve performance and security (pull request #180)
- Change `object` and `objectAsync` schema to exclude non-existing keys (issue #199)
- Fix types at `brand`, `transform` and `unwrap` method (issue #195)
- Deprecate `equal` validation function in favor of `value` (issue #192)

## v0.18.0 (September 30, 2023)

- Add `intersection` and `intersectionAsync` schema (pull request #117)
- Fix `RecordInput` and `RecordOutput` type (pull request #184)
- Change `RecordSchema` and `RecordSchemaAsync` type
- Change `flatten` function and improve types

## v0.17.1 (September 25, 2023)

- Fix missing file extensions for Deno (pull request #178, #181)

## v0.17.0 (September 17, 2023)

- Add support for multiple branding of a value (pull request #88)
- Add support for dynamic error messages via functions (pull request #136)
- Add `skipPipe` option to skip execution of pipelines (pull request #164)

## v0.16.0 (September 16, 2023)

- Add `ulid` validation (pull request #151)
- Add `getIssues`, `getOutput` and `getPipeIssues` util and refactor code
- Fix type check in `number` and `numberAsync` schema (issue #157)
- Change `PipeResult` type to allow multiple issues (issue #161)
- Rename previous `getIssues` util to `getSchemaIssues`

## v0.15.0 (September 10, 2023)

- Add possibility to define path of pipeline issue (issue #5)
- Add `getDefault` method to get default value of schema (issue #105)
- Add support for enums as key of `record` and `recordAsync` schema (issue #134)
- Add support for default values to `optional`, `optionalAsync`, `nullable`, `nullableAsync`, `nullish` and `nullishAsync` schema (issue #96, #118)
- Deprecate `withDefault` method in favor of `optional` schema

## v0.14.0 (September 08, 2023)

- Add `cuid2` validation (pull request #130)
- Add `passthrough`, `passthroughAsync`, `strip` and `stripAsync` method
- Add `InstanceSchemaAsync` overload to `transformAsync` method (pull request #138)
- Fix bug in `strict` and `strictAsync` method for optional keys (issue #131)

## v0.13.1 (August 23, 2023)

- Change object type check in `object` and `record` schema

## v0.13.0 (August 23, 2023)

> Note: The library has been revised and refactored. There is a migration guide in the [release notes](https://github.com/open-circle/valibot/releases/tag/v0.13.0).

- Add `fallback` and `fallbackAsync` method (pull request #103)
- Add `excludes` validation as negation of `includes`
- Add support for more primitives to `literal` schema (pull request #102)
- Add support for dynamic values to `withDefault` method
- Change `flatten` function so that issues are also accepted as argument
- Change return type of `safeParse` and `safeParseAsync` method
- Change error handling and refactor library to improve performance
- Rename `.parse` to `._parse` and `.types` to `._types` to mark it as internal

## v0.12.0 (August 11, 2023)

- Change input type of `mimeType` validation to `Blob`
- Rename `useDefault` method to `withDefault` (issue #80)
- Add `brand` method to support branded types (pull request #85)

## v0.11.1 (August 07, 2023)

- Fix types of `enumType` and `enumTypeAsync` schema (issue #70)
- Improve performance of loops with for...of (pull request #68)

## v0.11.0 (August 06, 2023)

- Fix prototype pollution vulnerability of `record` and `recordAsync` (pull request #67)
- Add `finite`, `safeInteger` and `multipleOf` validation (pull request #64, #65, #66)

## v0.10.0 (August 05, 2023)

- Add `integer` validation (pull request #62)

## v0.9.0 (August 04, 2023)

- Add `imei` validation and `isLuhnAlgo` util (pull request #37)
- Fix `isoDateTime`, `isoTime`, `isoTimeSecond` and `isoTimestamp` validation (pull request #42)

## v0.8.0 (July 31, 2023)

- Fix infered `object` and `record` types (issue #9, #10, #34)
- Add `strict` and `strictAsync` method to detect unknown object keys

## v0.7.0 (July 30, 2023)

- Add `is` method which can be used as a type guard (pull request #13)
- Throw all validation issues of a pipeline by default (issue #18)
- Add `abortPipeEarly` option to abort pipe on first error (issue #18)
- Add `abortEarly` option to abort on first error

## v0.6.0 (July 30, 2023)

- Add `toMinValue` and `toMaxValue` transformation

## v0.5.0 (July 28, 2023)

- Fix invalid `comparable` import when using Deno
- Add util functions to exports of library
- Rename `minRange` and `maxRange` to `minValue` and `maxValue` (issue #20)
- Add `value` validation function

## v0.4.0 (July 27, 2023)

- Add `instance` and `instanceAsync` schema
- Refactor library to work with Deno

## v0.3.0 (July 27, 2023)

- Add `bytes`, `minBytes` and `maxBytes` validation (pull request #1)
- Change build step to tsup and exports in package.json (issue #7)

## v0.2.1 (July 26, 2023)

- Change order of exports in package.json (issue #7)

## v0.2.0 (July 25, 2023)

- Add `blob` and `blobAsync` schema

## v0.1.0 (July 12, 2023)

- Initial release
