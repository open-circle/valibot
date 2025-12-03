import * as v from "valibot";

const Schema1 = v.any();
const Schema2 = v.any();
const Schema3 = v.pipe(v.any(), v.description("some description"));