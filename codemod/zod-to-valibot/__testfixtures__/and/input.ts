import { z } from "zod";

const A = z.string().and(z.number());
const B = z.object({ a: z.string() }).and(z.object({ b: z.number() }));
