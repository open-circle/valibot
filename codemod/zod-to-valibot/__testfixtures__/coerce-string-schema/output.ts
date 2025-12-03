import * as v from "valibot";

const Schema1 = v.pipe(v.unknown(), v.transform(String), v.string());
const Schema2 = v.pipe(v.unknown(), v.transform(String), v.string());
const Schema3 = v.pipe(v.unknown(), v.transform(String), v.string(), v.email());
const Schema4 = v.pipe(v.unknown(), v.transform(String), v.string(), v.url());