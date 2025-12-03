import * as v from "valibot";

const Schema1 = v.pipe(v.unknown(), v.transform(Number), v.number());
const Schema2 = v.pipe(v.unknown(), v.transform(Number), v.number());
const Schema3 = v.pipe(v.unknown(), v.transform(Number), v.number(), v.finite());
const Schema4 = v.pipe(v.unknown(), v.transform(Number), v.number(), v.multipleOf(12));