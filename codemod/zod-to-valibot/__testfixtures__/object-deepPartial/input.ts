import { z } from "zod";

const Schema1 = z.object({k1: z.string(), k2: z.number(), k3: z.boolean()});
const Schema2 = Schema1.deepPartial();
const Schema3 = z.object({k1: z.string(), k2: z.number(), k3: z.boolean()}).deepPartial();