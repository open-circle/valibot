import * as v from "valibot";

const Schema1 = v.undefined();
const Schema2 = v.undefined("some message");
const Schema3 = v.pipe(v.undefined(), v.description("some description"));