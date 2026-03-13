import * as v from "valibot";

const Schema1 = v.record(v.string(), v.number());
const Schema2 = v.record(v.string(), v.number(), "some message");
const Schema3 = v.record(v.string(), v.boolean());
const Schema4 = v.record(v.string(), v.boolean(), "some message");