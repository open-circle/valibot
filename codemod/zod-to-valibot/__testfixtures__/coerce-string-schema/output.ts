import * as v from "valibot";

const Schema1 = v.pipe(v.unknown(), v.toString());
const Schema2 = v.pipe(v.unknown(), v.toString());
const Schema3 = v.pipe(v.unknown(), v.toString(), v.email());
const Schema4 = v.pipe(v.unknown(), v.toString(), v.url());