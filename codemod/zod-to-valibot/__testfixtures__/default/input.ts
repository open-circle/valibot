import { z } from "zod";

const Schema1 = z.boolean().default(false);
const Schema2 = z.number().default(() => Math.floor(Math.random() * 11));
const Schema3 = z.string().trim().email().default("valibot@example.com");
const Schema4 = z.number().min(0).max(5).default(() => Math.floor(Math.random() * 6));
const Schema5 = z.object({key: z.string().default("Valibot")});