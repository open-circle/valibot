import * as v from "valibot";

const Schema1 = v.object({k1: v.string(), k2: v.number(), k3: v.boolean()});
const Schema2 = v.pick(Schema1, ["k1", "k3"]);

const Schema3 = v.pick(v.object({k1: v.string(), k2: v.number(), k3: v.boolean()}), ["k2"]);

// todo: const Schema4 = z.object({key: z.string()}).pick({});