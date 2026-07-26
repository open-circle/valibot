import * as v from "valibot";

const Schema1 = v.never();
const Schema2 = v.never("some message");
const Schema3 = v.pipe(v.never(), v.description("some description"));