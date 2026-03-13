import * as v from "valibot";

// nullable outside object
const Schema1 = v.nullable(v.string());
const Schema2 = v.nullable(v.string());
const Schema3 = v.string();
const Schema4 = v.nullable(Schema3);

// nullable inside object
const Schema5 = v.object({key: v.nullable(v.string())});
const Schema6 = v.object({key: v.nullable(v.string())});
const Schema7 = v.object({key: v.nullable(v.pipe(v.string(), v.email()))});
const Schema8 = v.object({key: v.nullable(v.pipe(v.string(), v.email()))});
const Schema9 = v.object({key: v.number()});

// get the wrapped schema
const Schema10 = v.nullable(v.number());
const Schema11 = v.unwrap(Schema10);
