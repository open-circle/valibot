import * as v from "valibot";

const StationNumberSchema = v.pipe(v.string(), v.brand("StationNumber"));
const IdSchema = v.pipe(v.number(), v.brand("Id"));
const NonEmptyBrandSchema = v.pipe(v.string(), v.minLength(1), v.brand("NonEmpty"));
