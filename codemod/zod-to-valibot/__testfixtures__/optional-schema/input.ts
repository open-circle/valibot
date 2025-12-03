import { z } from "zod";

// optional outside object
const Schema1 = z.string().optional();
const Schema2 = z.optional(z.string());
const Schema3 = z.string();
const Schema4 = Schema3.optional();

// optional inside object
const Schema5 = z.object({key: z.string().optional()});
const Schema6 = z.object({key: z.optional(z.string())});
const Schema7 = z.object({key: z.string().email().optional()});
const Schema8 = z.object({key: z.optional(z.string().email())});
const Schema9 = z.object({key: z.number()});

// get the wrapped schema
const Schema10 = z.number().optional();
const Schema11 = Schema10.unwrap();
