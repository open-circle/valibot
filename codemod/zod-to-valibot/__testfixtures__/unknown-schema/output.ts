import * as v from "valibot";

const Schema1 = v.unknown();
const Schema2 = v.unknown();
const Schema3 = v.pipe(v.unknown(), v.description("some description"));