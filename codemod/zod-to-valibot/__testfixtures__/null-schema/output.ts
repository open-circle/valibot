import * as v from "valibot";

const Schema1 = v.null();
const Schema2 = v.null("some message");
const Schema3 = v.pipe(v.null(), v.description("some description"));