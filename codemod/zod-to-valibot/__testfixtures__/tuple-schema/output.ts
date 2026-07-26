import * as v from "valibot";

const Schema1 = v.tuple([v.string()]);
const Schema2 = v.tuple([v.string()], "some message");
const Schema3 = v.tupleWithRest([v.string()], v.null());
const Schema4 = v.tupleWithRest([v.string()], v.null(), "some message");
const Schema5 = v.pipe(v.tuple([v.string()]), v.description("some description"), v.rest(v.null()));
const Schema6 = v.tuple([v.string()]);
const Schema7 = v.pipe(Schema6, v.rest(v.null()));