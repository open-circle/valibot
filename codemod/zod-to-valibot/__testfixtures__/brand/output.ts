import * as v from "valibot";

// Basic brand on string schema
export const StationNumberSchema = v.pipe(v.string(), v.brand("StationNumber"));

// Brand after a validator chain
const UserId = v.pipe(v.string(), v.uuid(), v.brand("UserId"));

// Brand on number schema
const Price = v.pipe(v.number(), v.minValue(0), v.brand("Price"));

// Brand on linked schema
const BaseSchema = v.string();
const BrandedSchema = v.pipe(BaseSchema, v.brand("Branded"));

// Brand from a type-only string literal
const TypeOnlyBrand = v.pipe(v.string(), v.brand("UserId"));
