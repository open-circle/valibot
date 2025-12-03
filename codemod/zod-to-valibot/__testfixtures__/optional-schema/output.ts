import * as v from "valibot";

// optional outside object
const Schema1 = v.optional(v.string());
const Schema2 = v.optional(v.string());
const Schema3 = v.string();
const Schema4 = v.optional(Schema3);

// optional inside object
const Schema5 = v.object({key: v.optional(v.string())});
const Schema6 = v.object({key: v.optional(v.string())});
const Schema7 = v.object({key: v.optional(v.pipe(v.string(), v.email()))});
const Schema8 = v.object({key: v.optional(v.pipe(v.string(), v.email()))});
const Schema9 = v.object({key: v.number()});

// get the wrapped schema
const Schema10 = v.optional(v.number());
const Schema11 = v.unwrap(Schema10);
