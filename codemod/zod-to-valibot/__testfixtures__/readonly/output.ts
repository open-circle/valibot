import * as v from "valibot";

const Schema1 = v.pipe(v.array(v.string()), v.readonly());
const Schema2 = v.pipe(v.map(v.string(), v.date()), v.readonly());
const Schema3 = v.pipe(v.set(v.string()), v.minSize(3), v.readonly());
const Schema4 = v.pipe(v.object({key: v.string()}), v.readonly());