import * as v from "valibot";

const Schema1 = v.pipe(v.unknown(), v.toDate());
const Schema2 = v.pipe(v.unknown(), v.toDate());
const Schema3 = v.pipe(v.unknown(), v.toDate(), v.minValue(new Date("1/10/23")));
const Schema4 = v.pipe(v.unknown(), v.toDate(), v.maxValue(new Date("2023-01-10")));