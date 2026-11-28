import * as v from "valibot";

const Schema1 = v.array(v.string());
const Schema2 = Schema1.item;
const Schema3 = v.array(v.number()).item;
const Schema4 = v.pipe(Schema1.item, v.trim(), v.email());
const Schema5 = v.pipe(v.array(v.string()).item, v.trim(), v.email());
const Schema6 = v.pipe(v.array(v.number()).item, v.minValue(2));
const Schema7 = v.array(v.number());
const Schema8 = v.pipe(Schema7.item, v.maxValue(3));
const Schema9 = v.pipe(Schema7, v.minLength(1));
const Schema10 = v.pipe(v.array(v.array(v.number())).item.item, v.minValue(2));
const Schema11 = v.pipe(v.array(v.array(v.number())).item, v.minLength(2));