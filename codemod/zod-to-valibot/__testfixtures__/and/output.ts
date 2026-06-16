import * as v from "valibot";

const A = v.intersect([v.string(), v.number()]);
const B = v.intersect([v.object({ a: v.string() }), v.object({ b: v.number() })]);
