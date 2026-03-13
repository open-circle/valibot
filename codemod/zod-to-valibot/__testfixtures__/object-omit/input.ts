import { z } from "zod";

const Schema1 = z.object({k1: z.string(), k2: z.number(), k3: z.boolean()});
const Schema2 = Schema1.omit({k1: true, k3: true});

const Schema3 = z.object({k1: z.string(), k2: z.number(), k3: z.boolean()}).omit({k2: true});

const Schema4 = z.object({key: z.string()}).omit({});

const Schema5 = Schema1.omit({});