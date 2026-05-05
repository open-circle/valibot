import { z } from "zod";

const Schema1 = z.object({key: z.string()}).passthrough();
const Schema2 = z.object({key: z.string()}, {message: "some message"}).passthrough();
const Schema3 = z.object({key: z.string()}, {description: "some description"}).passthrough();
const Schema4 = z.object({key: z.string()});
const Schema5 = Schema4.passthrough();