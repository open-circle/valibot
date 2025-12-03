import * as v from "valibot";

const Schema = v.pipe(v.string(), v.description("some description"));
const description = v.getDescription(Schema);