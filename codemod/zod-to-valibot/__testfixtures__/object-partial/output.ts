import * as v from "valibot";

// make all keys optional
const Schema1 = v.object({k1: v.string(), k2: v.number(), k3: v.boolean()});
const Schema2 = v.partial(Schema1);
const Schema3 = v.partial(v.object({k1: v.string(), k2: v.number(), k3: v.boolean()}));

// make none of the keys optional
const Schema4 = Schema1;
const Schema5 = v.object({key: v.string()});

// make some keys optional
const Schema6 = v.object({k1: v.string(), k2: v.number(), k3: v.boolean()});
const Schema7 = v.partial(Schema6, ["k1", "k3"]);
const Schema8 = v.partial(v.object({k1: v.string(), k2: v.number(), k3: v.boolean()}), ["k2"]);