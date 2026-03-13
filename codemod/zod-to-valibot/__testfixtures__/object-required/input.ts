import { z } from "zod";

// make all keys required
const Schema1 = z.object({k1: z.string(), k2: z.number(), k3: z.boolean()}).partial();
const Schema2 = Schema1.required();
const Schema3 = z.object({k1: z.string(), k2: z.number(), k3: z.boolean()}).partial().required();

// make none of the keys required
const Schema4 = Schema1.partial().required({});
const Schema5 = z.object({key: z.string()}).partial().required({});

// make some keys required
const Schema6 = z.object({k1: z.string(), k2: z.number(), k3: z.boolean()}).partial();
const Schema7 = Schema6.required({k1: true, k3: true});
const Schema8 = z.object({k1: z.string(), k2: z.number(), k3: z.boolean()}).partial().required({k2: true});