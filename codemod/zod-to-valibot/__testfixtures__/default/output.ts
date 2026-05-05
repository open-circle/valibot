import * as v from "valibot";

const Schema1 = v.optional(v.boolean(), false);
const Schema2 = v.optional(v.number(), () => Math.floor(Math.random() * 11));
const Schema3 = v.optional(v.pipe(v.string(), v.trim(), v.email()), "valibot@example.com");
const Schema4 = v.optional(
  v.pipe(v.number(), v.minValue(0), v.maxValue(5)),
  () => Math.floor(Math.random() * 6)
);
const Schema5 = v.object({key: v.optional(v.string(), "Valibot")});