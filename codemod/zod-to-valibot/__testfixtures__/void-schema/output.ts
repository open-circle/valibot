import * as v from "valibot";

const Schema1 = v.void();
const Schema2 = v.void("some message");
const Schema3 = v.pipe(v.void(), v.description("some description"));