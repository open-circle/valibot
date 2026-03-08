import * as v from "valibot";

const Schema1 = v.pipe(v.unknown(), v.toNumber());
const Schema2 = v.pipe(v.unknown(), v.toNumber());
const Schema3 = v.pipe(v.unknown(), v.toNumber(), v.finite());
const Schema4 = v.pipe(v.unknown(), v.toNumber(), v.multipleOf(12));