import { z } from "zod";

// nullish outside object
const Schema1 = z.string().nullish();
const Schema2 = z.string();
const Schema3 = Schema2.nullish();

// nullish inside object
const Schema4 = z.object({key: z.string().nullish()});
const Schema5 = z.object({key: z.string().email().nullish()});
const Schema6 = z.object({key: z.number()});

// get the wrapped schema
const Schema7 = z.number().nullish();
const Schema8 = Schema7.unwrap();
const Schema9 = Schema7.unwrap().unwrap();