import * as v from "valibot";

const Schema1 = v.pipe(v.unknown(), v.toBoolean());
const Schema2 = v.pipe(v.unknown(), v.toBoolean());