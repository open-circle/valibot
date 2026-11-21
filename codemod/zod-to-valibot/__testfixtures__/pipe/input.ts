import { z } from "zod";

const A = z.string().pipe(z.number());
const B = z.string().transform(Number).pipe(z.number());
