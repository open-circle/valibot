import * as v from "valibot";

export const StationNumberSchema = v.pipe(v.string(), v.brand("StationNumber"));
export const NumericId = v.pipe(v.number(), v.integer(), v.brand("NumericId"));
