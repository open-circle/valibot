import { z } from "zod";

const Schema1 = z.object({k1: z.string(), k2: z.number(), k3: z.boolean()});
const Schema2 = Schema1.pick({k1: true, k3: true});

const Schema3 = z.object({k1: z.string(), k2: z.number(), k3: z.boolean()}).pick({k2: true});

// todo: const Schema4 = z.object({key: z.string()}).pick({});