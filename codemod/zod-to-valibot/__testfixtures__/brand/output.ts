import * as v from "valibot";

// Basic brand
const Schema1 = v.pipe(v.string(), v.brand("StationNumber"));

// Brand after validator chain
const Schema2 = v.pipe(v.string(), v.minLength(1), v.brand("NonEmptyId"));

// Brand on object schema
const Schema3 = v.pipe(v.object({ id: v.string() }), v.brand("Entity"));

// Brand on linked schema
const BaseSchema = v.number();
const BrandedSchema = v.pipe(BaseSchema, v.brand("Count"));
