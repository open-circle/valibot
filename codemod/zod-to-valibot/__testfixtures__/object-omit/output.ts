import * as v from "valibot";

const Schema1 = v.object({k1: v.string(), k2: v.number(), k3: v.boolean()});
const Schema2 = v.omit(Schema1, ["k1", "k3"]);

const Schema3 = v.omit(v.object({k1: v.string(), k2: v.number(), k3: v.boolean()}), ["k2"]);

const Schema4 = v.object({key: v.string()});

const Schema5 = Schema1;