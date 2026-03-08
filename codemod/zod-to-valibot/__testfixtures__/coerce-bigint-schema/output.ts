import * as v from "valibot";

const Schema1 = v.pipe(v.unknown(), v.toBigint());
const Schema2 = v.pipe(v.unknown(), v.toBigint());
const Schema3 = v.pipe(v.unknown(), v.toBigint(), v.gtValue(1n));
const Schema4 = v.pipe(v.unknown(), v.toBigint(), v.ltValue(2n));