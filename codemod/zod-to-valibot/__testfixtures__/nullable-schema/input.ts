import { z } from "zod";

// nullable outside object
const Schema1 = z.string().nullable();
const Schema2 = z.nullable(z.string());
const Schema3 = z.string();
const Schema4 = Schema3.nullable();

// nullable inside object
const Schema5 = z.object({key: z.string().nullable()});
const Schema6 = z.object({key: z.nullable(z.string())});
const Schema7 = z.object({key: z.string().email().nullable()});
const Schema8 = z.object({key: z.nullable(z.string().email())});
const Schema9 = z.object({key: z.number()});

// get the wrapped schema
const Schema10 = z.number().nullable();
const Schema11 = Schema10.unwrap();
