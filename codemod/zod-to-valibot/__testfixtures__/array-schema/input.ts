import { z } from "zod";

const Schema1 = z.array(z.string());
const Schema2 = z.array(z.string().email());
const Schema3 = z.array(z.string(), {message: "some message"});
const Schema4 = z.array(z.string(), {description: "some description"});
const Schema5 = z.string().array();
const Schema6 = z.string();
const Schema7 = Schema6.array();
const Schema8 = z.string().email().array();
const Schema9 = z.string().email().optional().array();
const Schema10 = z.string().email().array().optional();