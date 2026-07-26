import { z } from "zod";

const Schema1 = z.object({key: z.string()}).catchall(z.null());
const Schema2 = z.object({key: z.string()}, {message: "some message"}).catchall(z.null());
const Schema3 = z.object({key: z.string()}, {description: "some description"}).catchall(z.null());
const Schema4 = z.object({key: z.string()});
const Schema5 = Schema4.catchall(z.null());