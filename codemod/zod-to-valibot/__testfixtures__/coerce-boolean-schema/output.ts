import * as v from "valibot";

const Schema1 = v.pipe(v.unknown(), v.transform(Boolean), v.boolean());
const Schema2 = v.pipe(v.unknown(), v.transform(Boolean), v.boolean());