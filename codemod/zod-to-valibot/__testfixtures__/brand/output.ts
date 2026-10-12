import * as v from "valibot";

const Schema1 = v.pipe(v.string(), v.brand("StationNumber"));
const Schema2 = v.pipe(v.object({key: v.string()}), v.brand("Config"));