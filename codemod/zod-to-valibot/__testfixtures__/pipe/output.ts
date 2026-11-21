import * as v from "valibot";

const A = v.pipe(v.string(), v.number());
const B = v.pipe(v.pipe(v.string(), v.transform(Number)), v.number());
