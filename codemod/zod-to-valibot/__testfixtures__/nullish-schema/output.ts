import * as v from "valibot";

// nullish outside object
const Schema1 = v.optional(v.nullable(v.string()));
const Schema2 = v.string();
const Schema3 = v.optional(v.nullable(Schema2));

// nullish inside object
const Schema4 = v.object({key: v.optional(v.nullable(v.string()))});
const Schema5 = v.object({key: v.optional(v.nullable(v.pipe(v.string(), v.email())))});
const Schema6 = v.object({key: v.number()});

// get the wrapped schema
const Schema7 = v.optional(v.nullable(v.number()));
const Schema8 = v.unwrap(Schema7);
const Schema9 = v.unwrap(v.unwrap(Schema7));