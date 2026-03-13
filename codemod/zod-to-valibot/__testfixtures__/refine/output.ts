import * as v from "valibot";

// Basic refine
const Schema1 = v.pipe(v.number(), v.check((val) => val < 100, "Must be less then 100"));

// Refine with string schema
const Schema2 = v.pipe(v.string(), v.check((val) => val.length > 0, "Required"));

// Refine after validator
const Schema3 = v.pipe(v.number(), v.minValue(0), v.check((val) => val % 2 === 0, "Must be even"));

// Multiple refines
const Schema4 = v.pipe(
  v.string(),
  v.check((val) => val.length > 3),
  v.check((val) => val.includes("@"))
);

// Refine with complex condition
const Schema5 = v.pipe(
  v.object({ name: v.string() }),
  v.check((data) => data.name !== "admin", "Cannot use admin")
);

// Refine on linked schema
const BaseSchema = v.string();
const RefinedSchema = v.pipe(BaseSchema, v.check((val) => val.trim().length > 0));