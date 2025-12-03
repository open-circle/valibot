import * as v from "valibot";

const Schema1 = v.array(v.string());
const Schema2 = v.array(v.pipe(v.string(), v.email()));
const Schema3 = v.array(v.string(), "some message");
const Schema4 = v.pipe(v.array(v.string()), v.description("some description"));
const Schema5 = v.array(v.string());
const Schema6 = v.string();
const Schema7 = v.array(Schema6);
const Schema8 = v.array(v.pipe(v.string(), v.email()));
const Schema9 = v.array(v.optional(v.pipe(v.string(), v.email())));
const Schema10 = v.optional(v.array(v.pipe(v.string(), v.email())));