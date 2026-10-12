import * as v from "valibot";

const Schema1 = v.pipe(v.string(), v.brand("StationNumber"));
const Schema2 = v.pipe(v.number(), v.brand("UserId"));
const Schema3 = v.pipe(v.string(), v.minLength(1), v.brand("NonEmptyString"));
