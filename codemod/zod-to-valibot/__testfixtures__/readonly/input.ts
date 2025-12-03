import { z } from "zod";

const Schema1 = z.array(z.string()).readonly();
const Schema2 = z.map(z.string(), z.date()).readonly();
const Schema3 = z.set(z.string()).min(3).readonly();
const Schema4 = z.object({key: z.string()}).readonly();