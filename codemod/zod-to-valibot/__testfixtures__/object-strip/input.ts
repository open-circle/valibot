import { z } from "zod";

// passthrough
const Schema1 = z.object({key: z.string()}).passthrough().strip();
const Schema2 = z.object({key: z.string()}, {message: "some message"}).passthrough().strip();
const Schema3 = z.object({key: z.string()}, {description: "some description"}).passthrough().strip();
const Schema4 = z.object({key: z.string()}).passthrough();
const Schema5 = Schema4.strip();
const Schema6 = z.object({key: z.string()});
const Schema7 = Schema6.passthrough().strip();

// strict
const Schema8 = z.object({key: z.string()}).strict().strip();
const Schema9 = z.object({key: z.string()}, {message: "some message"}).strict().strip();
const Schema10 = z.object({key: z.string()}, {description: "some description"}).strict().strip();
const Schema11 = z.object({key: z.string()}).strict();
const Schema12 = Schema11.strip();
const Schema13 = z.object({key: z.string()});
const Schema14 = Schema13.strict().strip();