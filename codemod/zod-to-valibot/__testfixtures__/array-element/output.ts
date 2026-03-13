import * as v from "valibot";

const Schema1 = v.array(v.string());
const Schema2 = Schema1.item;
const Schema3 = v.array(v.number()).item;
const Schema4 = v.pipe(Schema1.item, v.trim(), v.email());
const Schema5 = v.pipe(v.array(v.string()).item, v.trim(), v.email());