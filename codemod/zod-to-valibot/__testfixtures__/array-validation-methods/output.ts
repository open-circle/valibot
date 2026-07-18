import * as v from "valibot";

const Schema1 = v.pipe(v.array(v.string()), v.minLength(2));
const Schema2 = v.pipe(v.array(v.string()), v.maxLength(3));
const Schema3 = v.pipe(v.array(v.string()), v.length(4));