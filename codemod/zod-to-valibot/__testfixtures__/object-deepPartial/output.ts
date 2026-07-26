import * as v from "valibot";

const Schema1 = v.object({k1: v.string(), k2: v.number(), k3: v.boolean()});
const Schema2 = v.deepPartial(Schema1);
const Schema3 = v.deepPartial(v.object({k1: v.string(), k2: v.number(), k3: v.boolean()}));