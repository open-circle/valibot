import * as v from "valibot";

const Schema1 = v.nan();
const Schema2 = v.nan("some message");
const Schema3 = v.pipe(v.nan(), v.description("some description"));