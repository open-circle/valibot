import * as v from "valibot";

const Schema1 = v.pipe(v.string(), v.brand("StationNumber"));
const Schema2 = v.pipe(v.object({key: v.string()}), v.brand("Config"));
const Schema3 = v.pipe(v.string(), v.brand("Cat"));
const Schema4 = v.pipe(v.string(), v.minLength(1), v.brand("NonEmpty"));
const Schema5 = v.pipe(v.number(), v.brand(1));
const Schema6 = v.pipe(Schema1, v.brand("Linked"));