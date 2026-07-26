import * as v from "valibot";

const Schema1 = v.symbol();
const Schema2 = v.symbol("some message");
const Schema3 = v.pipe(v.symbol(), v.description("some description"));