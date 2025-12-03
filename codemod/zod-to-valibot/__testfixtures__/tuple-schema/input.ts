import { z } from "zod";

const Schema1 = z.tuple([z.string()]);
const Schema2 = z.tuple([z.string()], {message: "some message"});
const Schema3 = z.tuple([z.string()]).rest(z.null());
const Schema4 = z.tuple([z.string()], {message: "some message"}).rest(z.null());
const Schema5 = z.tuple([z.string()], {description: "some description"}).rest(z.null());
const Schema6 = z.tuple([z.string()]);
const Schema7 = Schema6.rest(z.null());