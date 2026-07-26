import { z } from "zod";

const Schema1 = z.literal("valibot");
const Schema2 = z.literal("valibot", {message: 'should be "valibot"'});
const Schema3 = z.literal(123);
const Schema4 = z.literal(Symbol("someSymbol"));
const Schema5 = z.literal(321n);
const Schema6 = z.literal(true);
const Schema7 = z.literal(null);
const Schema8 = z.literal(null, {message: "should be null"});
const Schema9 = z.literal(undefined);
const Schema10 = z.literal(undefined, {message: "should be undefined"});