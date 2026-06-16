import { z } from "zod";

const A = z.string().catch("fallback");
const B = z.number().min(1).catch(0);
const C = z.object({ a: z.string() }).catch({ a: "x" });
