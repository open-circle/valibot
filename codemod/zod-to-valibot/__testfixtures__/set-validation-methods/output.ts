import * as v from "valibot";

const Schema1 = v.pipe(v.set(v.string()), v.minSize(1));
const Schema2 = v.pipe(v.set(v.string()), v.minSize(1, "some message"));
const Schema3 = v.pipe(v.set(v.string()), v.minSize(1, "some message"));
const Schema4 = v.pipe(v.set(v.string()), v.minSize(5));
const Schema5 = v.pipe(v.set(v.string()), v.minSize(5, "some message"));
const Schema6 = v.pipe(v.set(v.string()), v.minSize(5, "some message"));
const Schema7 = v.pipe(v.set(v.string()), v.maxSize(6));
const Schema8 = v.pipe(v.set(v.string()), v.maxSize(6, "some message"));
const Schema9 = v.pipe(v.set(v.string()), v.maxSize(6, "some message"));
const Schema10 = v.pipe(v.set(v.string()), v.size(7));
const Schema11 = v.pipe(v.set(v.string()), v.size(7, "some message"));
const Schema12 = v.pipe(v.set(v.string()), v.size(7, "some message"));