import * as v from "valibot";

const Schema1 = v.pipe(v.string(), v.trim(), v.email());
const output1 = v.parse(v.string(), "valibot@example.com");
const output2 = v.parse(v.pipe(v.string(), v.trim(), v.email()), "valibot@example.com");
const Schema3 = v.optional(v.string());
const Schema4 = v.nullable(v.optional(v.string()));
const Schema5 = v.optional(v.pipe(v.string(), v.email()));
const Schema6 = v.nullable(v.optional(v.pipe(v.string(), v.email())));
const Schema7 = v.string();
const Schema8 = v.pipe(Schema7, v.trim(), v.email());
const output = v.parse(Schema8, "valibot@example.com");