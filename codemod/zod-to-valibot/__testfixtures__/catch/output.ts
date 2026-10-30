import * as v from "valibot";

const A = v.fallback(v.string(), "fallback");
const B = v.fallback(v.pipe(v.number(), v.minValue(1)), 0);
const C = v.fallback(v.object({ a: v.string() }), { a: "x" });
