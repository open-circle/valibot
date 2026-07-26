import { z } from "zod";

const Schema1 = z.record(z.number());
const Schema2 = z.record(z.number(), {message: "some message"});
const Schema3 = z.record(z.string(), z.boolean());
const Schema4 = z.record(z.string(), z.boolean(), {message: "some message"});