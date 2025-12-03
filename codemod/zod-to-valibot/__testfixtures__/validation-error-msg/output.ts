import * as v from "valibot";

const Schema1 = v.pipe(v.string(), v.email("invalid email address"));
const Schema2 = v.pipe(v.string(), v.url("invalid url"));
const Schema3 = v.pipe(v.string(), v.length(5, "must be exactly 5 characters long"));
const Schema4 = v.pipe(v.string(), v.startsWith("https://", "must provide secure url"));