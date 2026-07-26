import * as v from "valibot";

// Basic transform
const Schema1 = v.pipe(v.number(), v.transform((val) => val * 2));

// Transform with string schema
const Schema2 = v.pipe(v.string(), v.transform((val) => val.toUpperCase()));

// Chained transform with validator
const Schema3 = v.pipe(v.number(), v.minValue(0), v.transform((val) => val + 1));

// Transform after validator chain
const Schema4 = v.pipe(v.string(), v.email(), v.transform((val) => `Email: ${val}`));

// Multiple transforms
const Schema5 = v.pipe(v.number(), v.transform((val) => val * 2), v.transform((val) => val + 10));

// Transform with complex function
const Schema6 = v.pipe(v.object({ name: v.string() }), v.transform((data) => ({
  ...data,
  displayName: data.name.toUpperCase()
})));

// Transform on linked schema
const BaseSchema = v.string();
const TransformedSchema = v.pipe(BaseSchema, v.transform((val) => val.trim()));